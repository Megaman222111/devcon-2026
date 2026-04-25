from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.healthcheck),
    path("translate/", views.translate),
    path("lesson-insights/", views.lesson_insights),
    path("chat-pdf/", views.chat_pdf),
    path("warmup/", views.warmup),
]
