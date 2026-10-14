import os
import boto3
import time
from dotenv import load_dotenv

load_dotenv()

key_id = os.getenv('AWS_ACCESS_KEY_ID')
secret = os.getenv('AWS_SECRET_ACCESS_KEY')
region = os.getenv('AWS_REGION', 'ap-south-1')

session = boto3.Session(
    aws_access_key_id=key_id,
    aws_secret_access_key=secret,
    region_name=region
)
ec2 = session.client('ec2')
rds = session.client('rds')

print(f"==================================================")
print(f"Provisioning CloudTwin Network Infrastructure ({region})")
print(f"==================================================\n")

# 1. Create / Retrieve VPC
vpc_cidr = "10.0.0.0/16"
vpc_name = "cloudtwin-vpc"

vpcs = ec2.describe_vpcs().get('Vpcs', [])
cloudtwin_vpc = None
for v in vpcs:
    name = next((t['Value'] for t in v.get('Tags', []) if t['Key'] == 'Name'), None)
    if name == vpc_name:
        cloudtwin_vpc = v
        break

if cloudtwin_vpc:
    vpc_id = cloudtwin_vpc['VpcId']
    print(f"[VPC] Existing {vpc_name} found: {vpc_id}")
else:
    print(f"[VPC] Creating new VPC ({vpc_cidr})...")
    vpc_res = ec2.create_vpc(
        CidrBlock=vpc_cidr,
        TagSpecifications=[{
            'ResourceType': 'vpc',
            'Tags': [
                {'Key': 'Name', 'Value': vpc_name},
                {'Key': 'Project', 'Value': 'CloudTwin'},
                {'Key': 'Environment', 'Value': 'production'}
            ]
        }]
    )
    vpc_id = vpc_res['Vpc']['VpcId']
    print(f"[VPC] Created VPC: {vpc_id}")

# Enable DNS Hostnames and Resolution
ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsHostnames={'Value': True})
ec2.modify_vpc_attribute(VpcId=vpc_id, EnableDnsSupport={'Value': True})
print(f"[VPC] Enabled DNS Hostnames & DNS Support on {vpc_id}")

# 2. Internet Gateway
igws = ec2.describe_internet_gateways().get('InternetGateways', [])
cloudtwin_igw_id = None
for igw in igws:
    name = next((t['Value'] for t in igw.get('Tags', []) if t['Key'] == 'Name'), None)
    attached = [a['VpcId'] for a in igw.get('Attachments', [])]
    if name == "cloudtwin-igw" or vpc_id in attached:
        cloudtwin_igw_id = igw['InternetGatewayId']
        if vpc_id not in attached:
            ec2.attach_internet_gateway(InternetGatewayId=cloudtwin_igw_id, VpcId=vpc_id)
            print(f"[IGW] Attached {cloudtwin_igw_id} to VPC {vpc_id}")
        else:
            print(f"[IGW] Existing IGW attached: {cloudtwin_igw_id}")
        break

if not cloudtwin_igw_id:
    print(f"[IGW] Creating Internet Gateway...")
    igw_res = ec2.create_internet_gateway(
        TagSpecifications=[{
            'ResourceType': 'internet-gateway',
            'Tags': [
                {'Key': 'Name', 'Value': 'cloudtwin-igw'},
                {'Key': 'Project', 'Value': 'CloudTwin'}
            ]
        }]
    )
    cloudtwin_igw_id = igw_res['InternetGateway']['InternetGatewayId']
    ec2.attach_internet_gateway(InternetGatewayId=cloudtwin_igw_id, VpcId=vpc_id)
    print(f"[IGW] Created and attached IGW: {cloudtwin_igw_id}")

# 3. Subnets Configuration
# 2 AZs: ap-south-1a and ap-south-1b
subnets_config = [
    {
        'Name': 'cloudtwin-public-subnet-1a',
        'Cidr': '10.0.0.0/20',
        'AZ': f'{region}a',
        'IsPublic': True
    },
    {
        'Name': 'cloudtwin-public-subnet-1b',
        'Cidr': '10.0.16.0/20',
        'AZ': f'{region}b',
        'IsPublic': True
    },
    {
        'Name': 'cloudtwin-private-app-subnet-1a',
        'Cidr': '10.0.128.0/20',
        'AZ': f'{region}a',
        'IsPublic': False
    },
    {
        'Name': 'cloudtwin-private-app-subnet-1b',
        'Cidr': '10.0.144.0/20',
        'AZ': f'{region}b',
        'IsPublic': False
    },
    {
        'Name': 'cloudtwin-private-db-subnet-1a',
        'Cidr': '10.0.160.0/20',
        'AZ': f'{region}a',
        'IsPublic': False
    },
    {
        'Name': 'cloudtwin-private-db-subnet-1b',
        'Cidr': '10.0.176.0/20',
        'AZ': f'{region}b',
        'IsPublic': False
    }
]

existing_subnets = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).get('Subnets', [])
created_subnets = {}

for cfg in subnets_config:
    found = None
    for s in existing_subnets:
        name = next((t['Value'] for t in s.get('Tags', []) if t['Key'] == 'Name'), None)
        if name == cfg['Name'] or s['CidrBlock'] == cfg['Cidr']:
            found = s
            break
            
    if found:
        s_id = found['SubnetId']
        print(f"[Subnet] Existing {cfg['Name']} found: {s_id} ({cfg['Cidr']}, {cfg['AZ']})")
    else:
        print(f"[Subnet] Creating {cfg['Name']} ({cfg['Cidr']} in {cfg['AZ']})...")
        res = ec2.create_subnet(
            VpcId=vpc_id,
            CidrBlock=cfg['Cidr'],
            AvailabilityZone=cfg['AZ'],
            TagSpecifications=[{
                'ResourceType': 'subnet',
                'Tags': [
                    {'Key': 'Name', 'Value': cfg['Name']},
                    {'Key': 'Project', 'Value': 'CloudTwin'}
                ]
            }]
        )
        s_id = res['Subnet']['SubnetId']
        print(f"[Subnet] Created {cfg['Name']}: {s_id}")
        
    if cfg['IsPublic']:
        ec2.modify_subnet_attribute(SubnetId=s_id, MapPublicIpOnLaunch={'Value': True})

    created_subnets[cfg['Name']] = {
        'id': s_id,
        'cidr': cfg['Cidr'],
        'az': cfg['AZ'],
        'is_public': cfg['IsPublic']
    }

# 4. Route Tables
# Public Route Table
rts = ec2.describe_route_tables(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).get('RouteTables', [])
public_rt_id = None
for rt in rts:
    name = next((t['Value'] for t in rt.get('Tags', []) if t['Key'] == 'Name'), None)
    if name == 'cloudtwin-public-rt':
        public_rt_id = rt['RouteTableId']
        break

if not public_rt_id:
    print(f"[RouteTable] Creating cloudtwin-public-rt...")
    rt_res = ec2.create_route_table(
        VpcId=vpc_id,
        TagSpecifications=[{
            'ResourceType': 'route-table',
            'Tags': [
                {'Key': 'Name', 'Value': 'cloudtwin-public-rt'},
                {'Key': 'Project', 'Value': 'CloudTwin'}
            ]
        }]
    )
    public_rt_id = rt_res['RouteTable']['RouteTableId']
    # Add route to IGW
    ec2.create_route(
        RouteTableId=public_rt_id,
        DestinationCidrBlock='0.0.0.0/0',
        GatewayId=cloudtwin_igw_id
    )
    print(f"[RouteTable] Created public route table {public_rt_id} with 0.0.0.0/0 -> {cloudtwin_igw_id}")
else:
    print(f"[RouteTable] Existing public route table found: {public_rt_id}")

# Associate public subnets
for name, s_info in created_subnets.items():
    if s_info['is_public']:
        try:
            ec2.associate_route_table(RouteTableId=public_rt_id, SubnetId=s_info['id'])
            print(f"[RouteTable] Associated {name} ({s_info['id']}) to {public_rt_id}")
        except Exception as e:
            # Might already be associated
            pass

# 5. Security Groups
existing_sgs = ec2.describe_security_groups(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]).get('SecurityGroups', [])

def get_or_create_sg(name, desc):
    for sg in existing_sgs:
        if sg['GroupName'] == name:
            print(f"[SG] Existing {name} found: {sg['GroupId']}")
            return sg['GroupId']
    print(f"[SG] Creating security group {name}...")
    res = ec2.create_security_group(
        GroupName=name,
        Description=desc,
        VpcId=vpc_id,
        TagSpecifications=[{
            'ResourceType': 'security-group',
            'Tags': [
                {'Key': 'Name', 'Value': name},
                {'Key': 'Project', 'Value': 'CloudTwin'}
            ]
        }]
    )
    sg_id = res['GroupId']
    print(f"[SG] Created {name}: {sg_id}")
    return sg_id

alb_sg_id = get_or_create_sg('cloudtwin-alb-sg', 'CloudTwin ALB Public Security Group')
ec2_sg_id = get_or_create_sg('cloudtwin-ec2-sg', 'CloudTwin EC2 & Application Security Group')
db_sg_id  = get_or_create_sg('cloudtwin-db-sg',  'CloudTwin PostgreSQL Database Security Group')

# Inbound rules
# ALB SG: Port 80 & 443
try:
    ec2.authorize_security_group_ingress(
        GroupId=alb_sg_id,
        IpPermissions=[
            {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 443, 'ToPort': 443, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
        ]
    )
    print(f"[SG Rules] Added HTTP/HTTPS ingress to {alb_sg_id}")
except Exception:
    pass

# EC2 SG: Port 22, 80, 443, 8000, 3000
try:
    ec2.authorize_security_group_ingress(
        GroupId=ec2_sg_id,
        IpPermissions=[
            {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 443, 'ToPort': 443, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 8000, 'ToPort': 8000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 3000, 'ToPort': 3000, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
        ]
    )
    print(f"[SG Rules] Added SSH/HTTP/HTTPS/8000/3000 ingress to {ec2_sg_id}")
except Exception:
    pass

# DB SG: Port 5432 from EC2 SG & 0.0.0.0/0 (for local dev setup)
try:
    ec2.authorize_security_group_ingress(
        GroupId=db_sg_id,
        IpPermissions=[
            {'IpProtocol': 'tcp', 'FromPort': 5432, 'ToPort': 5432, 'UserIdGroupPairs': [{'GroupId': ec2_sg_id}]},
            {'IpProtocol': 'tcp', 'FromPort': 5432, 'ToPort': 5432, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
        ]
    )
    print(f"[SG Rules] Added Port 5432 ingress to {db_sg_id}")
except Exception:
    pass

# 6. RDS DB Subnet Group
db_subnet_ids = [
    created_subnets['cloudtwin-private-db-subnet-1a']['id'],
    created_subnets['cloudtwin-private-db-subnet-1b']['id']
]

try:
    print(f"[DB Subnet Group] Creating cloudtwin-db-subnet-group...")
    rds.create_db_subnet_group(
        DBSubnetGroupName='cloudtwin-db-subnet-group-v2',
        DBSubnetGroupDescription='CloudTwin RDS Multi-AZ Database Subnet Group',
        SubnetIds=db_subnet_ids,
        Tags=[{'Key': 'Project', 'Value': 'CloudTwin'}]
    )
    print(f"[DB Subnet Group] Created cloudtwin-db-subnet-group-v2 with subnets: {db_subnet_ids}")
except rds.exceptions.DBSubnetGroupAlreadyExistsFault:
    print(f"[DB Subnet Group] cloudtwin-db-subnet-group-v2 already exists.")
except Exception as e:
    print(f"[DB Subnet Group] Notice: {e}")

print("\n==================================================")
print("CloudTwin Network Provisioning Complete!")
print(f"VPC ID: {vpc_id}")
print(f"Internet Gateway: {cloudtwin_igw_id}")
print(f"Public Route Table: {public_rt_id}")
print(f"ALB Security Group: {alb_sg_id}")
print(f"EC2 Security Group: {ec2_sg_id}")
print(f"DB Security Group:  {db_sg_id}")
print("Subnets:")
for name, s_info in created_subnets.items():
    print(f"  - {name}: {s_info['id']} ({s_info['cidr']}, {s_info['az']})")
print("==================================================")
