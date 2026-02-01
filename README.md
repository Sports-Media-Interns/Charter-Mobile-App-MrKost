# Sports Media Charter - Private Aviation Platform

A mobile-first charter aviation platform for professional sports organizations to manage private jet travel.

## Project Structure

```
charterjetapp/
├── apps/
│   ├── mobile/          # React Native/Expo mobile app
│   └── web/             # Next.js web dashboard (future)
├── packages/
│   ├── shared/          # Shared utilities and types
│   ├── ui/              # Shared UI components
│   └── database/        # Database types and utilities
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
└── Docs/                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Supabase CLI (optional, for local development)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```

4. Update `.env` with your Supabase credentials

### Development

Start the mobile app:

```bash
npm run dev:mobile
```

### Building for Production

#### iOS

```bash
npm run build:mobile:ios
```

#### Android

```bash
npm run build:mobile:android
```

## Tech Stack

- **Mobile**: React Native, Expo, Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Build**: Turborepo, EAS Build

## Features

- Biometric authentication (Face ID / Fingerprint)
- Charter request submission
- Multi-leg trip planning
- Real-time quote notifications
- Booking management
- Passenger manifest
- Push notifications

## License

UNLICENSED - Sports Media, Inc.
