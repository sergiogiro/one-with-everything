# todo/models.py

import time
import uuid

from django.core.files.storage import storages as storages_from_settings
from django.db import models


def _select_storage():
    return storages_from_settings["images"]


# Create your models here.

# add this
class Todo(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)
    depiction = models.ImageField(
        null=True,
        storage=_select_storage,
        upload_to=f"{time.time()}-{uuid.uuid4()}",
    )

    def __str__(self):
        return self.title
