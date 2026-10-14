import os
import boto3
from dotenv import load_dotenv

load_dotenv()
ec2 = boto3.client(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'ap-south-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

vpc_id = 'vpc-0677b15b322394866'
rts = ec2.describe_route_tables(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['RouteTables']

# Get subnets to map names
subnets = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['Subnets']
subnet_names = {}
for s in subnets:
    name = next((t['Value'] for t in s.get('Tags', []) if t['Key'] == 'Name'), 'Unnamed')
    subnet_names[s['SubnetId']] = f"{name} ({s['CidrBlock']})"

print(f"=== Route Tables for VPC {vpc_id} ===\n")
for rt in rts:
    rt_id = rt['RouteTableId']
    name = next((t['Value'] for t in rt.get('Tags', []) if t['Key'] == 'Name'), 'Main (Default) Route Table')
    print(f"Route Table ID: {rt_id}")
    print(f"Name Tag:       {name}")
    print("Associations:")
    for a in rt.get('Associations', []):
        sub_id = a.get('SubnetId')
        is_main = a.get('Main', False)
        assoc_id = a.get('RouteTableAssociationId')
        if is_main:
            print(f"  * Main Association for VPC: {assoc_id} (All subnets without explicit association use this)")
        else:
            sub_label = subnet_names.get(sub_id, sub_id)
            print(f"  * Explicit Subnet Association: {assoc_id} -> {sub_id} [{sub_label}]")
            
    print("Routes:")
    for r in rt.get('Routes', []):
        dest = r.get('DestinationCidrBlock')
        target = r.get('GatewayId', 'local')
        state = r.get('State')
        print(f"  * Destination: {dest:<16} Target: {target:<24} State: {state}")
    print("-" * 60)
