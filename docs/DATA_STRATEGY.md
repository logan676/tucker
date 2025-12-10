# Tucker Platform - Data Strategy Document

## Overview

This document outlines the comprehensive data strategy for the Tucker food delivery platform. It covers all data entities needed for a mature product, current implementation status, and the approach for populating realistic seed data.

---

## 1. Data Categories

### 1.1 Core Business Data

| Entity | Purpose | Current Status | Data Volume Target |
|--------|---------|----------------|-------------------|
| **Merchants** | Restaurant/store listings | Implemented | 50-100+ |
| **Products** | Menu items | Implemented | 500-1000+ |
| **Product Categories** | Menu organization | Implemented | 5-8 per merchant |
| **Categories** | Business categories (Chinese, Japanese, etc.) | Implemented | 16 |
| **Users** | Customer accounts | Implemented | Auto-generated |
| **Addresses** | Delivery locations | Implemented | Per user |

### 1.2 Transaction Data

| Entity | Purpose | Current Status | Notes |
|--------|---------|----------------|-------|
| **Orders** | Purchase records | Implemented | Generated via app usage |
| **Order Items** | Line items per order | Implemented | Auto-linked |
| **Payments** | Transaction records | Implemented | Stripe integration |

### 1.3 Marketing & Engagement Data

| Entity | Purpose | Current Status | Data Volume Target |
|--------|---------|----------------|-------------------|
| **Banners** | Promotional banners/ads | Implemented | 8-15 |
| **Coupons** | Discount codes | Implemented | 6-20 |
| **User Coupons** | User's claimed coupons | Implemented | Auto-generated |
| **Reviews** | Customer feedback | Implemented | 5-15 per merchant |

### 1.4 System Data

| Entity | Purpose | Current Status | Notes |
|--------|---------|----------------|-------|
| **Notifications** | Push/in-app notifications | Implemented | Event-driven |

---

## 2. Image Assets Strategy

### 2.1 Food Images

All food images use **Unsplash** free images with specific dimensions for optimal loading:

- **Product thumbnails**: 400px width (`?w=400`)
- **Banner images**: 800px width (`?w=800`)
- **Restaurant logos**: 200px width (`?w=200`)

#### Food Image Categories Covered:

| Cuisine | Images | Examples |
|---------|--------|----------|
| Chinese | 8 | Kung Pao Chicken, Dim Sum, Fried Rice, Peking Duck |
| Japanese | 6 | Sushi, Sashimi, Ramen, Tempura, Teriyaki, Udon |
| Korean | 5 | Bibimbap, Korean BBQ, Kimchi Stew, Fried Chicken, Tteokbokki |
| Fast Food | 5 | Burger, Cheeseburger, Fries, Hotdog, Sandwich |
| Pizza/Italian | 4 | Pizza, Pepperoni Pizza, Pasta, Lasagna |
| Thai | 4 | Pad Thai, Green Curry, Tom Yum, Mango Sticky Rice |
| Indian | 5 | Butter Chicken, Biryani, Naan, Samosa, Tandoori |
| Seafood | 5 | Grilled Fish, Shrimp, Lobster, Crab, Oysters |
| BBQ/Grill | 4 | Ribs, Brisket, Steak, Grilled Chicken |
| Desserts | 6 | Cake, Cheesecake, Tiramisu, Ice Cream, Croissant, Macaron |
| Drinks | 5 | Bubble Tea, Coffee, Latte, Smoothie, Juice |
| Healthy | 4 | Salad, Poke Bowl, Acai Bowl, Avocado Toast |
| Breakfast | 4 | Pancakes, Eggs Benedict, French Toast, Omelette |

**Total: 65+ unique food images**

### 2.2 Restaurant Images

Each cuisine type has:
- **Logo image**: Square format, brand representation
- **Banner image**: Wide format, restaurant atmosphere

### 2.3 Promotional Banners

8 banner images covering:
- New user promotions
- Free delivery campaigns
- Flash sales
- Weekend specials
- Category highlights (healthy, desserts)
- Time-based deals (lunch, dinner)

---

## 3. Merchant Data Strategy

### 3.1 Current Implementation: 15 Merchants

| # | Name | Cuisine | Products | Monthly Sales |
|---|------|---------|----------|---------------|
| 1 | Golden Dragon Restaurant | Chinese | 8 | 8,500 |
| 2 | Tokyo Sushi Master | Japanese | 7 | 5,800 |
| 3 | Burger Kingdom | Fast Food | 7 | 12,200 |
| 4 | Seoul Kitchen | Korean | 6 | 7,100 |
| 5 | Pizza Paradise | Italian | 7 | 9,200 |
| 6 | Thai Spice Kitchen | Thai | 6 | 5,900 |
| 7 | Mumbai Spice House | Indian | 7 | 4,100 |
| 8 | Ocean Fresh Seafood | Seafood | 6 | 3,800 |
| 9 | Smoky BBQ Pit | BBQ | 7 | 6,200 |
| 10 | Sweet Dreams Bakery | Desserts | 6 | 4,800 |
| 11 | Bubble Tea House | Drinks | 6 | 15,500 |
| 12 | Coffee & Co | Cafe | 6 | 8,800 |
| 13 | Healthy Bites | Healthy | 6 | 4,900 |
| 14 | Sunrise Breakfast | Breakfast | 6 | 5,800 |
| 15 | Steak & Grill House | Western | 6 | 2,500 |

### 3.2 Merchant Data Attributes

Each merchant includes:
- **Basic Info**: name, description, phone, address
- **Location**: province, city, district, longitude, latitude
- **Business Metrics**: rating (4.4-4.9), ratingCount, monthlySales
- **Operations**: minOrderAmount, deliveryFee, deliveryTime, isOpen
- **Features**: Array of features (Dine-in, Delivery, Takeaway, etc.)
- **Visual Assets**: logo URL, banner URL
- **Products**: 6-8 products per merchant with real images

---

## 4. Product Data Strategy

### 4.1 Product Attributes

Each product includes:
- **Basic Info**: name, description, image URL
- **Pricing**: price, originalPrice (for discounts)
- **Sales Data**: monthlySales (100-4500+)
- **Flags**: isRecommend, isAvailable
- **Organization**: categoryId, sortOrder

### 4.2 Pricing Strategy

| Category | Price Range (¥) | Examples |
|----------|-----------------|----------|
| Drinks | 12-32 | Bubble tea, Coffee |
| Sides/Snacks | 12-25 | Fries, Samosa |
| Main Dishes | 28-68 | Burgers, Curries |
| Premium Items | 88-288 | Lobster, Wagyu, Peking Duck |

---

## 5. Review Data Strategy

### 5.1 Review Generation

- **Volume**: 5-15 reviews per merchant
- **Rating Distribution**: 4.0-5.0 stars (biased positive for demo)
- **Sub-ratings**: taste, packaging, delivery (1-5 scale)
- **Content**: 15 unique review templates covering various aspects

### 5.2 Review Templates

Reviews cover different aspects:
- Food quality and taste
- Delivery speed
- Packaging quality
- Value for money
- Authenticity
- Portion sizes

---

## 6. Coupon/Promotion Strategy

### 6.1 Current Coupons

| Code | Type | Value | Min Order | Validity |
|------|------|-------|-----------|----------|
| NEWUSER20 | Fixed | ¥20 off | ¥30 | 1 year |
| SAVE10 | Percentage | 10% off | ¥50 | 30 days |
| FREEDEL | Fixed | ¥8 off | ¥40 | 14 days |
| WEEKEND15 | Fixed | ¥15 off | ¥60 | 7 days |
| LUNCH25 | Percentage | 25% off | ¥35 | 30 days |
| FLASH50 | Percentage | 50% off | ¥80 | 3 days |

### 6.2 Coupon Types

1. **New User Coupons**: High value, one-time use
2. **Regular Discounts**: Percentage or fixed amount
3. **Time-limited**: Flash sales, weekend specials
4. **Category-specific**: Merchant or category restrictions
5. **Delivery Promotions**: Free or discounted delivery

---

## 7. Banner/Ads Strategy

### 7.1 Banner Types

| Type | Purpose | Placement |
|------|---------|-----------|
| HOME | Main carousel | Home screen top |
| CATEGORY | Category promotions | Category pages |
| PROMOTION | Special offers | Various |
| MERCHANT | Restaurant spotlight | Merchant pages |

### 7.2 Action Types

Banners can link to:
- **NONE**: Display only
- **MERCHANT**: Specific restaurant
- **CATEGORY**: Food category
- **PRODUCT**: Specific item
- **URL**: External link
- **COUPON**: Apply discount code

---

## 8. Data Gaps for Production

### 8.1 Additional Data Needed

| Category | Missing Data | Priority |
|----------|--------------|----------|
| Merchants | More variety (50+ total) | High |
| Products | Combo/set meals | Medium |
| Reviews | User photos in reviews | Medium |
| Promotions | Time-based flash deals | Medium |
| Users | Demo accounts | Low |

### 8.2 Recommended Additions

1. **More Merchant Variety**
   - Add 35+ more merchants
   - Include chains (McDonald's-style, Starbucks-style)
   - Add special dietary options (vegetarian, halal)

2. **Product Enhancements**
   - Add combo/set meals
   - Add customization options
   - Add spice level indicators

3. **Rich Media**
   - User-submitted review photos
   - Merchant video tours
   - Product preparation videos

4. **Time-based Promotions**
   - Happy hour deals
   - Late night specials
   - Holiday promotions

---

## 9. Running the Seed

### 9.1 Prerequisites

```bash
# Ensure database is running
docker-compose up -d postgres

# Ensure migrations are up to date
cd apps/api
npm run migration:run
```

### 9.2 Execute Seed

```bash
cd apps/api
npm run seed
```

### 9.3 Expected Output

```
Starting comprehensive seed...
Clearing existing data...
Creating categories... (16)
Creating merchants with products... (15 merchants, 99 products)
Creating coupons... (6)
Creating banners... (8)
Creating reviews... (150+ reviews)
Seed completed successfully!
```

---

## 10. API Endpoints for New Data

### 10.1 Banners API (To Be Created)

```
GET /api/v1/banners           - List active banners
GET /api/v1/banners/:type     - Get banners by type (home, category, etc.)
POST /api/v1/banners/:id/click - Track banner clicks
```

### 10.2 Reviews API (To Be Created)

```
GET /api/v1/merchants/:id/reviews  - Get merchant reviews
POST /api/v1/reviews               - Create review (auth required)
POST /api/v1/reviews/:id/like      - Like a review
```

---

## 11. Summary

| Metric | Current | Target |
|--------|---------|--------|
| Categories | 16 | 16+ |
| Merchants | 15 | 50-100 |
| Products | ~99 | 500+ |
| Reviews | ~150 | 500+ |
| Banners | 8 | 15+ |
| Coupons | 6 | 20+ |
| Food Images | 65+ | 100+ |

The current seed provides a solid foundation for development and testing. For production, expand merchant variety and add more dynamic promotional content.
