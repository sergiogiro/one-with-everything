# todo/serializers.py

from rest_framework import serializers

from .models import TaskGeneratedTodo, Todo


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ("id", "title", "description", "depiction", "completed")


class TaskGeneratedTodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskGeneratedTodo
        fields = ("id", "task_id", "todo_id", "sequence_number")


class TaskGeneratedResolvedTodoSerializer(serializers.ModelSerializer):
    todo = TodoSerializer(source="todo_id")

    class Meta:
        model = TaskGeneratedTodo
        fields = ("task_id", "todo", "sequence_number")
