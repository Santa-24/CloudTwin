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
main_rt_id = 'rtb-053db53e88b13e10b'

# 1. Tag main route table
ec2.create_tags(
    Resources=[main_rt_id],
    Tags=[
        {'Key': 'Name', 'Value': 'cloudtwin-private-rt'},
        {'Key': 'Project', 'Value': 'CloudTwin'},
        {'Key': 'Tier', 'Value': 'Private'}
    ]
)
print(f"Tagged {main_rt_id} as cloudtwin-private-rt")

# 2. Explicitly associate private subnets
private_subnets = [
    'subnet-0f572d553a31b07e2',
    'subnet-082263d797ae2649b',
    'subnet-0d695dfe64cdf730d',
    'subnet-034968aaf7eec8cc1'
]

for s_id in private_subnets:
    try:
        assoc = ec2.associate_route_table(RouteTableId=main_rt_id, SubnetId=s_id)
        assoc_id = assoc['RouteTableAssociationId']
        print(f"Associated {s_id} -> {assoc_id}")
    except Exception as e:
        print(f"Association for {s_id}: {e}")

print("\nFinished private route table configuration.")
