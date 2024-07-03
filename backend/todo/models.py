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


class TaskGeneratedTodo(models.Model):
    task_id = models.CharField(max_length=120)
    todo_id = models.ForeignKey("Todo", on_delete=models.CASCADE)
    sequence_number = models.IntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["task_id", "sequence_number"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["task_id", "sequence_number"],
                name="unique_sequence_number_for_task",
            ),
        ]

    def __str__(self):
        return f"{self.task_id} - {self.todo_id} - {self.sequence_number}"
