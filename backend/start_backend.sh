#!/bin/bash

export PYTHONPATH=$PYTHONPATH:/backend/

python /backend/manage.py collectstatic --noinput

python /backend/manage.py migrate --noinput

gunicorn --bind "0.0.0.0:8000" backend.wsgi
