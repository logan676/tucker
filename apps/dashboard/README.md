# Tucker Dashboard

Admin dashboard for platform operations management.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Ant Design 5.x
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: ECharts / Ant Design Charts
- **Testing**: Vitest + React Testing Library + Playwright

## Project Structure

```
src/
├── components/                 # Components
│   ├── common/                 # Common components
│   │   ├── Loading/
│   │   │   ├── index.tsx
│   │   │   └── Loading.test.tsx
│   │   ├── ErrorBoundary/
│   │   └── ConfirmModal/
│   ├── layout/                 # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── MainLayout/
│   └── charts/                 # Chart components
│       ├── LineChart/
│       ├── BarChart/
│       └── PieChart/
├── pages/                      # Pages
│   ├── dashboard/              # Dashboard
│   │   ├── index.tsx
│   │   └── Dashboard.test.tsx
│   ├── users/                  # User management
│   │   ├── index.tsx
│   │   ├── UserDetail.tsx
│   │   └── __tests__/
│   ├── merchants/              # Merchant management
│   │   ├── index.tsx
│   │   ├── MerchantDetail.tsx
│   │   ├── MerchantAudit.tsx
│   │   └── __tests__/
│   ├── orders/                 # Order management
│   │   ├── index.tsx
│   │   ├── OrderDetail.tsx
│   │   └── __tests__/
│   ├── products/               # Product management
│   │   └── index.tsx
│   ├── marketing/              # Marketing management
│   │   ├── Coupons.tsx
│   │   └── Activities.tsx
│   └── settings/               # System settings
│       ├── index.tsx
│       └── Admins.tsx
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useTable.ts
│   ├── useRequest.ts
│   └── __tests__/
├── services/                   # API services
│   ├── api.ts
│   ├── user.service.ts
│   ├── merchant.service.ts
│   ├── order.service.ts
│   └── __tests__/
├── stores/                     # State management
│   ├── auth.store.ts
│   ├── app.store.ts
│   └── __tests__/
├── types/                      # Type definitions
│   ├── user.ts
│   ├── merchant.ts
│   └── order.ts
├── utils/                      # Utility functions
│   ├── format.ts
│   ├── storage.ts
│   ├── request.ts
│   └── __tests__/
├── styles/                     # Styles
│   ├── global.css
│   └── variables.css
├── test/                       # Test configuration
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts         # MSW handlers
│   │   └── server.ts
│   └── utils.tsx               # Test utilities
├── e2e/                        # E2E tests (Playwright)
│   ├── auth.spec.ts
│   ├── merchants.spec.ts
│   └── orders.spec.ts
├── App.tsx
├── main.tsx
└── router.tsx
```

## Pages

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/` | Key metrics, trend charts |
| User Management | `/users` | User list, details, ban |
| Merchant Management | `/merchants` | Merchant list, audit, details |
| Order Management | `/orders` | Order list, details, refund handling |
| Product Management | `/products` | Product audit, removal |
| Marketing | `/marketing` | Coupons, campaign configuration |
| System Settings | `/settings` | Admins, permissions, configuration |

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview
```

## Testing

### Unit Tests (Vitest + React Testing Library)

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test -- UserList.test.tsx
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific E2E test
pnpm test:e2e -- auth.spec.ts
```

### Test Coverage Requirements

- Minimum unit test coverage: 80%
- All components must have unit tests
- All hooks must have unit tests
- Critical user flows must have E2E tests

### Test Examples

**Component Test:**
```typescript
// src/components/common/Loading/Loading.test.tsx
import { render, screen } from '@testing-library/react';
import { Loading } from './index';

describe('Loading', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display custom message', () => {
    render(<Loading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});
```

**Hook Test:**
```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ username: 'admin', password: 'password' });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

**E2E Test:**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'admin');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
});
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Tucker Dashboard
```
