#!/bin/bash

[[ "$DEBUG" ]] && /wait

export PYTHONPATH=$PYTHONPATH:/backend/

python /backend/manage.py collectstatic --noinput

python /backend/manage.py migrate --noinput

if [[ "$DEBUG" ]]; then
    PYTHONUNBUFFERED=1 python /backend/manage.py runserver 0.0.0.0:8000; sleep inf
else
    gunicorn backend.wsgi
fi
