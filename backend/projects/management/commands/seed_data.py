import os
import io
import shutil
import zipfile
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from projects.models import Project, ProjectFile
from chat.models import Conversation, Message

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with sample developer accounts, projects, and chat history.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting database seeding...')
        
        # 1. Seed user
        email = 'admin@devbrain.ai'
        username = email
        password = 'Admin123!'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'name': 'Admin User',
                'role': 'Lead Engineer',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(f'Created admin user: {email} / {password}')
        else:
            # Update password to ensure it matches
            user.set_password(password)
            user.save()
            self.stdout.write(f'Admin user {email} already exists. Password reset to {password}.')

        # Clean existing projects for this user to make it repeatable
        Project.objects.filter(owner=user).delete()
        self.stdout.write('Cleaned up existing projects for the seed user.')
        
        # Helpers for creating dummy files
        def create_dummy_zip_bytes():
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
                zip_file.writestr('main.py', 'print("Hello from DevBrain AI!")\n')
                zip_file.writestr('models.py', 'class Product:\n    pass\n')
                zip_file.writestr('views.py', 'def get_products(request):\n    return []\n')
                zip_file.writestr('README.md', '# E-Commerce Platform\nThis is a sample project.\n')
            return zip_buffer.getvalue()

        # Define projects
        # Project 1: E-Commerce Platform
        proj1 = Project.objects.create(
            owner=user,
            name='E-Commerce Platform',
            description='Full-stack e-commerce application with React and Django',
            status=Project.STATUS_INDEXED,
            total_files=25,
            apis_count=12,
            docs_count=4,
            architecture_tree={
                'id': 'root',
                'name': 'ecommerce-platform',
                'type': 'folder',
                'children': [
                    {
                        'id': 'b1',
                        'name': 'backend',
                        'type': 'folder',
                        'children': [
                            {
                                'id': 'm1',
                                'name': 'auth',
                                'type': 'module',
                                'children': [
                                    {'id': 'v1', 'name': 'views.py', 'type': 'file'},
                                    {'id': 'mo1', 'name': 'models.py', 'type': 'file'},
                                ]
                            },
                            {
                                'id': 'm2',
                                'name': 'orders',
                                'type': 'module',
                                'children': [
                                    {'id': 'v2', 'name': 'views.py', 'type': 'file'},
                                ]
                            }
                        ]
                    },
                    {
                        'id': 'f1',
                        'name': 'frontend',
                        'type': 'folder',
                        'children': [
                            {'id': 'js1', 'name': 'App.jsx', 'type': 'file'},
                        ]
                    }
                ]
            },
            architecture_map={
                'layers': [
                    {
                        'id': 'client',
                        'label': 'Client Layer',
                        'description': 'Browser React SPA',
                        'nodes': [
                            {'id': 'react-app', 'label': 'React SPA', 'type': 'client', 'detail': 'React 19 + Vite'}
                        ]
                    },
                    {
                        'id': 'backend',
                        'label': 'Backend Layer',
                        'description': 'Django REST APIs',
                        'nodes': [
                            {'id': 'auth-mod', 'label': 'auth', 'type': 'module', 'detail': 'JWT Auth'},
                            {'id': 'orders-mod', 'label': 'orders', 'type': 'module', 'detail': 'Order Processing'}
                        ]
                    }
                ],
                'flows': [
                    {'from': 'react-app', 'to': 'auth-mod', 'label': 'login'},
                    {'from': 'react-app', 'to': 'orders-mod', 'label': 'checkout'}
                ]
            },
            dependency_graph={
                'nodes': [
                    {'id': 'frontend', 'label': 'frontend', 'type': 'client', 'x': 200, 'y': 100},
                    {'id': 'backend', 'label': 'backend', 'type': 'module', 'x': 400, 'y': 100},
                    {'id': 'db', 'label': 'MySQL', 'type': 'database', 'x': 600, 'y': 100}
                ],
                'edges': [
                    {'from': 'frontend', 'to': 'backend', 'label': 'HTTP'},
                    {'from': 'backend', 'to': 'db', 'label': 'SQL'}
                ]
            }
        )
        
        # Write files for Project 1
        p1_dir = Path(settings.MEDIA_ROOT) / 'projects' / str(proj1.id)
        p1_dir.mkdir(parents=True, exist_ok=True)
        
        zip1_path = p1_dir / 'src.zip'
        zip1_path.write_bytes(create_dummy_zip_bytes())
        
        ProjectFile.objects.create(
            project=proj1,
            file_type=ProjectFile.TYPE_ZIP,
            original_name='src.zip',
            stored_path=str(zip1_path)
        )
        
        # Project 2: Payment Gateway API
        proj2 = Project.objects.create(
            owner=user,
            name='Payment Gateway API',
            description='Stripe-integrated payment processing service',
            status=Project.STATUS_INDEXED,
            total_files=15,
            apis_count=5,
            docs_count=2,
            architecture_tree={
                'id': 'root',
                'name': 'payment-gateway',
                'type': 'folder',
                'children': [
                    {'id': 'p_v1', 'name': 'views.py', 'type': 'file'},
                    {'id': 'p_s1', 'name': 'stripe_service.py', 'type': 'service'}
                ]
            },
            architecture_map={
                'layers': [
                    {
                        'id': 'api',
                        'label': 'API Layer',
                        'description': 'Stripe Integrations',
                        'nodes': [{'id': 'payment-views', 'label': 'payment-views', 'type': 'module'}]
                    }
                ],
                'flows': []
            },
            dependency_graph={'nodes': [], 'edges': []}
        )
        
        p2_dir = Path(settings.MEDIA_ROOT) / 'projects' / str(proj2.id)
        p2_dir.mkdir(parents=True, exist_ok=True)
        zip2_path = p2_dir / 'src.zip'
        zip2_path.write_bytes(create_dummy_zip_bytes())
        
        ProjectFile.objects.create(
            project=proj2,
            file_type=ProjectFile.TYPE_ZIP,
            original_name='src.zip',
            stored_path=str(zip2_path)
        )

        # Project 3: Real-time Chat Microservice (using RAR file)
        proj3 = Project.objects.create(
            owner=user,
            name='Real-time Chat Microservice',
            description='A microservice chat engine uploaded via a RAR archive.',
            status=Project.STATUS_INDEXED,
            total_files=18,
            apis_count=8,
            docs_count=3,
            architecture_tree={
                'id': 'root',
                'name': 'chat-microservice',
                'type': 'folder',
                'children': [
                    {'id': 'c_v1', 'name': 'views.py', 'type': 'file'},
                    {'id': 'c_s1', 'name': 'websocket_service.py', 'type': 'service'}
                ]
            },
            architecture_map={
                'layers': [
                    {
                        'id': 'api',
                        'label': 'API Layer',
                        'description': 'WebSocket APIs',
                        'nodes': [{'id': 'chat-views', 'label': 'chat-views', 'type': 'module'}]
                    }
                ],
                'flows': []
            },
            dependency_graph={'nodes': [], 'edges': []}
        )
        
        p3_dir = Path(settings.MEDIA_ROOT) / 'projects' / str(proj3.id)
        p3_dir.mkdir(parents=True, exist_ok=True)
        rar3_path = p3_dir / 'src.rar'
        rar3_path.write_bytes(create_dummy_zip_bytes())  # Dummy zip bytes in .rar extension
        
        ProjectFile.objects.create(
            project=proj3,
            file_type=ProjectFile.TYPE_RAR,
            original_name='src.rar',
            stored_path=str(rar3_path)
        )
        
        # 3. Seed Conversations and messages
        conv1 = Conversation.objects.create(
            owner=user,
            project=proj1,
            title='Authentication Flow Analysis',
            preview='The authentication module uses JWT tokens...'
        )
        Message.objects.create(
            conversation=conv1,
            role=Message.ROLE_USER,
            content='Explain the authentication module in this project.'
        )
        Message.objects.create(
            conversation=conv1,
            role=Message.ROLE_ASSISTANT,
            content='## Authentication Module Overview\n\nThe authentication system is built using **JWT (JSON Web Tokens)** with the following architecture:\n\n1. `auth/views.py` — Login, register, and token refresh endpoints.\n2. `auth/serializers.py` — User validation and token generation.\n\nPasswords are encrypted using **bcrypt**.'
        )

        conv2 = Conversation.objects.create(
            owner=user,
            project=proj1,
            title='Database Schema Review',
            preview='Reviewing the user and order relationships...'
        )
        Message.objects.create(
            conversation=conv2,
            role=Message.ROLE_USER,
            content='What database tables are defined?'
        )
        Message.objects.create(
            conversation=conv2,
            role=Message.ROLE_ASSISTANT,
            content='We have tables for `users`, `products`, `orders`, and `order_items` defined in our Django ORM models.'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with all sample data!'))
