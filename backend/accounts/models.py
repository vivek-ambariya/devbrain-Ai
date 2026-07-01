from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=64, default='Engineer')
    avatar = models.URLField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.name and self.first_name:
            self.name = f'{self.first_name} {self.last_name}'.strip()
        super().save(*args, **kwargs)

    @property
    def display_name(self):
        return self.name or self.username
