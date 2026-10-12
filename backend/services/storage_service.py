"""
CloudTwin Storage Service
Manages file uploads/downloads via Amazon S3 buckets:
- cloudtwin-avatars
- cloudtwin-project-assets
- cloudtwin-architecture-exports
- cloudtwin-reports
Provides high-availability local storage fallback when running in offline/demo mode.
"""
import os
import uuid
import logging
from typing import Optional, Dict, Any
from backend.core.config import settings

logger = logging.getLogger(__name__)
LOCAL_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage_data")

class StorageService:
    def __init__(self):
        self.s3_bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        self.mock_mode = settings.AWS_MOCK_MODE
        
        os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
        for bucket in ["avatars", "project-assets", "architecture-exports", "reports"]:
            os.makedirs(os.path.join(LOCAL_STORAGE_DIR, bucket), exist_ok=True)

    async def upload_file(self, bucket: str, path: str, content: bytes, content_type: str = "application/octet-stream") -> Dict[str, Any]:
        """
        Uploads a file to Amazon S3, or stores locally if in demo/mock mode.
        """
        # Save locally as reliable fallback/cache
        bucket_dir = os.path.join(LOCAL_STORAGE_DIR, bucket)
        file_path = os.path.join(bucket_dir, path.replace("/", "_"))
        
        with open(file_path, "wb") as f:
            f.write(content)

        # In live mode with real AWS credentials
        if self.access_key and self.secret_key and not self.mock_mode:
            try:
                import boto3
                s3_client = boto3.client(
                    "s3",
                    region_name=self.region,
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key
                )
                s3_key = f"{bucket}/{path}"
                s3_client.put_object(
                    Bucket=self.s3_bucket,
                    Key=s3_key,
                    Body=content,
                    ContentType=content_type
                )
                s3_url = f"https://{self.s3_bucket}.s3.{self.region}.amazonaws.com/{s3_key}"
                return {"success": True, "url": s3_url, "path": path, "bucket": bucket}
            except Exception as e:
                logger.warning(f"AWS S3 upload failed ({e}). Falling back to local storage.")

        # Return local/mock URL
        local_url = f"/api/storage/{bucket}/{path.replace('/', '_')}"
        return {"success": True, "url": local_url, "path": path, "bucket": bucket}

    async def get_file(self, bucket: str, path: str) -> Optional[bytes]:
        bucket_dir = os.path.join(LOCAL_STORAGE_DIR, bucket)
        file_path = os.path.join(bucket_dir, path.replace("/", "_"))
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                return f.read()
        return None

storage_service = StorageService()
