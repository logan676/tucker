# Tucker iOS Customer App - Feature Gap Analysis

This document maps the PRD requirements to current implementation status for the iOS Customer App.

---

## Summary

| Category | PRD Features | Implemented | Partial | Not Started |
|----------|-------------|-------------|---------|-------------|
| Home & Browse | 8 | 4 | 2 | 2 |
| Search & Filter | 6 | 2 | 2 | 2 |
| Merchant Detail | 10 | 5 | 3 | 2 |
| Cart & Checkout | 8 | 5 | 2 | 1 |
| Orders | 6 | 2 | 2 | 2 |
| Profile | 8 | 3 | 3 | 2 |
| Notifications | 3 | 0 | 0 | 3 |
| **Total** | **49** | **21 (43%)** | **14 (29%)** | **14 (29%)** |

---

## Detailed Feature Gap Analysis

### 1. Home & Browse (PRD Section 2)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 1.1 Location Header | Display current location with edit option | ✅ Done | `HomeView.swift:49-81` | None |
| 1.2 Banner Carousel | Rotating promotional banners | ✅ Done | `HomeView.swift:104-143` | None |
| 1.3 Category Grid | Browse by food categories | ✅ Done | `HomeView.swift:169-205` | None |
| 1.4 Quick Actions | Deals, Fast, Coupons, Top Rated buttons | ✅ Done | `HomeView.swift:145-167` | None |
| 1.5 Flash Deals | Time-limited special offers section | 🟡 Partial | Basic card only | Missing countdown timer, actual deals from API |
| 1.6 Nearby Restaurants | Restaurant list with filters | 🟡 Partial | List displayed | Missing sort filter functionality |
| 1.7 Pickup Mode Tab | Toggle between Delivery/Pickup | ❌ Not Started | N/A | Need `PickupHomeView.swift` |
| 1.8 Pull to Refresh | Refresh content | ✅ Done | `HomeView.swift:39-41` | None |

### 2. Search & Filter (PRD Section 3)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 2.1 Search Bar | Search restaurants/dishes | ✅ Done | `SearchView.swift:65-96` | None |
| 2.2 Category Pills | Filter by category | ✅ Done | `SearchView.swift:102-120` | None |
| 2.3 Sort Options | Sort by rating/distance/sales | 🟡 Partial | UI only | Distance sort not functional |
| 2.4 Filter Sheet | Advanced filters (fee, rating, time) | 🟡 Partial | `FilterSheet` component | Delivery time filter not connected to API |
| 2.5 Search History | Recent searches | ❌ Not Started | N/A | Need local storage |
| 2.6 Voice Search | Voice input for search | ❌ Not Started | N/A | Optional feature |

### 3. Merchant Detail (PRD Section 4)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 3.1 Banner & Logo | Restaurant header with image | ✅ Done | `MerchantDetailView.swift:53-94` | None |
| 3.2 Store Info | Rating, sales, delivery time | ✅ Done | `MerchantDetailView.swift:96-171` | None |
| 3.3 Deal Badges | Promotional badges | ✅ Done | `MerchantDetailView.swift:174-188` | None |
| 3.4 Delivery/Pickup Toggle | Switch ordering mode | ✅ Done | `MerchantDetailView.swift:190-231` | None |
| 3.5 Category Sidebar | Menu category navigation | ✅ Done | `MerchantDetailView.swift:237-270` | None |
| 3.6 Product Grid | Menu items with add to cart | 🟡 Partial | List view only | PRD shows grid option |
| 3.7 Product Options | Size/add-ons selection | ❌ Not Started | N/A | Need product customization modal |
| 3.8 Reviews Tab | Customer reviews | 🟡 Partial | No dedicated tab | Need `ReviewsView.swift` |
| 3.9 Store Info Tab | Full store details, hours | 🟡 Partial | Basic info only | Need `MerchantInfoView.swift` |
| 3.10 Photo Gallery | Restaurant photos | ❌ Not Started | N/A | Need `GalleryView.swift` |

### 4. Cart & Checkout (PRD Section 5-6)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 4.1 Floating Cart Bar | Sticky cart summary | ✅ Done | `MerchantDetailView.swift:455-524` | None |
| 4.2 Cart Sheet | Slide-up cart view | ❌ Not Started | Uses full page | Need `CartSheet.swift` |
| 4.3 Address Selection | Choose delivery address | ✅ Done | `CheckoutView.swift:120-210` | None |
| 4.4 Delivery Time | Schedule delivery | ✅ Done | `CheckoutView.swift:212-239` | None |
| 4.5 Order Items List | Review items | ✅ Done | `CheckoutView.swift:241-318` | None |
| 4.6 Coupon Selection | Apply coupons | 🟡 Partial | Button only | Need `CouponSheet.swift` |
| 4.7 Price Summary | Subtotal, fees, total | ✅ Done | `CheckoutView.swift:377-402` | None |
| 4.8 Submit Order | Create order and navigate to payment | 🟡 Partial | Works | Need better error handling |

### 5. Orders (PRD Section 7)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 5.1 Order List | Display all orders | ✅ Done | `OrdersView.swift:43-54` | None |
| 5.2 Order Status Tabs | Filter by status | ❌ Not Started | N/A | Need tab bar (All/Pending/Completed) |
| 5.3 Order Card | Order summary | ✅ Done | `OrdersView.swift:77-145` | None |
| 5.4 Order Detail | Full order details | 🟡 Partial | No navigation | Need `OrderDetailView.swift` |
| 5.5 Order Tracking | Real-time tracking with map | ❌ Not Started | N/A | Need `OrderTrackingView.swift` |
| 5.6 Rate Order | Post-order review | 🟡 Partial | No UI | Need `ReviewOrderView.swift` |

### 6. Profile (PRD Section 9-10)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 6.1 User Info | Avatar, name, phone | ✅ Done | `ProfileView.swift:12-32` | None |
| 6.2 Address Management | Add/Edit/Delete addresses | 🟡 Partial | `AddressListView` placeholder | Need full implementation |
| 6.3 Favorites | Saved restaurants | 🟡 Partial | `FavoritesView` placeholder | Need full implementation |
| 6.4 Coupons | My coupons list | 🟡 Partial | `CouponsView` placeholder | Need API integration |
| 6.5 Settings | App settings | ✅ Done | `SettingsView.swift:150-170` | Basic |
| 6.6 Help & Support | FAQ, Contact | ✅ Done | `HelpView.swift:172-184` | Basic |
| 6.7 Edit Profile | Update user info | ❌ Not Started | N/A | Need `EditProfileView.swift` |
| 6.8 Payment Methods | Manage cards | ❌ Not Started | N/A | Need `PaymentMethodsView.swift` |

### 7. Notifications (PRD Section 8)

| Feature | PRD Requirement | Status | Current Implementation | Gap |
|---------|----------------|--------|------------------------|-----|
| 7.1 Message Center | Notification list | ❌ Not Started | N/A | Need `MessageCenterView.swift` |
| 7.2 Order Updates | Real-time order notifications | ❌ Not Started | N/A | Need WebSocket integration |
| 7.3 Promotions | Marketing notifications | ❌ Not Started | N/A | Need push notification setup |

---

## Priority Implementation Roadmap

### Phase 1: Core Experience Polish (High Priority)

1. **Order Detail View** - Users need to see full order details
   - Create `OrderDetailView.swift`
   - Add navigation from `OrderCard`

2. **Address Management** - Required for checkout flow
   - Enhance `AddressListView.swift` with CRUD
   - Add address editing in `AddAddressView.swift`

3. **Coupon Selection** - Important for user engagement
   - Create `CouponSheet.swift`
   - Integrate with checkout

4. **Order Status Tabs** - Better order organization
   - Add segmented control to `OrdersView`

### Phase 2: Enhanced Features (Medium Priority)

5. **Product Options/Customization**
   - Create `ProductOptionsSheet.swift`
   - Handle add-ons, sizes, special requests

6. **Reviews Tab in Merchant Detail**
   - Create `ReviewsView.swift`
   - Show merchant reviews

7. **Favorites Feature**
   - Enhance `FavoritesView.swift`
   - Add favorite button to merchant cards

8. **My Coupons List**
   - Enhance `CouponsView.swift`
   - API integration

### Phase 3: Advanced Features (Lower Priority)

9. **Order Tracking with Map**
   - Create `OrderTrackingView.swift`
   - MapKit integration
   - Driver location simulation

10. **Pickup Mode**
    - Create `PickupHomeView.swift`
    - Map-based store selection

11. **Message Center**
    - Create `MessageCenterView.swift`
    - WebSocket for real-time updates

12. **Photo Gallery**
    - Create `GalleryView.swift`
    - Full-screen image viewer

---

## Files to Create

```
Tucker/Views/
├── Order/
│   ├── OrderDetailView.swift          ← Phase 1
│   ├── OrderTrackingView.swift        ← Phase 3
│   └── ReviewOrderView.swift          ← Phase 2
├── Cart/
│   ├── CartSheet.swift                ← Phase 2
│   └── CouponSheet.swift              ← Phase 1
├── Merchant/
│   ├── ReviewsView.swift              ← Phase 2
│   ├── MerchantInfoView.swift         ← Phase 2
│   ├── GalleryView.swift              ← Phase 3
│   └── ProductOptionsSheet.swift      ← Phase 2
├── Profile/
│   ├── EditProfileView.swift          ← Phase 2
│   └── PaymentMethodsView.swift       ← Phase 3
├── Home/
│   └── PickupHomeView.swift           ← Phase 3
└── Messages/
    └── MessageCenterView.swift        ← Phase 3
```

---

## Files to Enhance

| File | Enhancement Needed |
|------|-------------------|
| `OrdersView.swift` | Add status tabs, navigation to detail |
| `ProfileView.swift:AddressListView` | Full CRUD implementation |
| `ProfileView.swift:FavoritesView` | API integration, merchant cards |
| `ProfileView.swift:CouponsView` | API integration, coupon cards |
| `MerchantDetailView.swift` | Add Reviews/Info tabs |
| `HomeView.swift` | Add flash deals countdown |
| `SearchView.swift` | Add search history |

---

## API Endpoints Needed

| Endpoint | Purpose | Status |
|----------|---------|--------|
| GET /orders/:id | Order detail | Exists |
| GET /users/me/favorites | User favorites | Not implemented |
| POST /users/me/favorites | Add favorite | Not implemented |
| DELETE /users/me/favorites/:id | Remove favorite | Not implemented |
| GET /coupons/available | Available coupons | Exists |
| GET /merchants/:id/reviews | Merchant reviews | Exists |
| POST /reviews | Submit review | Exists |
| GET /notifications | User notifications | Not implemented |
| WS /orders/:id/track | Order tracking | Not implemented |

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Based on PRD: 外卖App产品需求文档PRD.docx*
