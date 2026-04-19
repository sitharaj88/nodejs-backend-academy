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
      logo: {
        src: './src/assets/node-academy-mark.svg',
      },
      disable404Route: true,
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
      ],
    }),
  ],
})
