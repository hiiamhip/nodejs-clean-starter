# 🛡️ Node.js Clean Starter Kit

> An unopinionated TypeScript REST API starter focused on schema validation, centralized error handling, and testable design.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest%20%26%20Supertest-red.svg?logo=jest)](https://jestjs.io/)
[![Zod](https://img.shields.io/badge/Validation-Zod-306998.svg?logo=zod)](https://zod.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## 💡 Core Philosophy: Infrastructure-Agnostic Foundation

Most starters fail by being bloated with premature infrastructure choices (locking you into PostgreSQL, Prisma, TypeORM, MongoDB, or Redis before knowing project requirements). 

**`nodejs-clean-starter` takes the opposite approach:**
- **Zero Premature Infrastructure**: Database, ORM, message queues, and caching are external details left to project-specific requirements.
- **The 3 Immutable Application Pillars**: Focus exclusively on the architectural core that *every single enterprise API* requires:
  1. **Enterprise Error Handling**: Operational vs. programmer errors with typed hierarchy and global filtering.
  2. **Type-Safe Request Validation**: Declarative Zod schema validation for `body`, `query`, and `params`.
  3. **Standardized Response Envelopes**: Consistent JSON structure (`{ success, message, data, meta }`) across all endpoints.

---

## 📁 Project Architecture

```text
nodejs-clean-starter/
├── .env.example              # Environment variables template
├── .gitignore                # Production-grade gitignore
├── jest.config.ts            # Jest & ts-jest test runner config
├── package.json              # Scripts & dependencies
├── tsconfig.json             # TypeScript strict mode configuration (ES2022)
├── src/
│   ├── app.ts                # Express application factory (Middlewares & Routes)
│   ├── server.ts             # Network listener & Graceful Shutdown handlers
│   ├── config/
│   │   └── env.ts            # Centralized typed environment variables
│   ├── common/               # The 3 Immutable Pillars
│   │   ├── errors/           # AppError hierarchy & global error middleware
│   │   │   ├── app-error.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── index.ts
│   │   ├── middlewares/      # Zod validation checkpoint
│   │   │   ├── validate.middleware.ts
│   │   │   └── index.ts
│   │   ├── utils/            # ApiResponse envelope & asyncHandler
│   │   │   ├── api-response.ts
│   │   │   ├── async-handler.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── modules/              # Feature modules (Domain-driven structure)
│       └── health/           # Production health check module
│           ├── health.controller.ts
│           ├── health.router.ts
│           └── index.ts
└── tests/                    # Automated unit & integration tests
    ├── common.test.ts        # Tests for validation, error handler & responses
    └── health.test.ts        # Tests for health probe & 404 handler
```

---

## 🏛️ The 3 Immutable Pillars

### 1. Robust Error Handling (`src/common/errors/`)
Distinguishes between **operational errors** (expected client errors) and **programmer errors** (unhandled bugs).
- **`AppError`**: Base class providing `statusCode`, `isOperational`, and error metadata.
- Pre-built classes: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `UnprocessableEntityError` (422), `InternalServerError` (500).
- **`errorHandler`**: Catches `AppError`, converts `ZodError` into structured HTTP 400 responses, and masks internal stack traces in production.

```ts
import { NotFoundError } from '../../common/errors';

if (!user) {
  throw new NotFoundError('User with this ID does not exist');
}
```

### 2. Request Validation Checkpoint (`src/common/middlewares/`)
Declarative schema validation powered by [Zod](https://zod.dev). Automatically validates and transforms `req.body`, `req.query`, and `req.params`.

```ts
import { z } from 'zod';
import { validate } from '../../common/middlewares';

const createUserSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    age: z.number().int().positive().optional(),
  }),
};

router.post('/users', validate(createUserSchema), userController.create);
```

### 3. Standardized Response Envelope (`src/common/utils/`)
Ensures all responses follow a predictable JSON format for frontend clients and mobile apps:

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { ... },
  "meta": { "page": 1, "limit": 20 }
}
```

Usage in controllers:
```ts
import { ApiResponse } from '../../common/utils';

return ApiResponse.created(res, newUser, 'User created successfully');
```

---

## 🚀 Quick Start

### 1. Clone or Degit Template
Use `degit` to download a fresh copy without git history:
```bash
npx degit <your-github-username>/nodejs-clean-starter my-api
cd my-api
```

Or clone directly:
```bash
git clone https://github.com/<your-github-username>/nodejs-clean-starter.git my-api
cd my-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
The server will boot with hot-reload at `http://localhost:3000`.

---

## 🧪 Testing

Automated tests are pre-configured with **Jest** and **Supertest** for fast, reliable unit and integration testing without opening network sockets.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

---

## 🛠️ Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts server in development mode with `ts-node-dev` and hot reload |
| `npm run build` | Cleans `dist/` and compiles TypeScript to JavaScript (`tsc`) |
| `npm start` | Executes compiled production code from `dist/server.js` |
| `npm test` | Runs all test suites with Jest |
| `npm run test:watch` | Runs test runner in interactive watch mode |
| `npm run test:coverage` | Runs tests and outputs detailed code coverage table |

---

## 🔌 How to Add a New Module

Adding a new domain/feature module takes 3 clean steps:

1. **Create the module folder**: `src/modules/users/`
2. **Define Controller & Router**:
   ```ts
   // src/modules/users/user.controller.ts
   import { Request, Response } from 'express';
   import { ApiResponse, asyncHandler } from '../../common/utils';

   export class UserController {
     static getProfile = asyncHandler(async (req: Request, res: Response) => {
       const user = { id: 'u_123', name: 'John Doe' };
       return ApiResponse.success(res, user);
     });
   }
   ```
   ```ts
   // src/modules/users/user.router.ts
   import { Router } from 'express';
   import { UserController } from './user.controller';

   const userRouter = Router();
   userRouter.get('/me', UserController.getProfile);

   export { userRouter };
   ```
3. **Mount in `src/app.ts`**:
   ```ts
   import { userRouter } from './modules/users/user.router';
   
   app.use('/api/v1/users', userRouter);
   ```

---

## 🔒 Production Readiness & Graceful Shutdown

In modern containerized environments (Kubernetes, AWS ECS, GCP Cloud Run), pods and containers are frequently scaled up and terminated. 

`src/server.ts` implements enterprise-grade **Graceful Shutdown**:
- Intercepts `SIGTERM` and `SIGINT` signals.
- Halts receiving new HTTP requests.
- Waits for pending in-flight requests to complete.
- Implements a safety timeout (10s) before forced exit.
- Catches unhandled promise rejections (`unhandledRejection`) and crashes gracefully.

---

## 📄 License

This starter template is licensed under the [ISC License](LICENSE).
Feel free to use it for personal, commercial, or enterprise projects.
