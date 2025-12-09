# Tucker Product Requirements

This document captures all the product requirements and specifications provided during the initial planning phase.

## 1. Product Overview

**Product Name:** Tucker

**Product Type:** Local life service platform (similar to Meituan/Ele.me)

## 2. Platform Requirements

### 2.1 Client Applications

The product requires a full-stack solution including:

- **Web** - Customer web application
- **Mobile Native**
  - iOS Native (Swift)
  - Android Native (Kotlin)
- **Dashboard** - Admin panel for platform operations

### 2.2 User Types

Two distinct versions of mobile clients:
- **Customer App** - For consumers to browse merchants, order food, and manage orders
- **Merchant App** - For merchants to manage stores and process orders

## 3. UI/UX Reference

Based on iOS screenshots analysis, the app should include:

### 3.1 Home Page
- Category navigation with icons
- Search functionality
- Banner/promotional carousel
- Recommended merchants section
- Special deals section ("Flash Sales")
- Nearby merchants list

### 3.2 Merchant List
- Filter options:
  - Delivery method (Express, Standard, Pickup)
  - Price range slider
  - Delivery time (15min, 30min, 40min, 50min, 60min)
  - Distance (1km, 2km, 3km)
  - Merchant features (New, Free delivery, Advance order, Invoice, Dine-in, etc.)
- Sort options (Distance, Rating, Sales, etc.)

### 3.3 Merchant Detail Page
- Store banner/images
- Store info (rating, monthly sales, delivery time, distance)
- Delivery/Pickup toggle
- Coupon section
- Menu tabs (Order, Deals, Reviews, Store Info)
- Product categories sidebar
- Product list with images, prices, sales count
- Add to cart functionality

### 3.4 Product Features
- Original price with strikethrough
- Discounted price display
- Monthly sales count
- User likes/ratings
- Product options/variants
- Quantity selector

### 3.5 Shopping Cart
- Cart summary at bottom
- Minimum order amount indicator
- Delivery fee display
- Total calculation
- Checkout button

### 3.6 Address Management
- City selection
- Saved addresses (Home, Office labels)
- Nearby address suggestions
- GPS location

### 3.7 Reviews Section
- Overall rating display
- Rating breakdown (Product quality, Service)
- Review filters (All, Latest, Positive, Negative, With images)
- Review tags (Taste, Portion size, Fresh ingredients, etc.)
- Merchant reply functionality

## 4. Technical Requirements

### 4.1 Documentation
- All project documentation should be in **English**
- Chat/communication can be in Chinese

### 4.2 Testing
Comprehensive testing required for all platforms:
- **Backend (API)** - Unit tests, E2E tests
- **Dashboard** - Unit tests, E2E tests
- **Web Frontend** - Unit tests, E2E tests
- **iOS** - Unit tests, UI tests
- **Android** - Unit tests, Instrumented tests

### 4.3 CI/CD
- GitHub Actions pipelines for all applications
- Automated testing in pipelines
- Automated deployment workflows

### 4.4 Background Tasks
- Large amount of background task execution required
- Async job processing (order processing, notifications, etc.)

### 4.5 Location Services
- Mobile apps require extensive location-based services
- Nearby merchant discovery
- Delivery address location
- Distance calculation
- Real-time location tracking (for delivery)

### 4.6 Logging System
Comprehensive logging required across all platforms:
- **Frontend (Web/Dashboard)** - Client-side logging
- **Backend (API)** - Server-side logging
- **Mobile (iOS/Android)** - App logging

Purposes:
- Debug logging for development
- Business analytics data collection
- Error tracking and monitoring
- User behavior analysis

### 4.7 Payment & Settlement System
Complete payment flow required:
- **Frontend/Mobile → Backend** payment integration
- Payment gateway integration
- Order settlement system
- Transaction management
- Refund handling

## 5. Version Control

- Use Git for version control
- Repository: `git@github.com:logan676/tucker.git`
- Commit changes by function/feature
- Push commits regularly

## 6. Future Considerations

Based on the reference app, additional features to consider:
- Coupon/voucher system
- Membership/loyalty program
- Group ordering
- Scheduled ordering
- In-app messaging
- Push notifications
- Order tracking
- Delivery partner integration
- Rating and review system
- Merchant analytics dashboard
