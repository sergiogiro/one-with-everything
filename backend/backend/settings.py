"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 2.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import logging
import os

import dj_database_url

logger = logging.getLogger(__name__)

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "").lower() not in ("false", "0")

ALLOWED_HOSTS = ["*"] if DEBUG else ["real-url.com"]


# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",  # add this
    "rest_framework",  # add this
    "todo",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # add this
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Extra places for collectstatic to find static files.
STATICFILES_DIRS = (os.path.join(os.path.dirname(BASE_DIR), "frontend_build"),)

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = "/static/"


# we whitelist localhost:3000 because that's where frontend will be served
# CORS_ORIGIN_WHITELIST = (
#        ['http://localhost:3000']
# )

if os.environ.get("DATABASE_URL"):
    DATABASES = {"default": dj_database_url.config(default=os.environ["DATABASE_URL"])}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": "postgres",
            "USER": os.environ["POSTGRES_USER"],
            "PASSWORD": os.environ["POSTGRES_PASSWORD"],
            "HOST": os.environ["DB_HOST"],
            "PORT": os.environ["DB_PORT"],
        }
    }

CELERY_BROKER_URL = os.getenv("REDIS_URL")


# Configuration of storages
#

IMAGE_STORAGE_BUCKET_VAR = "AWS_S3_IMAGE_BUCKET_NAME"
IMAGE_STORAGE_ACCESS_KEY_ENV_VAR = "AWS_S3_IMAGE_STORAGE_ACCESS_KEY_ID"
IMAGE_STORAGE_SECRET_ENV_VAR = "AWS_S3_IMAGE_SECRET_ACCESS_KEY"


STORAGES = {
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}


if all(
    [
        os.getenv(IMAGE_STORAGE_BUCKET_VAR),
        os.getenv(IMAGE_STORAGE_ACCESS_KEY_ENV_VAR),
        os.getenv(IMAGE_STORAGE_SECRET_ENV_VAR),
    ]
):
    STORAGES["images"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": os.getenv(IMAGE_STORAGE_BUCKET_VAR),
            "access_key": os.getenv(IMAGE_STORAGE_ACCESS_KEY_ENV_VAR),
            "secret_key": os.getenv(IMAGE_STORAGE_SECRET_ENV_VAR),
        },
    }
else:
    logger.warn(
        "Env variables for image storage not present, " "storing images locally"
    )
    STORAGES["images"] = {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    }
