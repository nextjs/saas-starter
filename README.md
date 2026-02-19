# LyricFlow - AI-Powered Songwriting & Lyric Enhancer

LyricFlow is a modern web application designed to help songwriters, poets, and wordsmiths break through creative blocks and craft perfect lyrics. Combining a distraction-free writing environment with powerful AI-driven enhancement tools, LyricFlow is your ultimate companion in the songwriting journey.

## 🚀 Features

- **Smart Lyric Editor**: A beautiful, minimalist editor designed specifically for songwriters.
- **AI Lyric Enhancer**: Get instant suggestions for lines, rhymes, and metaphors to elevate your songwriting.
- **Syllable Tracking**: Real-time syllable counts for every line to help you maintain perfect rhythm and meter.
- **Rhyme & Thesaurus Integration**: Quick-access tools for finding the perfect rhyme or synonym without leaving your workflow.
- **Project Management**: Organize your songs into albums, collections, or simple drafts.
- **Collaborative Workspaces**: Invite co-writers to your team and work on lyrics together in real-time.
- **Subscription Plans**: Access premium AI features and unlimited project storage with Stripe-powered plans.
- **Activity Logging**: Keep track of all changes and creative milestones in your projects.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Postgres](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: Custom session-based auth with [jose](https://github.com/panva/jose) and [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Payments**: [Stripe](https://stripe.com/) integration for subscriptions
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI, Lucide React)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/)
- [Postgres](https://www.postgresql.org/) database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/lyricflow.git
   cd lyricflow
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your configuration. You can use the included setup script:

   ```bash
   pnpm db:setup
   ```

4. **Initialize the database:**

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

   This will create a default user for testing:
   - **Email**: `test@test.com`
   - **Password**: `admin123`

5. **Run the development server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see LyricFlow in action.

## 💳 Payment & Subscriptions

LyricFlow uses Stripe to manage subscriptions. To test payments locally:

1. [Install the Stripe CLI](https://docs.stripe.com/stripe-cli).
2. Login to your Stripe account: `stripe login`.
3. Start the webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

Use the [Stripe test card numbers](https://docs.stripe.com/testing#cards) for development.

## 🚢 Deployment

LyricFlow is optimized for deployment on [Vercel](https://vercel.com/).

### Production Environment Variables

Ensure the following variables are set in your production environment:

- `BASE_URL`: Your production domain.
- `STRIPE_SECRET_KEY`: Production Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Production Stripe webhook secret.
- `POSTGRES_URL`: Connection string for your production database.
- `AUTH_SECRET`: A secure random string for JWT signing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
