from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import User
from projects.models import Project


class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login(self):
        res = self.client.post('/api/auth/register/', {
            'name': 'Dev User',
            'email': 'dev@example.com',
            'password': 'securepass123',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertIn('access', res.data)

        login = self.client.post('/api/auth/login/', {
            'email': 'dev@example.com',
            'password': 'securepass123',
        }, format='json')
        self.assertEqual(login.status_code, 200)
        self.assertIn('access', login.data)


class ProjectAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='u@test.com', email='u@test.com', password='pass12345', name='User'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_project_and_architecture(self):
        res = self.client.post('/api/projects/', {'name': 'Test', 'description': 'Demo'}, format='json')
        self.assertEqual(res.status_code, 201)
        pid = res.data['id']
        arch = self.client.get(f'/api/projects/{pid}/architecture/')
        self.assertEqual(arch.status_code, 200)
        self.assertEqual(arch.data['name'], 'Test')

    def test_dashboard_stats(self):
        Project.objects.create(owner=self.user, name='P1')
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['totalProjects'], 1)
