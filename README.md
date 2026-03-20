# College Event Management System

Fullstack Node.js + Express + EJS + MySQL application with role-based access, bcrypt hash-chain authentication, QR generation/scanning, and meal desk workflow.

## Tech Stack

- Backend: Node.js, Express
- Frontend: EJS + Bootstrap
- Database: MySQL (mysql2)
- Auth: bcryptjs, jsonwebtoken, express-session
- QR: qrcode + html5-qrcode
- Email: nodemailer

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values.

3. Initialize schema (recommended):

```bash
npm run db:init
```

Alternative (MySQL CLI):

```sql
SOURCE sql/schema.sql;
```

4. Seed first Admin user:

```bash
npm run seed:admin
```

5. Start server:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## Core Routes

- `/auth/login` login page
- `/admin/dashboard` admin dashboard
- `/admin/register-student` register student + generate QR + email
- `/helpdesk/scan` scan QR and lookup student
- `/fooddesk/meals` meal desk updates with admin config checks

## Notes

- First Admin can be created with `npm run seed:admin` using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.
- Hash chain auth stores only bcrypt hashes (`PASSWORD_HASH`) and links to `prev_hash`.
- Events are soft-deleted using `deleted_at`.
