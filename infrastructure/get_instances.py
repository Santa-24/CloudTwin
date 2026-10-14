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

res = ec2.describe_instances()
print("=== EC2 Instances in ap-south-1 ===")
for r in res.get('Reservations', []):
    for i in r.get('Instances', []):
        name = next((t['Value'] for t in i.get('Tags', []) if t['Key'] == 'Name'), 'Unnamed')
        ip = i.get('PublicIpAddress', 'No Public IP')
        priv_ip = i.get('PrivateIpAddress')
        key = i.get('KeyName')
        vpc_id = i.get('VpcId')
        subnet_id = i.get('SubnetId')
        sg = [g['GroupName'] for g in i.get('SecurityGroups', [])]
        print(f"ID: {i['InstanceId']} | Name: {name} | State: {i['State']['Name']}")
        print(f"  Public IP:  {ip}")
        print(f"  Private IP: {priv_ip}")
        print(f"  Key Name:   {key}")
        print(f"  VPC / Sub:  {vpc_id} / {subnet_id}")
        print(f"  Sec Groups: {sg}")
        print("-" * 50)
