.PHONY: all
all: requirements.txt frontend
	docker compose build

.PHONY: deploy
deploy:
	heroku container:push -a sergio-kaller web
	( cd celery && heroku container:push -a sergio-kaller worker )
	heroku container:release -a sergio-kaller web
	( cd celery && heroku container:release -a sergio-kaller worker )

.PHONY: frontend
frontend:
	( cd frontend && yarn build )

.PHONY: backend
backend: requirements.txt
	docker compose build

requirements.txt: Pipfile Pipfile.lock
	pipenv lock -r > requirements.txt
