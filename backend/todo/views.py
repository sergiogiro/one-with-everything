# todo/views.py
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators import csrf
from rest_framework import viewsets  # add this
from rest_framework.views import APIView

from .serializers import TodoSerializer  # add this
from .models import Todo  # add this
from django.views import View


class TodoView(viewsets.ModelViewSet):  # add this
    serializer_class = TodoSerializer  # add this
    queryset = Todo.objects.all()  # add this


# @method_decorator(csrf.csrf_exempt, name='dispatch')
class SimpleView(APIView):
    def get(self, *args):
        return JsonResponse({"result": "get" + self.request.GET.get("ppp", "nothing")})

    def post(self, request, *args):
        return JsonResponse(
            {"result": "post" + request.data.get("ppp", "nothing")})
