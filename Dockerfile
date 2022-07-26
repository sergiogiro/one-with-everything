FROM python:3.9.13-bullseye


## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

RUN apt update
RUN apt install -y libpq-dev postgresql-common

COPY requirements.txt /
RUN pip install -r /requirements.txt

COPY ./backend /backend

COPY ./frontend/build /frontend_build

ENTRYPOINT /backend/start_backend.sh
