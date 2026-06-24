export const mockDashboardStats = {
  totalProjects: 12,
  indexedFiles: 3847,
  apisDetected: 156,
  documentsIndexed: 89,
}

export const mockRecentProjects = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    uploadDate: '2026-06-20T10:30:00Z',
    totalFiles: 342,
    status: 'indexed',
    lastIndexed: '2026-06-24T08:15:00Z',
  },
  {
    id: '2',
    name: 'Payment Gateway API',
    uploadDate: '2026-06-18T14:20:00Z',
    totalFiles: 128,
    status: 'indexing',
    lastIndexed: '2026-06-24T07:45:00Z',
  },
  {
    id: '3',
    name: 'User Auth Service',
    uploadDate: '2026-06-15T09:00:00Z',
    totalFiles: 89,
    status: 'indexed',
    lastIndexed: '2026-06-23T16:30:00Z',
  },
]

export const mockActivity = [
  {
    id: 'a1',
    type: 'indexed',
    label: 'Indexed Payment Gateway API',
    detail: '128 files processed · 24 endpoints found',
    timestamp: '2026-06-24T07:45:00Z',
    path: '/projects',
  },
  {
    id: 'a2',
    type: 'chat',
    label: 'Asked about authentication flow',
    detail: 'E-Commerce Platform · Copilot',
    timestamp: '2026-06-24T09:30:00Z',
    path: '/chat',
  },
  {
    id: 'a3',
    type: 'upload',
    label: 'Uploaded User Auth Service',
    detail: 'ZIP archive · 89 files',
    timestamp: '2026-06-15T09:00:00Z',
    path: '/projects',
  },
  {
    id: 'a4',
    type: 'architecture',
    label: 'Explored backend module tree',
    detail: 'auth, payments, users modules',
    timestamp: '2026-06-23T14:10:00Z',
    path: '/architecture',
  },
]

export const mockConversations = [
  {
    id: 'c1',
    title: 'Authentication flow analysis',
    projectId: '1',
    updatedAt: '2026-06-24T09:30:00Z',
    preview: 'The authentication module uses JWT tokens...',
  },
  {
    id: 'c2',
    title: 'API endpoint mapping',
    projectId: '2',
    updatedAt: '2026-06-23T15:20:00Z',
    preview: 'Found 24 REST endpoints related to payments...',
  },
  {
    id: 'c3',
    title: 'Database schema review',
    projectId: '1',
    updatedAt: '2026-06-22T11:00:00Z',
    preview: 'The User entity has relationships with...',
  },
]

export const mockProjects = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce application with React and Django',
    uploadDate: '2026-06-20T10:30:00Z',
    totalFiles: 342,
    status: 'indexed',
    lastIndexed: '2026-06-24T08:15:00Z',
    apisCount: 48,
    docsCount: 12,
  },
  {
    id: '2',
    name: 'Payment Gateway API',
    description: 'Stripe-integrated payment processing service',
    uploadDate: '2026-06-18T14:20:00Z',
    totalFiles: 128,
    status: 'indexing',
    lastIndexed: '2026-06-24T07:45:00Z',
    apisCount: 24,
    docsCount: 5,
  },
  {
    id: '3',
    name: 'User Auth Service',
    description: 'Microservice handling authentication and authorization',
    uploadDate: '2026-06-15T09:00:00Z',
    totalFiles: 89,
    status: 'indexed',
    lastIndexed: '2026-06-23T16:30:00Z',
    apisCount: 18,
    docsCount: 8,
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics and reporting module',
    uploadDate: '2026-06-10T16:45:00Z',
    totalFiles: 215,
    status: 'pending',
    lastIndexed: null,
    apisCount: 0,
    docsCount: 3,
  },
]

export const mockChatMessages = [
  {
    id: 'm1',
    role: 'user',
    content: 'Explain the authentication module in this project',
    timestamp: '2026-06-24T09:00:00Z',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: `## Authentication Module Overview

The authentication system is built using **JWT (JSON Web Tokens)** with the following architecture:

### Key Components

1. **\`auth/views.py\`** - Login, register, and token refresh endpoints
2. **\`auth/serializers.py\`** - User validation and token generation
3. **\`auth/middleware.py\`** - JWT verification middleware

### Authentication Flow

\`\`\`python
# Login flow
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "********"
}

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
\`\`\`

### Security Features
- Password hashing with **bcrypt**
- Token expiration (15 min access, 7 day refresh)
- Rate limiting on auth endpoints
- CSRF protection for cookie-based sessions`,
    timestamp: '2026-06-24T09:00:15Z',
  },
]

export const mockArchitectureTree = {
  id: 'root',
  name: 'e-commerce-platform',
  type: 'folder',
  children: [
    {
      id: 'backend',
      name: 'backend',
      type: 'folder',
      children: [
        {
          id: 'auth',
          name: 'auth',
          type: 'module',
          children: [
            { id: 'views', name: 'views.py', type: 'file' },
            { id: 'models', name: 'models.py', type: 'file' },
            { id: 'serializers', name: 'serializers.py', type: 'file' },
            { id: 'urls', name: 'urls.py', type: 'file' },
          ],
        },
        {
          id: 'payments',
          name: 'payments',
          type: 'module',
          children: [
            { id: 'payment-views', name: 'views.py', type: 'file' },
            { id: 'stripe', name: 'stripe_service.py', type: 'service' },
            { id: 'payment-models', name: 'models.py', type: 'file' },
          ],
        },
        {
          id: 'users',
          name: 'users',
          type: 'module',
          children: [
            { id: 'user-views', name: 'views.py', type: 'file' },
            { id: 'user-models', name: 'models.py', type: 'entity' },
          ],
        },
        {
          id: 'api',
          name: 'api',
          type: 'folder',
          children: [
            { id: 'v1', name: 'v1', type: 'api', children: [
              { id: 'auth-api', name: 'POST /auth/login', type: 'endpoint' },
              { id: 'users-api', name: 'GET /users/', type: 'endpoint' },
              { id: 'products-api', name: 'GET /products/', type: 'endpoint' },
            ]},
          ],
        },
      ],
    },
    {
      id: 'frontend',
      name: 'frontend',
      type: 'folder',
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          children: [
            { id: 'components', name: 'components', type: 'folder', children: [
              { id: 'auth-comp', name: 'Auth', type: 'module' },
              { id: 'dashboard', name: 'Dashboard', type: 'module' },
            ]},
            { id: 'pages', name: 'pages', type: 'folder' },
            { id: 'hooks', name: 'hooks', type: 'folder' },
          ],
        },
      ],
    },
    {
      id: 'docs',
      name: 'docs',
      type: 'folder',
      children: [
        { id: 'readme', name: 'README.md', type: 'file' },
        { id: 'api-docs', name: 'API.md', type: 'file' },
        { id: 'architecture', name: 'ARCHITECTURE.md', type: 'file' },
      ],
    },
  ],
}

export const suggestedQuestions = [
  'Explain authentication module',
  'Explain project architecture',
  'Which files contain login logic?',
  'How does payment flow work?',
  'Which APIs are related to users?',
]

export const onboardingSections = [
  {
    id: 'architecture',
    title: 'Project Architecture',
    icon: 'layers',
    description: 'Understand the high-level system design and component relationships',
    content: `## System Architecture

DevBrain AI analyzes your codebase to provide insights into:

- **Frontend Layer**: React components, routing, state management
- **Backend Layer**: Django REST Framework APIs, serializers, views
- **Data Layer**: MySQL database models and relationships
- **Integration Layer**: External services (Stripe, email, etc.)

### Recommended Reading Order
1. Start with \`README.md\` and \`ARCHITECTURE.md\`
2. Review the main \`urls.py\` for API routing
3. Explore domain modules (auth, users, payments)`,
    steps: ['Read documentation', 'Review API routes', 'Explore modules'],
  },
  {
    id: 'features',
    title: 'Feature Flow',
    icon: 'git-branch',
    description: 'Learn how key features work end-to-end',
    content: `## Core Feature Flows

### User Registration & Login
1. Frontend submits credentials to \`/api/auth/register/\`
2. Backend validates, hashes password, creates User record
3. JWT tokens returned and stored in localStorage
4. Protected routes check token via AuthContext

### Project Upload & Indexing
1. ZIP uploaded via drag-and-drop interface
2. Backend extracts and parses file structure
3. ChromaDB indexes code embeddings for semantic search
4. AI assistant can query indexed knowledge`,
    steps: ['Auth flow', 'Upload flow', 'AI query flow'],
  },
  {
    id: 'dependencies',
    title: 'Dependencies',
    icon: 'package',
    description: 'Key libraries and their roles in the project',
    content: `## Key Dependencies

| Package | Purpose |
|---------|---------|
| Django REST Framework | API layer |
| djangorestframework-simplejwt | JWT auth |
| ChromaDB | Vector storage |
| Ollama | Local LLM inference |
| React + Vite | Frontend SPA |
| Tailwind CSS | Styling |

### Environment Setup
- Python 3.11+, Node.js 18+
- MySQL 8.0 for relational data
- Ollama running locally for AI features`,
    steps: ['Install Python deps', 'Install Node deps', 'Configure .env'],
  },
  {
    id: 'learning',
    title: 'Learning Path',
    icon: 'graduation-cap',
    description: 'What a new developer should learn first',
    content: `## New Developer Onboarding

### Week 1: Foundation
- Set up local development environment
- Run the application and explore the UI
- Read project documentation

### Week 2: Core Systems
- Understand authentication flow
- Explore API endpoints with Swagger
- Review database models

### Week 3: Advanced
- Learn ChromaDB indexing pipeline
- Understand AI query processing
- Contribute your first feature`,
    steps: ['Environment setup', 'Auth & APIs', 'AI pipeline'],
  },
]
