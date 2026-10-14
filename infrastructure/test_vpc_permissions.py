import os
import boto3
from dotenv import load_dotenv

load_dotenv()

session = boto3.Session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'ap-south-1')
)
ec2 = session.client('ec2')

print("Testing EC2 & VPC Permissions...")

try:
    subnets = ec2.describe_subnets()
    print(f"DescribeSubnets: Success! Found {len(subnets.get('Subnets', []))} subnets.")
    for s in subnets.get('Subnets', []):
        name_tag = next((t['Value'] for t in s.get('Tags', []) if t['Key'] == 'Name'), 'N/A')
        print(f"  - SubnetId: {s['SubnetId']}, VPC: {s['VpcId']}, CIDR: {s['CidrBlock']}, AZ: {s['AvailabilityZone']}, Name: {name_tag}")
except Exception as e:
    print(f"DescribeSubnets Error: {e}")

try:
    igws = ec2.describe_internet_gateways()
    print(f"\nDescribeInternetGateways: Success! Found {len(igws.get('InternetGateways', []))} IGWs.")
    for igw in igws.get('InternetGateways', []):
        vpcs = [v['VpcId'] for v in igw.get('Attachments', [])]
        print(f"  - IGW: {igw['InternetGatewayId']}, Attached VPCs: {vpcs}")
except Exception as e:
    print(f"DescribeInternetGateways Error: {e}")

try:
    rts = ec2.describe_route_tables()
    print(f"\nDescribeRouteTables: Success! Found {len(rts.get('RouteTables', []))} route tables.")
except Exception as e:
    print(f"DescribeRouteTables Error: {e}")
