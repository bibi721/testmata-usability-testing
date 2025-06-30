# Masada - Ethiopian Usability Testing Platform

A comprehensive platform connecting Ethiopian businesses with local users for usability testing.

## Features

- **Ethiopian User Panel** - 500+ verified local testers
- **Bilingual Testing** - Amharic and English support
- **Quick Results** - 24-hour turnaround
- **Mobile-First** - Optimized for Ethiopian usage patterns
- **Affordable Pricing** - Designed for local market

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- PostgreSQL Database
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- shadcn/ui

## Getting Started

### Database Setup

1. **Copy environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Start PostgreSQL with Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Run database setup script**:
   ```bash
   npm run db:setup
   ```

### Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## Project Structure

```
app/           # Next.js pages
components/    # React components
contexts/      # Auth & state management
lib/           # Utilities and database client
prisma/        # Database schema and migrations
public/        # Static assets
```

## Database Schema

The database includes models for:
- Users (Customers, Testers, Admins)
- Tests and Test Sessions
- Payments and Earnings
- Notifications
- Analytics

## Ethiopian-Specific Features

- Timezone: Africa/Addis_Ababa
- Currency: ETB
- Languages: Amharic & English
- Phone validation: Ethiopian phone numbers
- Regional data: All Ethiopian regions

## License

MIT

---

**Made in Ethiopia 🇪🇹**