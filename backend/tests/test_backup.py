import unittest
import sys
import os
from unittest.mock import patch, MagicMock

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.backup import upload_to_s3

class TestBackup(unittest.TestCase):

    @patch('app.core.backup.boto3.client')
    def test_upload_to_s3_success(self, mock_boto3_client):
        # Arrange
        mock_s3_client = MagicMock()
        mock_boto3_client.return_value = mock_s3_client

        file_path = "test.db"
        bucket_name = "test-bucket"
        object_name = "test.db"

        with open(file_path, "w") as f:
            f.write("test data")

        # Act
        result = upload_to_s3(file_path, bucket_name, object_name)

        # Assert
        self.assertTrue(result)
        mock_s3_client.upload_file.assert_called_once_with(file_path, bucket_name, object_name)

        import os
        os.remove(file_path)

    @patch('app.core.backup.boto3.client')
    def test_upload_to_s3_file_not_found(self, mock_boto3_client):
        # Arrange
        mock_s3_client = MagicMock()
        mock_s3_client.upload_file.side_effect = FileNotFoundError
        mock_boto3_client.return_value = mock_s3_client

        file_path = "non_existent_file.db"
        bucket_name = "test-bucket"
        object_name = "test.db"

        # Act
        result = upload_to_s3(file_path, bucket_name, object_name)

        # Assert
        self.assertFalse(result)
        mock_s3_client.upload_file.assert_called_once_with(file_path, bucket_name, object_name)

if __name__ == '__main__':
    unittest.main()
