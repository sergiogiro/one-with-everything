FROM python:3.9.13-bullseye

RUN apt update
RUN apt install -y libpq-dev postgresql-common

COPY requirements.txt /
RUN pip install -r /requirements.txt

COPY ./backend /backend

COPY ./frontend/build /frontend_build

ENTRYPOINT /backend/start_backend.sh
