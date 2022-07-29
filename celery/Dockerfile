# If using Heroku, Can't just change the entrypoint
# in docker-compose.yml because otherwise there's
# no way to tell Heroku what's the entrypoint.

FROM sergio-giro/todo_backend

COPY start_celery.sh /

WORKDIR /backend

ENTRYPOINT /start_celery.sh
