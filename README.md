# 🚀 ProjectFlow — Full-Stack Project Management Tool

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A production-ready project management application built with **NestJS 10**, **React 19**, **MongoDB**, and **TypeScript** throughout.

---

## ✨ Features

### 🛠 Backend (NestJS 10)
- **JWT Authentication** — Register, login, and `GET /auth/me` with Passport + strategy pattern.
- **Bcrypt Hashing** — Secure password hashing with a cost factor of 12.
- **Projects CRUD** — Complete project management with pagination and search.
- **Tasks CRUD** — Task management nested under projects with status filtering.
- **Strict Ownership** — Users can only access and modify their own projects/tasks.
- **MongoDB Optimization** — Compound indexes, text search, and parallel query execution.
- **Global Validation** — Standardized DTOs using `class-validator` and `class-transformer`.
- **Response Handling** — Global interceptors for success and filters for error formatting.
- **Database Seeder** — Populate the database with sample data using a single command.

### 💻 Frontend (React 19)
- **TanStack Query v5** — Advanced caching, pagination, and optimistic updates.
- **Redux Toolkit** — Robust state management with `redux-persist` for session persistence.
- **React Hook Form + Yup** — Comprehensive client-side form validation.
- **React Router v6** — Advanced route guarding for public and private pages.
- **Tailwind CSS 3** — Modern, responsive design with a custom theme.
- **Axios Interceptors** — Automatic JWT attachment and 401 error handling.
- **UI/UX Features** — Search filtering, inline status toggles, skeleton loaders, and mobile-responsive navigation.

---

## 🗂 Project Structure

```text
project-management/
├── backend/
│   ├── src/
│   │   ├── auth/          # JWT auth, strategies, DTOs
│   │   ├── users/         # User schema, service
│   │   ├── projects/      # Project schema, CRUD, pagination
│   │   ├── tasks/         # Task schema, CRUD, filters
│   │   └── common/        # Guards, filters, interceptors, decorators
│   └── seed/
│       └── seed.ts        # DB seeder
│
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with interceptors
    │   ├── components/    # UI components
    │   ├── hooks/         # TanStack Query hooks
    │   ├── pages/         # Route-level pages
    │   ├── store/         # Redux store, authSlice, persist config
    │   ├── types/         # TypeScript interfaces
    │   └── utils/         # Helpers, yup validation schemas
    └── vite.config.ts
```

---

## 🚀 Local Setup

### Prerequisites
- **Node.js**: Version 20 or higher
- **MongoDB**: Local server or Atlas cloud instance

### Quick Start
Follow these steps to get the project running locally:

#### Step 1: Setup Backend
```bash
cd backend
npm install
npm run start:dev    # Server runs at http://localhost:5000/api/v1
```

#### Step 2: Seed the Database
```bash
cd backend
npm run seed         # Creates test@example.com / Test@123 with sample data
```

#### Step 3: Setup Frontend
```bash
cd frontend
npm install
npm run dev          # App runs at http://localhost:5173
```

### 🔑 Test Credentials
| Field    | Value            |
| :------- | :--------------- |
| **Email** | `test@example.com` |
| **Password** | `Test@123`        |

---

## 📖 API Reference
*All endpoints (except Authentication) require a Bearer Token in the headers.*

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/auth/me` | Fetch current user profile |

### 📁 Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/projects` | List projects (paginated + searchable) |
| `GET` | `/projects/stats` | Get project count breakdown by status |
| `GET` | `/projects/:id` | Get single project details |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/:id` | Update project information |
| `DELETE` | `/projects/:id` | Delete a project |

### 📝 Tasks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/projects/:pid/tasks` | List all tasks for a project |
| `GET` | `/projects/:pid/tasks/:id` | Get single task details |
| `POST` | `/projects/:pid/tasks` | Create a task within a project |
| `PUT` | `/projects/:pid/tasks/:id` | Update task status or content |
| `DELETE` | `/projects/:pid/tasks/:id` | Delete a task |

---

## 🧪 Testing
```bash
cd backend
npm run test        # Unit tests
npm run test:cov    # Coverage report
```

---

## ⚙️ Environment Variables

### Backend `.env`
(Located in `/backend` folder)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env.local`
(Located in `/frontend` folder)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## ⚠️ Known Limitations
- No email verification or password reset flows
- No file attachment support for tasks
- No real-time updates (WebSockets)
- Tasks listing is not yet paginated
- Team collaboration features are pending

---

## 🛠 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Backend** | NestJS 10, TypeScript, Passport, JWT |
| **Database** | MongoDB 7, Mongoose 8 |
| **Frontend** | React 19, TypeScript, Vite 5 |
| **State** | Redux Toolkit (Auth Persistence) + TanStack Query v5 |
| **Forms** | React Hook Form 7 + Yup |
| **Styling** | Tailwind CSS 3 |
| **HTTP** | Axios with interceptors & Redux integration |
| **Testing** | Jest + @nestjs/testing |

---

## ✍️ Author
**Ashish Babu Rao** — Full Stack Developer  
*Built with passion using NestJS, React 19, and MongoDB.*