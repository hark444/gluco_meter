import logging
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError


def upload_to_s3(file_path, bucket_name, object_name):
    """
    Uploads a file to an S3 bucket.
    """
    s3_client = boto3.client('s3')
    try:
        s3_client.upload_file(file_path, bucket_name, object_name)
        logging.info(f"Successfully uploaded {file_path} to {bucket_name}/{object_name}")
        return True
    except FileNotFoundError:
        logging.error(f"The file {file_path} was not found")
        return False
    except (NoCredentialsError, PartialCredentialsError):
        logging.error("AWS credentials not found. Please configure your credentials.")
        return False
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return False
