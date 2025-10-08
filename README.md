# Sunlighten - Partner Storage

A comprehensive Next.js application for partners to upload and manage Android tablet OTA images with enterprise-grade features and robust testing.

## Features

- **File Management**: Upload, download, and manage OTA image files
- **Space Management**: Organize files by teams/partners
- **User Authentication**: Secure JWT-based authentication system
- **Role-Based Access**: Owner and Member roles with different permissions
- **Activity Logging**: Comprehensive audit trail for all actions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Comprehensive Testing**: Full E2E test suite with Playwright
- **API Integration**: RESTful APIs with proper error handling
- **File Validation**: Type and size validation for uploads
- **Progress Tracking**: Real-time upload progress and status

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/) for file uploads
- **Authentication**: Custom JWT-based session system
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom components
- **Testing**: [Playwright](https://playwright.dev/) for E2E testing
- **UI Components**: Custom components with [Radix UI](https://www.radix-ui.com/)
- **Validation**: [Zod](https://zod.dev/) for schema validation

## Getting Started

```bash
git clone <repository-url>
cd external_storage_portal
npm install
```

## Running Locally

### 1. Environment Setup

Create your `.env.local` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ota_portal"
AUTH_SECRET="your-secret-key-here"
S3_ACCESS_KEY_ID="your-aws-access-key"
S3_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_REGION="us-east-1"
S3_BUCKET="your-s3-bucket-name"
```

### 2. Database Setup

```bash
# Setup database
npm run db:setup

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

This creates:
- **Test User**: `test@test.com` / `admin123`
- **Test Space**: Blaupunkt OTA images
- **Sample Data**: Users, teams, and file records

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

**Production URL**: [https://partner-storage.infra.sunlighten.com](https://partner-storage.infra.sunlighten.com)

## Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
```

### Test Categories

- **Authentication**: Login, logout, session management
- **Dashboard**: Navigation, data display, responsive design
- **Spaces**: File management, upload/download, metadata
- **API Integration**: Endpoint testing, error handling
- **File Upload**: Various file types, progress tracking

### Test Documentation

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard pages
│   ├── (login)/           # Authentication pages
│   └── api/               # API routes
├── lib/                   # Core application logic
│   ├── auth/              # Authentication system
│   ├── db/                # Database schema and queries
│   └── s3/                # AWS S3 integration
├── tests/                 # E2E test suite
│   ├── utils/             # Test utilities and helpers
│   └── *.spec.ts          # Test files
├── components/            # Reusable UI components
└── docs/                  # Project documentation
```

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `POSTGRES_URL`: Set this to your production database URL.
3. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
