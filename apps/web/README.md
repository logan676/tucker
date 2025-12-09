# Tucker Web

Customer web application for browsing merchants, ordering food, and managing orders.

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios / SWR
- **UI Components**: Custom components + Headless UI
- **Testing**: Jest + React Testing Library + Playwright

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                # Home page
│   ├── search/
│   │   └── page.tsx            # Search results page
│   ├── merchant/
│   │   └── [id]/
│   │       └── page.tsx        # Merchant detail page
│   ├── cart/
│   │   └── page.tsx            # Cart page
│   ├── order/
│   │   ├── page.tsx            # Order list
│   │   ├── confirm/
│   │   │   └── page.tsx        # Order confirmation page
│   │   └── [id]/
│   │       └── page.tsx        # Order detail page
│   └── user/
│       ├── page.tsx            # User profile
│       └── address/
│           └── page.tsx        # Address management
├── components/                 # Components
│   ├── common/                 # Common components
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   └── Loading/
│   ├── layout/                 # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── TabBar/
│   │   └── MainLayout/
│   ├── home/                   # Home page components
│   │   ├── CategoryNav/
│   │   ├── Banner/
│   │   ├── MerchantCard/
│   │   └── RecommendSection/
│   ├── merchant/               # Merchant components
│   │   ├── MerchantHeader/
│   │   ├── MenuList/
│   │   ├── ProductCard/
│   │   └── ReviewList/
│   ├── cart/                   # Cart components
│   │   ├── CartItem/
│   │   └── CartSummary/
│   ├── order/                  # Order components
│   │   ├── OrderCard/
│   │   └── OrderStatus/
│   └── user/                   # User components
│       ├── AddressCard/
│       └── ProfileForm/
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useLocation.ts
│   ├── useRequest.ts
│   └── __tests__/
├── services/                   # API services
│   ├── api.ts
│   ├── auth.service.ts
│   ├── merchant.service.ts
│   ├── order.service.ts
│   ├── user.service.ts
│   └── __tests__/
├── stores/                     # State management
│   ├── auth.store.ts
│   ├── cart.store.ts
│   ├── location.store.ts
│   └── __tests__/
├── types/                      # Type definitions
│   ├── merchant.ts
│   ├── product.ts
│   ├── order.ts
│   └── user.ts
├── utils/                      # Utility functions
│   ├── format.ts
│   ├── storage.ts
│   ├── location.ts
│   └── __tests__/
├── styles/                     # Styles
│   └── globals.css
├── __tests__/                  # Integration tests
│   └── pages/
└── e2e/                        # E2E tests (Playwright)
    ├── home.spec.ts
    ├── merchant.spec.ts
    ├── cart.spec.ts
    └── order.spec.ts
```

## Pages

| Page | Route | Features |
|------|-------|----------|
| Home | `/` | Category navigation, search, recommended merchants |
| Search | `/search` | Merchant/product search, filtering |
| Merchant Detail | `/merchant/[id]` | Store info, menu, reviews |
| Cart | `/cart` | Selected items, checkout |
| Order Confirmation | `/order/confirm` | Address selection, payment method |
| Order List | `/order` | Order history |
| Order Detail | `/order/[id]` | Order status, item details |
| User Profile | `/user` | User info, settings |
| Address Management | `/user/address` | Address CRUD |

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Start production server
pnpm start
```

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Test Coverage Requirements

- Minimum unit test coverage: 80%
- All components must have unit tests
- All hooks must have unit tests
- User journeys must have E2E tests (browse -> add to cart -> checkout)

### Test Examples

**Component Test:**
```typescript
// src/components/common/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './index';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**E2E Test:**
```typescript
// e2e/order.spec.ts
import { test, expect } from '@playwright/test';

test('complete order flow', async ({ page }) => {
  // Browse merchant
  await page.goto('/');
  await page.click('[data-testid="merchant-card"]');

  // Add item to cart
  await page.click('[data-testid="add-to-cart"]');

  // Go to cart
  await page.click('[data-testid="cart-button"]');

  // Proceed to checkout
  await page.click('[data-testid="checkout-button"]');

  // Confirm order
  await page.click('[data-testid="confirm-order"]');

  // Verify order created
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=Tucker
```
