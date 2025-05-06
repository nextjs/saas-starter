# MCP SaaS Starter Kit

A modern SaaS application starter template built with **Next.js 15.4.0-canary.9**, featuring user authentication, team management, Stripe payments, and activity logging. Designed for rapid development and deployment, helping you build professional-grade SaaS products in ONE DAY.

**Demo: [https://mcp.day/](https://mcp.day/)**
*test account: 1@love2.dev, pwd:love2dev*
*[中文文档](README_zh.md)*

## ✨ Core Features


- **User Authentication** - Secure JWT-based authentication with email/password login
- **Team Collaboration** - Complete team creation, member invitations, and permission management
- **Subscription Payments** - Seamless Stripe integration supporting multiple subscription plans
- **Activity Logging** - Comprehensive user action tracking system for auditing and analysis
- **Responsive Design** - Modern UI that adapts perfectly to mobile and desktop devices
- **Light/Dark Themes** - Support for light/dark theme switching to enhance user experience

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 15.4.0-canary.9](https://nextjs.org/) - With App Router and React Server Components
- **Database with Supabase**: [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe modern ORM
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Highly customizable component library
- **Payment Processing**: [Stripe](https://stripe.com/) - Secure and reliable payment solution
- **Styling**: [Tailwind CSS + Shadcn/ui](https://tailwindcss.com/) - Utility-first CSS framework
- **Deployment**: [Vercel](https://vercel.com/) one-click deployment support

## 🚀 Quick Start

### Clone the Project

```bash
git clone https://github.com/Anson2Dev/mcp-saas-kit
cd mcp-saas-kit
pnpm install
```

### Environment Setup

1. **Set Up Stripe**

   [Install Stripe CLI](https://docs.stripe.com/stripe-cli) and log in:

   ```bash
   stripe login
   ```

2. **Create Environment Variables**

   Run the setup script to generate your `.env` file:


   ```bash
   cp .env.example .env
   // TODO pnpm db:setup
   ```

3. **Initialize Database**

   ```bash
   pnpm db:migrate
   // TODO pnpm db:seed
   ```

   
4. **Start Development Server**

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the application

5. **Listen for Stripe Webhooks**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## 💳 Test Payments

Use Stripe test card:
- Card Number: `4242 4242 4242 4242`
- Expiry Date: Any future date
- CVC: Any 3 digits

## 🌐 Production Deployment

### 1. Configure Stripe

Create a production webhook in the Stripe dashboard with the endpoint set to `https://yourdomain.com/api/stripe/webhook`.

### 2. Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the repository in Vercel and deploy
3. Configure the following environment variables:
   - `POSTGRES_URL`: Your Supabase URL
   - `BASE_URL`: Your production domain
   - `STRIPE_SECRET_KEY`: Production Stripe key
   - `STRIPE_WEBHOOK_SECRET`: Production webhook secret
   - `POSTGRES_URL`: Production database URL
   - `AUTH_SECRET`: Random string (`openssl rand -base64 32`)

## 📂 Project Structure

```
app/
├── (marketing)/ - Marketing pages (home, pricing, blog, docs)
├── (auth)/ - Authentication pages (sign-in, sign-up)
├── dashboard/ - Dashboard pages (overview, team, account, activity logs)
├── api/ - API routes (user, team, payments, activity)
├── lib/ - Core libraries
│   ├── auth/ - Authentication functionality
│   ├── db/ - Database functionality
│   └── payments/ - Payment functionality
└── components/ - UI components
```

## 🔑 Project Highlights

- **Clean Architecture** - Clear directory structure based on Next.js App Router
- **Integrated Account Management** - Account information and security settings in one place
- **Complete Team Functionality** - Support for team creation, member invitations, and permission management
- **Multilingual Support** - Interface and documentation available in English and Chinese
- **Activity Logging System** - Detailed user action tracking with pagination and filtering
- **Theme Switching** - Support for light/dark themes, automatically adapting to system settings

## 🔄 Recent Updates

- Integrated security features into the account page for a simplified user experience
- Optimized responsive layout for mobile devices
- Added pagination to activity logs
- Improved team management interface
- Implemented light/dark theme switching
- Optimized dashboard layout by removing unnecessary navigation elements

## 🤝 Contributing

Here's my first opensource project, so it's not perfect. I need your contribution to make it better.

If you have any suggestions or improvements, please open an issue or submit a pull request.

For any questions, please contact: anson@love2.dev

## Thanks
- Vercel saas-starter-kit
- Vibe coder: Augment & Cursor, they're contributing 90% of the code.
