import os
import boto3
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

print(f"=== AWS Account Inspection ({region}) ===")

# 1. S3 Buckets
s3 = session.client('s3')
try:
    buckets = s3.list_buckets()
    print("\n--- S3 Buckets ---")
    for b in buckets.get('Buckets', []):
        print(f"  - {b['Name']} (Created: {b['CreationDate']})")
except Exception as e:
    print(f"S3 List Error: {e}")

# 2. DynamoDB Tables
dynamodb = session.client('dynamodb')
try:
    tables = dynamodb.list_tables()
    print("\n--- DynamoDB Tables ---")
    for t in tables.get('TableNames', []):
        print(f"  - {t}")
except Exception as e:
    print(f"DynamoDB List Error: {e}")

# 3. RDS Instances
rds = session.client('rds')
try:
    dbs = rds.describe_db_instances()
    print("\n--- RDS Instances ---")
    for db in dbs.get('DBInstances', []):
        print(f"  - {db['DBInstanceIdentifier']} | Status: {db['DBInstanceStatus']} | Endpoint: {db.get('Endpoint', {}).get('Address')}")
except Exception as e:
    print(f"RDS List Error: {e}")

# 4. EC2 Instances & Security Groups
ec2 = session.client('ec2')
try:
    vpcs = ec2.describe_vpcs()
    print("\n--- VPCs ---")
    for v in vpcs.get('Vpcs', []):
        name_tag = next((t['Value'] for t in v.get('Tags', []) if t['Key'] == 'Name'), 'N/A')
        print(f"  - {v['VpcId']} (CIDR: {v['CidrBlock']}, Name: {name_tag}, IsDefault: {v.get('IsDefault')})")

    sgs = ec2.describe_security_groups()
    print("\n--- Security Groups ---")
    for sg in sgs.get('SecurityGroups', []):
        print(f"  - {sg['GroupId']}: {sg['GroupName']} (VPC: {sg.get('VpcId')})")

    instances = ec2.describe_instances()
    print("\n--- EC2 Instances ---")
    for r in instances.get('Reservations', []):
        for inst in r.get('Instances', []):
            name_tag = next((t['Value'] for t in inst.get('Tags', []) if t['Key'] == 'Name'), 'N/A')
            print(f"  - {inst['InstanceId']} | Name: {name_tag} | State: {inst['State']['Name']} | PublicIP: {inst.get('PublicIpAddress')}")
except Exception as e:
    print(f"EC2 List Error: {e}")
