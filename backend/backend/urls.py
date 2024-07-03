# backend/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles import views as static_views
from django.shortcuts import redirect
from django.urls import include, path, re_path  # add this
from rest_framework import routers  # add this
from todo import views  # add this

router = routers.DefaultRouter()  # add this
router.register(r"todos", views.TodoView, "todo")  # add this
router.register(
    r"generated-todos", views.GeneratedTodoView, "generated-todo"
)  # add this


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),  # add this
    path("api/stream-todos", views.TodosStream.as_view()),
    # path('', lambda req: redirect(settings.STATIC_URL + "/index.html")),
    re_path("^$", static_views.serve, kwargs={"path": "index.html"}),
] + static(settings.STATIC_URL)
