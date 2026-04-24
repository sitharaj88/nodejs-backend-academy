// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isProjectPages = Boolean(repoName && !repoName.endsWith('.github.io'))
const owner = process.env.GITHUB_REPOSITORY_OWNER
const site = owner
  ? `https://${owner}.github.io${isProjectPages ? `/${repoName}` : ''}`
  : 'https://example.com'

export default defineConfig({
  site,
  base: isProjectPages ? `/${repoName}/` : '/',
  integrations: [
    starlight({
      title: 'Node.js Backend Academy',
      description:
        'A production-grade Node.js backend engineering academy with guided learning paths, labs, diagrams, projects, and capstones.',
      logo: {
        src: './src/assets/node-academy-mark.svg',
      },
      customCss: [
        '@fontsource-variable/manrope/index.css',
        '@fontsource/source-serif-4/400.css',
        '@fontsource/source-serif-4/600.css',
        '@fontsource/ibm-plex-mono/400.css',
        './src/styles/custom.css',
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      editLink: {
        baseUrl:
          (owner && repoName)
            ? `https://github.com/${owner}/${repoName}/edit/main/`
            : 'https://github.com/sitharaj88/nodejs-backend-academy/edit/main/',
      },
      lastUpdated: true,
      pagination: true,
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:type', content: 'website' },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: `${site}${isProjectPages ? `/${repoName}` : ''}/og-default.svg`,
          },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: `${site}${isProjectPages ? `/${repoName}` : ''}/og-default.svg`,
          },
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#2f8f46' },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href:
            (owner && repoName)
              ? `https://github.com/${owner}/${repoName}`
              : 'https://github.com/sitharaj88/nodejs-backend-academy',
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Welcome', slug: '' },
            {
              label: 'Program Overview',
              slug: 'start-here/program-overview',
            },
            {
              label: 'Training Format',
              slug: 'start-here/training-format',
            },
          ],
        },
        {
          label: 'Phase Roadmap',
          items: [
            {
              label: 'Phase 1: Foundation & Runtime',
              slug: 'roadmap/phase-1-foundation-runtime',
            },
            {
              label: 'Phase 2: APIs, Data & Security',
              slug: 'roadmap/phase-2-api-engineering-data',
            },
            {
              label: 'Phase 3: Architecture, Quality & Scale',
              slug: 'roadmap/phase-3-architecture-quality-scale',
            },
            {
              label: 'Phase 4: Delivery & Career Readiness',
              slug: 'roadmap/phase-4-production-delivery-career',
            },
          ],
        },
        {
          label: 'Module Library',
          items: [
            {
              label: 'Module 01: JavaScript Foundation',
              slug: 'modules/module-01-javascript-foundation',
            },
            {
              label: 'Module 02: Node.js Core Runtime',
              slug: 'modules/module-02-nodejs-core-runtime',
            },
            {
              label: 'Module 03: NPM, Tooling & Setup',
              slug: 'modules/module-03-npm-tooling-project-setup',
            },
            {
              label: 'Module 04: Express.js & REST APIs',
              slug: 'modules/module-04-express-rest-api-development',
            },
            {
              label: 'Module 05: Databases & Data Modeling',
              slug: 'modules/module-05-databases-data-modeling',
            },
            {
              label: 'Module 06: Auth, Authorization & Security',
              slug: 'modules/module-06-auth-authorization-security',
            },
            {
              label: 'Module 07: Architecture & Clean Design',
              slug: 'modules/module-07-architecture-clean-design',
            },
            {
              label: 'Module 08: Testing & Debugging',
              slug: 'modules/module-08-testing-debugging-code-quality',
            },
            {
              label: 'Module 09: Performance & Caching',
              slug: 'modules/module-09-performance-caching-scalability',
            },
            {
              label: 'Module 10: Real-Time & Advanced APIs',
              slug: 'modules/module-10-realtime-advanced-apis',
            },
            {
              label: 'Module 11: DevOps & Deployment',
              slug: 'modules/module-11-devops-deployment-production-readiness',
            },
            {
              label: 'Module 12: System Design & Microservices',
              slug: 'modules/module-12-system-design-microservices-basics',
            },
            {
              label: 'Module 13: Collaboration & Career',
              slug: 'modules/module-13-collaboration-career-readiness',
            },
          ],
        },
        {
          label: 'Learning',
          items: [
            {
              label: 'Learning Overview',
              slug: 'learning/overview',
            },
            {
              label: 'JavaScript Learning Path',
              items: [
                {
                  label: 'JavaScript Overview',
                  slug: 'learning/javascript/overview',
                },
                {
                  label: 'Syntax, Types, and Variables',
                  slug: 'learning/javascript/syntax-types-variables',
                },
                {
                  label: 'Operators, Conditions, and Loops',
                  slug: 'learning/javascript/operators-conditions-loops',
                },
                {
                  label: 'Functions, Scope, Closures, and This',
                  slug: 'learning/javascript/functions-scope-closures-this',
                },
                {
                  label: 'Arrays, Objects, and Destructuring',
                  slug: 'learning/javascript/arrays-objects-destructuring',
                },
                {
                  label: 'Prototypes, Classes, and OOP',
                  slug: 'learning/javascript/prototypes-classes-oop',
                },
                {
                  label: 'Asynchronous JavaScript',
                  slug: 'learning/javascript/asynchronous-javascript',
                },
                {
                  label: 'Modules, Errors, and Code Patterns',
                  slug: 'learning/javascript/modules-errors-patterns',
                },
                {
                  label: 'Advanced JavaScript Concepts',
                  slug: 'learning/javascript/advanced-javascript-concepts',
                },
                {
                  label: 'Modern JavaScript Coverage',
                  slug: 'learning/javascript/modern-javascript-coverage',
                },
                {
                  label: 'JavaScript Versions and ECMAScript History',
                  slug: 'learning/javascript/javascript-versions-history',
                },
              ],
            },
            {
              label: 'TypeScript Learning Path',
              items: [
                {
                  label: 'TypeScript Overview',
                  slug: 'learning/typescript/overview',
                },
                {
                  label: 'Type System Foundations',
                  slug: 'learning/typescript/type-system-foundations',
                },
                {
                  label: 'Functions, Objects, and Arrays',
                  slug: 'learning/typescript/functions-objects-arrays',
                },
                {
                  label: 'Unions, Narrowing, and Type Guards',
                  slug: 'learning/typescript/unions-narrowing-type-guards',
                },
                {
                  label: 'Generics, Inference, and Constraints',
                  slug: 'learning/typescript/generics-inference-constraints',
                },
                {
                  label: 'Interfaces, Classes, and OOP',
                  slug: 'learning/typescript/interfaces-classes-oop',
                },
                {
                  label: 'Mapped, Conditional, and Template Literal Types',
                  slug: 'learning/typescript/mapped-conditional-template-literal-types',
                },
                {
                  label: 'tsconfig, Modules, and Declaration Files',
                  slug: 'learning/typescript/tsconfig-modules-declaration-files',
                },
                {
                  label: 'Runtime Validation and Node.js Integration',
                  slug: 'learning/typescript/runtime-validation-nodejs-integration',
                },
                {
                  label: 'Advanced TypeScript Patterns',
                  slug: 'learning/typescript/advanced-typescript-patterns',
                },
                {
                  label: 'Modern TypeScript Coverage',
                  slug: 'learning/typescript/modern-typescript-coverage',
                },
                {
                  label: 'TypeScript Versions and Feature History',
                  slug: 'learning/typescript/typescript-versions-history',
                },
              ],
            },
            {
              label: 'Node.js Learning Path',
              items: [
                {
                  label: 'Node.js Overview',
                  slug: 'learning/nodejs/overview',
                },
                {
                  label: 'Runtime Fundamentals',
                  slug: 'learning/nodejs/runtime-fundamentals',
                },
                {
                  label: 'Modules, Package System, and Tooling',
                  slug: 'learning/nodejs/modules-package-system-tooling',
                },
                {
                  label: 'File System, Path, Buffer, and Process',
                  slug: 'learning/nodejs/filesystem-path-buffer-process',
                },
                {
                  label: 'Events, Streams, and Async Patterns',
                  slug: 'learning/nodejs/events-streams-async-patterns',
                },
                {
                  label: 'HTTP Server, APIs, and Express',
                  slug: 'learning/nodejs/http-server-apis-express',
                },
                {
                  label: 'Express.js Learning Path',
                  items: [
                    {
                      label: 'Express Overview',
                      slug: 'learning/nodejs/express/overview',
                    },
                    {
                      label: 'Setup, Routing, and Request-Response Flow',
                      slug: 'learning/nodejs/express/setup-routing-request-response',
                    },
                    {
                      label: 'Middleware and Request Lifecycle',
                      slug: 'learning/nodejs/express/middleware-request-lifecycle',
                    },
                    {
                      label: 'Validation and Error Handling',
                      slug: 'learning/nodejs/express/validation-error-handling',
                    },
                    {
                      label: 'Auth, Security, and API Hardening',
                      slug: 'learning/nodejs/express/auth-security-api-hardening',
                    },
                    {
                      label: 'Files, Static Content, and Response Patterns',
                      slug: 'learning/nodejs/express/files-static-content-response-patterns',
                    },
                    {
                      label: 'Architecture and Testing',
                      slug: 'learning/nodejs/express/architecture-and-testing',
                    },
                    {
                      label: 'Performance and Production Delivery',
                      slug: 'learning/nodejs/express/performance-and-production-delivery',
                    },
                    {
                      label: 'Modern Express Coverage',
                      slug: 'learning/nodejs/express/modern-express-coverage',
                    },
                  ],
                },
                {
                  label: 'Databases, Validation, and Auth',
                  slug: 'learning/nodejs/databases-validation-auth',
                },
                {
                  label: 'Testing, Debugging, and Error Handling',
                  slug: 'learning/nodejs/testing-debugging-error-handling',
                },
                {
                  label: 'Performance, Scaling, and Production Readiness',
                  slug: 'learning/nodejs/performance-scaling-production-readiness',
                },
                {
                  label: 'Node.js Versions and Ecosystem History',
                  slug: 'learning/nodejs/nodejs-versions-ecosystem-history',
                },
                {
                  label: 'Modern Node.js Coverage',
                  slug: 'learning/nodejs/modern-nodejs-coverage',
                },
              ],
            },
            {
              label: 'NPM, Tooling, and Setup',
              items: [
                {
                  label: 'Tooling Overview',
                  slug: 'learning/tooling/overview',
                },
                {
                  label: 'Package Management, Semver, and Lockfiles',
                  slug: 'learning/tooling/package-management-semver-lockfiles',
                },
                {
                  label: 'Project Setup, Scripts, and Configuration',
                  slug: 'learning/tooling/project-setup-scripts-configuration',
                },
                {
                  label: 'Code Quality, Builds, and Test Workflow',
                  slug: 'learning/tooling/code-quality-builds-test-workflow',
                },
                {
                  label: 'Modern Tooling Coverage',
                  slug: 'learning/tooling/modern-tooling-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/tooling/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Databases and Data Modeling',
              items: [
                {
                  label: 'Databases Overview',
                  slug: 'learning/databases/overview',
                },
                {
                  label: 'Relational Modeling and SQL Thinking',
                  slug: 'learning/databases/relational-modeling-sql-thinking',
                },
                {
                  label: 'Document Modeling and NoSQL Patterns',
                  slug: 'learning/databases/document-modeling-nosql-patterns',
                },
                {
                  label: 'Queries, Indexes, Transactions, and Migrations',
                  slug: 'learning/databases/queries-indexes-transactions-migrations',
                },
                {
                  label: 'Modern Databases Coverage',
                  slug: 'learning/databases/modern-databases-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/databases/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Auth, Authorization, and Security',
              items: [
                {
                  label: 'Security Overview',
                  slug: 'learning/security/overview',
                },
                {
                  label: 'Authentication, Sessions, JWT, and OAuth',
                  slug: 'learning/security/authentication-sessions-jwt-oauth',
                },
                {
                  label: 'Authorization, RBAC, ABAC, and Ownership',
                  slug: 'learning/security/authorization-rbac-abac-ownership',
                },
                {
                  label: 'API Security, Passwords, Secrets, and Hardening',
                  slug: 'learning/security/api-security-passwords-secrets-hardening',
                },
                {
                  label: 'Modern Security Coverage',
                  slug: 'learning/security/modern-security-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/security/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Architecture and Clean Design',
              items: [
                {
                  label: 'Architecture Overview',
                  slug: 'learning/architecture/overview',
                },
                {
                  label: 'Layered Architecture and Boundaries',
                  slug: 'learning/architecture/layered-architecture-and-boundaries',
                },
                {
                  label: 'Clean Architecture and Dependency Flow',
                  slug: 'learning/architecture/clean-architecture-and-dependency-flow',
                },
                {
                  label: 'Modular Monolith Patterns and Pragmatism',
                  slug: 'learning/architecture/modular-monolith-patterns-and-pragmatism',
                },
                {
                  label: 'Modern Architecture Coverage',
                  slug: 'learning/architecture/modern-architecture-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/architecture/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Testing and Debugging',
              items: [
                {
                  label: 'Testing Overview',
                  slug: 'learning/testing/overview',
                },
                {
                  label: 'Unit, Integration, and API Testing',
                  slug: 'learning/testing/unit-integration-api-testing',
                },
                {
                  label: 'Mocking, Fixtures, Contracts, and Test Data',
                  slug: 'learning/testing/mocking-fixtures-contracts-test-data',
                },
                {
                  label: 'Debugging, Logging, and Diagnostics',
                  slug: 'learning/testing/debugging-logging-diagnostics',
                },
                {
                  label: 'Modern Testing Coverage',
                  slug: 'learning/testing/modern-testing-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/testing/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Performance and Caching',
              items: [
                {
                  label: 'Performance Overview',
                  slug: 'learning/performance/overview',
                },
                {
                  label: 'Performance, Profiling, and the Event Loop',
                  slug: 'learning/performance/performance-profiling-event-loop',
                },
                {
                  label: 'Caching Strategies and Consistency',
                  slug: 'learning/performance/caching-strategies-and-consistency',
                },
                {
                  label: 'Scaling, Reliability, and Capacity',
                  slug: 'learning/performance/scaling-reliability-and-capacity',
                },
                {
                  label: 'Modern Performance Coverage',
                  slug: 'learning/performance/modern-performance-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/performance/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'Real-Time and Advanced APIs',
              items: [
                {
                  label: 'Real-Time Overview',
                  slug: 'learning/realtime/overview',
                },
                {
                  label: 'WebSockets, Socket.IO, and Server-Sent Events',
                  slug: 'learning/realtime/websockets-socketio-and-sse',
                },
                {
                  label: 'Queues, Jobs, Webhooks, and Event-Driven Flows',
                  slug: 'learning/realtime/queues-jobs-webhooks-and-event-driven-flows',
                },
                {
                  label: 'GraphQL, gRPC, and Advanced API Shapes',
                  slug: 'learning/realtime/graphql-grpc-and-advanced-api-shapes',
                },
                {
                  label: 'Modern Real-Time Coverage',
                  slug: 'learning/realtime/modern-realtime-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/realtime/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'DevOps and Deployment',
              items: [
                {
                  label: 'DevOps Overview',
                  slug: 'learning/devops/overview',
                },
                {
                  label: 'Environment, Config, Docker, and Containers',
                  slug: 'learning/devops/environment-config-docker-containers',
                },
                {
                  label: 'CI, CD, Release Flow, and Deployment',
                  slug: 'learning/devops/ci-cd-release-flow-and-deployment',
                },
                {
                  label: 'Observability, Runtime Operations, and Runbooks',
                  slug: 'learning/devops/observability-runtime-operations-and-runbooks',
                },
                {
                  label: 'Modern DevOps Coverage',
                  slug: 'learning/devops/modern-devops-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/devops/labs-projects-interview-case-studies',
                },
              ],
            },
            {
              label: 'System Design and Microservices',
              items: [
                {
                  label: 'System Design Overview',
                  slug: 'learning/system-design/overview',
                },
                {
                  label: 'System Design Fundamentals and Scalability',
                  slug: 'learning/system-design/system-design-fundamentals-and-scalability',
                },
                {
                  label: 'Microservices Boundaries and Data Consistency',
                  slug: 'learning/system-design/microservices-boundaries-and-data-consistency',
                },
                {
                  label: 'Messaging, Resilience, and Distributed Tradeoffs',
                  slug: 'learning/system-design/messaging-resilience-and-distributed-tradeoffs',
                },
                {
                  label: 'Modern System Design Coverage',
                  slug: 'learning/system-design/modern-system-design-coverage',
                },
                {
                  label: 'Labs, Projects, Interview Questions, and Case Studies',
                  slug: 'learning/system-design/labs-projects-interview-case-studies',
                },
              ],
            },
          ],
        },
        {
          label: 'Project Studio',
          items: [
            {
              label: 'Capstone Projects',
              slug: 'projects/capstone-projects',
            },
            {
              label: 'Tools & Technologies',
              slug: 'projects/tools-technologies',
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Glossary',
              slug: 'reference/glossary',
            },
          ],
        },
      ],
    }),
  ],
})
