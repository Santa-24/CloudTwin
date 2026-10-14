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

print(f"Provisioning CloudTwin AWS Resources in region: {region}...\n")

# 1. Provision S3 Buckets
s3 = session.client('s3')
buckets_to_create = [
    os.getenv('AWS_S3_BUCKET', 'cloudtwin-architecture-vault-santanu-8831'),
    os.getenv('AWS_S3_REPORTS_BUCKET', 'cloudtwin-reports-vault-santanu-8831')
]

for b_name in buckets_to_create:
    try:
        print(f"Creating S3 Bucket: {b_name}...")
        if region == 'us-east-1':
            s3.create_bucket(Bucket=b_name)
        else:
            s3.create_bucket(
                Bucket=b_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        print(f"  -> Successfully created bucket: {b_name}")
    except s3.exceptions.BucketAlreadyOwnedByYou:
        print(f"  -> Bucket {b_name} already exists and is owned by you.")
    except Exception as e:
        print(f"  -> Bucket creation notice/error: {e}")

    # Enable versioning
    try:
        s3.put_bucket_versioning(
            Bucket=b_name,
            VersioningConfiguration={'Status': 'Enabled'}
        )
        print(f"  -> Enabled versioning on {b_name}")
    except Exception as e:
        print(f"  -> Error enabling versioning: {e}")

# 2. Provision DynamoDB Tables
dynamodb = session.client('dynamodb')

# Table 1: CloudTwinSimulationEvents
table1_name = os.getenv('DYNAMODB_TABLE_SIMULATIONS', 'CloudTwinSimulationEvents')
try:
    print(f"\nCreating DynamoDB Table: {table1_name}...")
    dynamodb.create_table(
        TableName=table1_name,
        KeySchema=[
            {'AttributeName': 'simulation_id', 'KeyType': 'HASH'},
            {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'simulation_id', 'AttributeType': 'S'},
            {'AttributeName': 'timestamp', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST'
    )
    print(f"  -> Successfully requested creation of {table1_name}")
except dynamodb.exceptions.ResourceInUseException:
    print(f"  -> Table {table1_name} already exists.")
except Exception as e:
    print(f"  -> Error creating {table1_name}: {e}")

# Table 2: cloudtwin_architectures
table2_name = "cloudtwin_architectures"
try:
    print(f"\nCreating DynamoDB Table: {table2_name}...")
    dynamodb.create_table(
        TableName=table2_name,
        KeySchema=[
            {'AttributeName': 'project_id', 'KeyType': 'HASH'},
            {'AttributeName': 'architecture_id', 'KeyType': 'RANGE'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'project_id', 'AttributeType': 'S'},
            {'AttributeName': 'architecture_id', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST'
    )
    print(f"  -> Successfully requested creation of {table2_name}")
except dynamodb.exceptions.ResourceInUseException:
    print(f"  -> Table {table2_name} already exists.")
except Exception as e:
    print(f"  -> Error creating {table2_name}: {e}")

print("\n=== Verification ===")
existing_buckets = [b['Name'] for b in s3.list_buckets().get('Buckets', [])]
print(f"S3 Buckets in account: {existing_buckets}")

existing_tables = dynamodb.list_tables().get('TableNames', [])
print(f"DynamoDB Tables in account: {existing_tables}")
