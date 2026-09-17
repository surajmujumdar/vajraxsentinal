# VAJRA - Frontend

Next.js 15 frontend for the VAJRA with TypeScript, TailwindCSS, and Framer Motion.

## Features

- Modern React 19 with Next.js 15 App Router
- TypeScript for type safety
- TailwindCSS for styling with custom dark theme
- Framer Motion for smooth animations
- Zustand for state management
- Real-time WebSocket integration
- Interactive maps with React Simple Maps
- Data visualization with Recharts
- Responsive design
- Dark theme with blue highlights and red threat colors
- Glow effects for visual emphasis

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Start development server:
```bash
npm run dev
```

4. Access the application at http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── TopCards.tsx          # Dashboard top cards
│   │   ├── CriticalAlerts.tsx    # Alert cards
│   │   ├── GlobalAttackMap.tsx   # World attack map
│   │   ├── ThreatIntelligenceSummary.tsx  # Threat intel summary
│   │   ├── RansomwareLive.tsx    # Ransomware table
│   │   └── BottomSection.tsx     # Bottom section
│   ├── services/         # API services
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── threat.service.ts
│   │   ├── ransomware.service.ts
│   │   ├── news.service.ts
│   │   └── report.service.ts
│   └── store/            # Zustand stores
│       ├── authStore.ts
│       ├── dashboardStore.ts
│       ├── threatStore.ts
│       └── ransomwareStore.ts
├── public/               # Static assets
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## Components

### Dashboard Components

- **Sidebar** - Collapsible navigation with menu items
- **Navbar** - Search, notifications, language, AI bot, profile
- **TopCards** - Data source, last updated, attacks, threat actors
- **CriticalAlerts** - Horizontal scrolling alert cards
- **GlobalAttackMap** - Interactive world map with attack animations
- **ThreatIntelligenceSummary** - Threat scores and trends
- **RansomwareLive** - Ransomware incident table
- **BottomSection** - News, trends, executive summary

## State Management

The application uses Zustand for state management:

- **authStore** - User authentication state
- **dashboardStore** - Dashboard data and alerts
- **threatStore** - Threat intelligence data
- **ransomwareStore** - Ransomware incident data

## API Services

All API calls are handled through service modules:

- `auth.service.ts` - Authentication endpoints
- `dashboard.service.ts` - Dashboard data
- `threat.service.ts` - Threat intelligence
- `ransomware.service.ts` - Ransomware data
- `news.service.ts` - Cyber threat news
- `report.service.ts` - PDF report generation

## Styling

The application uses TailwindCSS with a custom dark theme:

- **Background**: `#0a0e17` (dark blue-black)
- **Card**: `#111827` (dark gray)
- **Primary**: `#3b82f6` (blue)
- **Danger**: `#ef4444` (red)
- **Warning**: `#f59e0b` (amber)
- **Success**: `#10b981` (green)
- **Accent**: `#06b6d4` (cyan)

Custom utilities:
- `.text-glow` - Blue text glow effect
- `.text-glow-red` - Red text glow effect
- `.border-glow` - Blue border glow effect
- `.border-glow-red` - Red border glow effect
- `.scrollbar-hide` - Hide scrollbar

## WebSocket Integration

The application connects to the WebSocket endpoint for real-time updates:

```typescript
const ws = new WebSocket('ws://localhost:8000/ws/dashboard')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle real-time updates
}
```

## Environment Variables

See `.env.example` for available environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

## Docker

Build and run with Docker:
```bash
docker build -t ai-security-frontend .
docker run -p 3000:3000 ai-security-frontend
```

Or use docker-compose from the project root:
```bash
docker-compose up frontend
```

## Development

### Adding New Components

1. Create component in `src/components/`
2. Import and use in parent component
3. Add any necessary state management
4. Create corresponding API service if needed

### Adding New API Services

1. Create service in `src/services/`
2. Use axios for HTTP requests
3. Add error handling
4. Update state management if needed

## Performance

- Next.js automatic code splitting
- Image optimization with next/image
- Lazy loading of components
- Optimized bundle size
- Efficient re-renders with React 19
