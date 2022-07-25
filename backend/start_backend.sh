#!/bin/bash



export PYTHONPATH=$PYTHONPATH:/backend/

python /backend/manage.py collectstatic --noinput

python /backend/manage.py migrate --noinput

if [[ "$DEBUG" ]]; then
    gunicorn --bind "0.0.0.0:80" backend.wsgi
else
    gunicorn backend.wsgi
fi
