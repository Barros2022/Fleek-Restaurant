# Fleek - Restaurant Feedback Collection Platform

## Overview

Fleek is a micro-SaaS application designed for restaurants and small businesses to collect customer feedback via QR codes. The platform enables business owners to create accounts, generate unique QR codes for their establishments, collect customer ratings and comments through a mobile-friendly feedback form, and visualize feedback metrics through a dashboard.

The application is a full-stack TypeScript project with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

The frontend follows a page-based structure with reusable components. Key pages include:
- Landing page (marketing/home)
- Authentication pages (login/register)
- Dashboard (protected, for business owners)
- Public feedback form (accessible via QR code)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy (email/password)
- **Session Management**: Express-session with memory store (development) or PostgreSQL store (production)
- **Password Hashing**: Node.js crypto with scrypt
- **API Design**: RESTful endpoints under `/api/*` prefix

The server handles:
- User registration and authentication
- Feedback submission and retrieval
- Statistics calculation (NPS scores, category averages)
- Static file serving in production

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)

Database tables:
- `users`: Business accounts (id, username/email, password, businessName, createdAt)
- `feedbacks`: Customer ratings (id, userId, npsScore, ratingFood, ratingService, ratingWaitTime, ratingAmbiance, comment, createdAt)

### Shared Code Structure
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas
- `routes.ts`: API route definitions with input/output types

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds static assets, esbuild bundles server code
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations and database management

### Frontend Libraries
- **qrcode.react**: QR code generation for feedback links
- **recharts**: Data visualization for dashboard metrics
- **date-fns**: Date formatting and manipulation (Portuguese locale support)
- **lucide-react**: Icon library

### Backend Libraries
- **connect-pg-simple**: PostgreSQL session store (production)
- **passport / passport-local**: Authentication middleware

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Deploy na Vercel

### Arquivos Criados para Deploy
- `api/index.ts`: Express serverless para Vercel
- `vercel.json`: Configuracao do Vercel
- `client/package.json`: Package.json do frontend

### Passos para Deploy

1. **Conectar ao GitHub**
   - Faca push do codigo para um repositorio no GitHub

2. **Importar no Vercel**
   - Acesse vercel.com e faca login
   - Clique em "Add New Project"
   - Selecione o repositorio do GitHub

3. **Configurar Variaveis de Ambiente**
   No painel do Vercel, adicione as seguintes variaveis:
   - `SUPABASE_DATABASE_URL`: URL de conexao do Supabase (Direct Connection, porta 5432)
   - `SESSION_SECRET`: Uma string secreta para as sessoes (ex: gere com `openssl rand -hex 32`)

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar

### Variaveis de Ambiente Necessarias

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `SUPABASE_DATABASE_URL` | URL do PostgreSQL do Supabase | `postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` |
| `SESSION_SECRET` | Chave secreta para sessoes | `sua-chave-secreta-aqui` |

### Notas Importantes
- As sessoes sao armazenadas no PostgreSQL (tabela `session` sera criada automaticamente)
- A API roda como funcao serverless (max 10 segundos por requisicao)
- O frontend e servido como arquivos estaticos pela CDN da Vercel