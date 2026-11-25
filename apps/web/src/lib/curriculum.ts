/**
 * Static curriculum outline used by the landing page and dashboard until the
 * curriculum moves into the database (Phase 2–3). Keep in sync with the seed.
 */
export type Level = 'Foundation' | 'Core' | 'Advanced' | 'Expert';
export type Track = 'Foundations' | 'Building APIs' | 'Production' | 'Scale & Architecture';

export interface ModuleOutline {
  number: number;
  slug: string;
  title: string;
  summary: string;
  level: Level;
  track: Track;
  hours: number;
  topics: string[];
}

export const MODULES: ModuleOutline[] = [
  {
    number: 1, slug: 'programming-fundamentals', title: 'Programming Fundamentals', level: 'Foundation', track: 'Foundations', hours: 18,
    summary: 'TypeScript, data structures, async programming and the event loop.',
    topics: ['Variables and data types', 'Functions', 'OOP', 'Data structures', 'Algorithms', 'Error handling', 'Asynchronous programming', 'Event loop', 'Promises', 'TypeScript', 'Memory management'],
  },
  {
    number: 2, slug: 'web-networking', title: 'Web & Networking', level: 'Foundation', track: 'Foundations', hours: 12,
    summary: 'What happens between a URL and a response: DNS, TCP, TLS and HTTP.',
    topics: ['Client-server architecture', 'DNS', 'IP addresses', 'TCP/IP', 'HTTP and HTTPS', 'TLS', 'Request-response lifecycle', 'Cookies', 'Sessions', 'HTTP headers', 'Status codes'],
  },
  {
    number: 3, slug: 'api-engineering', title: 'API Engineering', level: 'Core', track: 'Building APIs', hours: 20,
    summary: 'Designing REST, GraphQL, gRPC and real-time APIs that age well.',
    topics: ['REST architecture', 'REST API design', 'HTTP methods', 'API versioning', 'Request validation', 'Pagination', 'Filtering', 'Sorting', 'Searching', 'Error handling', 'OpenAPI', 'GraphQL', 'gRPC', 'WebSockets', 'Webhooks', 'SSE'],
  },
  {
    number: 4, slug: 'database-engineering', title: 'Database Engineering', level: 'Core', track: 'Building APIs', hours: 32,
    summary: 'PostgreSQL in depth: modelling, transactions, indexes, query plans, scaling.',
    topics: ['SQL fundamentals', 'PostgreSQL', 'Database relationships', 'Primary and foreign keys', 'Constraints', 'Normalization', 'Denormalization', 'Joins', 'Subqueries', 'Transactions', 'ACID', 'Isolation levels', 'Indexes', 'Query optimization', 'Execution plans', 'MVCC', 'Deadlocks', 'Replication', 'Partitioning', 'Sharding', 'ORM', 'Prisma'],
  },
  {
    number: 5, slug: 'auth', title: 'Authentication & Authorization', level: 'Core', track: 'Building APIs', hours: 18,
    summary: 'Passwords, sessions, JWTs, OAuth 2.0, OIDC, RBAC and ABAC.',
    topics: ['Authentication', 'Authorization', 'Password hashing', 'JWT', 'Access tokens', 'Refresh tokens', 'Sessions', 'Cookies', 'OAuth 2.0', 'OpenID Connect', 'RBAC', 'ABAC', 'Permissions', '2FA', 'SSO'],
  },
  {
    number: 6, slug: 'backend-architecture', title: 'Backend Architecture', level: 'Advanced', track: 'Scale & Architecture', hours: 22,
    summary: 'Layered, clean and hexagonal architecture; DDD, CQRS and event sourcing.',
    topics: ['Layered architecture', 'Modular monolith', 'Clean architecture', 'Hexagonal architecture', 'MVC', 'Repository pattern', 'Service pattern', 'Dependency injection', 'SOLID', 'Design patterns', 'Domain-Driven Design', 'CQRS', 'Event sourcing'],
  },
  {
    number: 7, slug: 'security', title: 'Backend Security', level: 'Core', track: 'Production', hours: 16,
    summary: 'OWASP Top 10 from the server side, with exploits and their fixes.',
    topics: ['OWASP Top 10', 'SQL injection', 'XSS', 'CSRF', 'SSRF', 'CORS', 'CSP', 'Rate limiting', 'Encryption', 'Secrets management', 'Secure file uploads', 'API security', 'Audit logs'],
  },
  {
    number: 8, slug: 'caching-performance', title: 'Caching & Performance', level: 'Advanced', track: 'Production', hours: 14,
    summary: 'Redis, cache strategies, invalidation, N+1 queries and profiling.',
    topics: ['Redis', 'In-memory caching', 'Cache-aside', 'Write-through', 'Cache invalidation', 'TTL', 'CDN', 'Connection pooling', 'N+1 queries', 'Query optimization', 'Profiling'],
  },
  {
    number: 9, slug: 'jobs-messaging', title: 'Background Jobs & Messaging', level: 'Advanced', track: 'Production', hours: 16,
    summary: 'Queues, workers, retries, idempotency, BullMQ, RabbitMQ and Kafka.',
    topics: ['Job queues', 'Redis queues', 'BullMQ', 'RabbitMQ', 'Kafka', 'Producers and consumers', 'Workers', 'Retries', 'Dead-letter queues', 'Idempotency', 'Event-driven architecture'],
  },
  {
    number: 10, slug: 'realtime', title: 'Real-time Backend', level: 'Advanced', track: 'Production', hours: 10,
    summary: 'WebSockets, SSE, presence, rooms and scaling connections horizontally.',
    topics: ['WebSockets', 'Socket.IO', 'SSE', 'Broadcasting', 'Rooms', 'Presence', 'Reconnection', 'Scaling WebSockets'],
  },
  {
    number: 11, slug: 'files-media', title: 'File & Media Management', level: 'Core', track: 'Production', hours: 10,
    summary: 'Streaming uploads, object storage, signed URLs and media pipelines.',
    topics: ['Multipart uploads', 'Streaming', 'Object storage', 'AWS S3', 'Cloudflare R2', 'Signed URLs', 'CDN', 'Image optimization', 'Video processing'],
  },
  {
    number: 12, slug: 'testing', title: 'Testing', level: 'Core', track: 'Production', hours: 14,
    summary: 'Unit, integration, E2E and load testing that catches real regressions.',
    topics: ['Unit testing', 'Integration testing', 'E2E testing', 'API testing', 'Load testing', 'Stress testing', 'Mocking', 'Test coverage', 'Regression testing'],
  },
  {
    number: 13, slug: 'devops', title: 'DevOps & Deployment', level: 'Advanced', track: 'Production', hours: 20,
    summary: 'Linux, Docker, Nginx, CI/CD, Kubernetes and infrastructure as code.',
    topics: ['Linux', 'SSH', 'Docker', 'Docker Compose', 'Nginx', 'Reverse proxies', 'Load balancing', 'CI/CD', 'GitHub Actions', 'Cloud deployment', 'Kubernetes', 'Infrastructure as Code'],
  },
  {
    number: 14, slug: 'observability', title: 'Monitoring & Observability', level: 'Advanced', track: 'Production', hours: 12,
    summary: 'Structured logs, metrics, traces, health checks and alerting.',
    topics: ['Logging', 'Structured logging', 'Pino', 'Sentry', 'Metrics', 'Prometheus', 'Grafana', 'OpenTelemetry', 'Distributed tracing', 'Health checks', 'Alerting'],
  },
  {
    number: 15, slug: 'distributed-systems', title: 'Distributed Systems', level: 'Expert', track: 'Scale & Architecture', hours: 22,
    summary: 'Consistency models, CAP, distributed locks, fault tolerance and HA.',
    topics: ['Horizontal scaling', 'Vertical scaling', 'CAP theorem', 'Eventual consistency', 'Strong consistency', 'Distributed transactions', 'Distributed locking', 'Circuit breakers', 'Fault tolerance', 'High availability', 'Disaster recovery', 'Service discovery'],
  },
  {
    number: 16, slug: 'enterprise-saas', title: 'Enterprise SaaS Backend', level: 'Expert', track: 'Scale & Architecture', hours: 20,
    summary: 'Multi-tenancy, billing, metering, feature flags and audit trails.',
    topics: ['Multi-tenancy', 'Tenant isolation', 'Subscription management', 'Billing', 'Payments', 'Invoicing', 'Tax calculation', 'Usage metering', 'Feature flags', 'Workflow automation', 'Approval systems', 'Audit trails', 'Data retention'],
  },
  {
    number: 17, slug: 'ai-backend', title: 'AI Backend Engineering', level: 'Advanced', track: 'Scale & Architecture', hours: 18,
    summary: 'LLM integration, tool calling, RAG, vector search, evals and guardrails.',
    topics: ['LLM integration', 'Prompt management', 'Streaming responses', 'Function calling', 'Tool calling', 'AI agents', 'Embeddings', 'Vector databases', 'RAG', 'Semantic search', 'Conversation memory', 'Evaluation', 'Guardrails', 'AI cost management'],
  },
  {
    number: 18, slug: 'system-design', title: 'System Design', level: 'Expert', track: 'Scale & Architecture', hours: 24,
    summary: 'Requirements to architecture: trade-offs and real-world case studies.',
    topics: ['Functional requirements', 'Non-functional requirements', 'Architecture design', 'Database design', 'API design', 'Scalability', 'Caching strategies', 'Load balancing', 'Reliability', 'Performance trade-offs', 'Real-world system design case studies'],
  },
];

export const TRACKS: { name: Track; description: string }[] = [
  { name: 'Foundations', description: 'The language and the network underneath every backend.' },
  { name: 'Building APIs', description: 'Designing APIs, modelling data and securing access.' },
  { name: 'Production', description: 'Security, performance, async work, testing, operations.' },
  { name: 'Scale & Architecture', description: 'Architecture, distributed systems, SaaS, AI and design.' },
];

export const TOTAL_TOPICS = MODULES.reduce((n, m) => n + m.topics.length, 0);
export const TOTAL_HOURS = MODULES.reduce((n, m) => n + m.hours, 0);

export interface LearningPath {
  slug: string;
  title: string;
  outcome: string;
  description: string;
  modules: number[];
}

/** The three paths partition all 18 modules, so the curriculum can be read path by path. */
export const PATHS: LearningPath[] = [
  {
    slug: 'foundations',
    title: 'Backend Foundations',
    outcome: 'Junior backend engineer',
    description: 'The language, the network, REST APIs, PostgreSQL and authentication. Ends with a secure CRUD API you deploy yourself.',
    modules: [1, 2, 3, 4, 5],
  },
  {
    slug: 'production',
    title: 'Production Backend Engineer',
    outcome: 'Mid-level backend engineer',
    description: 'Everything between “it works” and “it runs in production”: security, caching, queues, files, testing, deployment, observability.',
    modules: [7, 8, 9, 11, 12, 13, 14],
  },
  {
    slug: 'architect',
    title: 'Architect & System Designer',
    outcome: 'Senior engineer, system design interviews',
    description: 'Architecture patterns, real-time systems, distributed systems, multi-tenant SaaS, AI backends and system design case studies.',
    modules: [6, 10, 15, 16, 17, 18],
  },
];

export interface Project {
  title: string;
  /** The analog system this backend replaced, shown as an archival picture. */
  ancestor: string;
  year: string;
  image: string;
  alt: string;
  modules: number[];
}

export const PROJECTS: Project[] = [
  { title: 'Authentication and User Management API', ancestor: 'Lock and keys', year: '13th c.', image: '/archive/auth.jpg', alt: 'Iron keys and a lock from a 13th-century hillfort, in a museum case', modules: [5, 7] },
  { title: 'Real-time Chat Application', ancestor: 'Switchboard operators', year: '1949', image: '/archive/chat-still.jpg', alt: 'A field telephone switchboard operator patching calls', modules: [10] },
  { title: 'Blog and Content Management Backend', ancestor: 'Newspaper press', year: '1858', image: '/archive/cms.jpg', alt: 'Engraving of the first machine used to print the Daily Press', modules: [3, 4] },
  { title: 'HRM and Time Tracking System', ancestor: 'Punch clock', year: '1930s', image: '/archive/hrm.jpg', alt: 'A wooden LM Ericsson punch clock mounted on a wall', modules: [4, 16] },
  { title: 'E-commerce Backend', ancestor: 'Department store', year: 'c. 1935', image: '/archive/ecommerce.jpg', alt: 'Postcard of Klein’s department store on a street corner in San Juan', modules: [4, 8] },
  { title: 'Payment Processing System', ancestor: 'Bank vault', year: '1960s', image: '/archive/payments.jpg', alt: 'Two round steel bank vault doors behind a railing', modules: [9, 16] },
  { title: 'Distributed Job Processing System', ancestor: 'Mail sorting room', year: '1914', image: '/archive/jobs.jpg', alt: 'Post office workers sorting sacks of mail in New York', modules: [9, 15] },
  { title: 'Multi-tenant CRM SaaS', ancestor: 'Card catalogue', year: 'Library of Congress', image: '/archive/crm.jpg', alt: 'Close-up of index cards in a wooden card catalogue drawer', modules: [16] },
  { title: 'Notification Service', ancestor: 'Telegraph office', year: '1963', image: '/archive/notifications.jpg', alt: 'Operators at typewriters in the Tokyo Central Telegraph Office', modules: [9, 10] },
  { title: 'File Storage Service', ancestor: 'City hall vault', year: '1892', image: '/archive/files.jpg', alt: 'Engraving of a vault lined floor to ceiling with filing drawers', modules: [11] },
  { title: 'AI Agent Backend', ancestor: 'ENIAC programmers', year: 'c. 1947', image: '/archive/ai.jpg', alt: 'Two programmers setting up the ENIAC computer', modules: [17] },
  { title: 'Scalable SaaS Architecture', ancestor: 'Telephone exchange', year: '1940s', image: '/archive/saas.jpg', alt: 'A red 1940s telephone exchange unit with switches', modules: [15, 18] },
];
