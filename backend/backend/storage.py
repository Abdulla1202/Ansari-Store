from cloudinary_storage.storage import MediaCloudinaryStorage
from django.core.files.storage import FileSystemStorage
import logging

logger = logging.getLogger(__name__)

class SafeMediaStorage(MediaCloudinaryStorage):
    """
    A resilient Cloudinary media storage backend.
    Uploads directly to Cloudinary so images are permanently saved in the cloud.
    If Cloudinary is temporarily unreachable, it safely falls back to local disk storage
    so product creation and updates NEVER crash.
    """
    def _save(self, name, content):
        try:
            return super()._save(name, content)
        except Exception as e:
            logger.error(f"Cloudinary upload failed for '{name}': {e}. Falling back to FileSystemStorage.")
            fs = FileSystemStorage()
            return fs._save(name, content)

    def url(self, name):
        try:
            fs = FileSystemStorage()
            if fs.exists(name):
                return fs.url(name)
            return super().url(name)
        except Exception:
            return FileSystemStorage().url(name)

    def exists(self, name):
        try:
            if FileSystemStorage().exists(name):
                return True
            return super().exists(name)
        except Exception:
            return FileSystemStorage().exists(name)

    def delete(self, name):
        try:
            if FileSystemStorage().exists(name):
                FileSystemStorage().delete(name)
        except Exception:
            pass
        try:
            super().delete(name)
        except Exception:
            pass
