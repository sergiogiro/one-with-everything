import os
import time

from celery.states import FAILURE as CELERY_FAILURE

import backend.settings
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend", backend="redis://redis")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True)
def generate_todos_task(self):
    # TODO: perhaps if code is restructured to have all of celery in a specific
    #   directory, it'd be tidier to put these imports at the beginning.
    #   Currently, they fail to import since Django isn't fully loaded yet.
    from todo.models import TaskGeneratedTodo, Todo

    end = -1
    try:
        for i, todo in enumerate(Todo.objects.order_by("-id").all()):
            print(f"[{self.request.id}]: Creating {i}")
            TaskGeneratedTodo.objects.create(
                task_id=self.request.id, todo_id=todo, sequence_number=i
            )
            end = i
            time.sleep(1)
    except InterruptedError as exc:
        print(f"Failed: {exc}")
        self.update_state(status=CELERY_FAILURE, meta={"error": {"message": str(exc)}})
    return {"end": end}
