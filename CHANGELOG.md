# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-25] - Admin Dashboard & Store Management Revamp

### Added
- **Admin User Management**:
  - Full CRUD support with `UserForm` component.
  - User registration page (`/admin/users/new`).
  - User edit page (`/admin/users/[id]/edit`).
  - Search by name with `ILIKE` (case-insensitive partial match).
  - Validation for duplicate military numbers.
- **Admin Point Management**:
  - `PointActionButtons` client component for interactive point granting.
  - Promotion bonus payment page (`/admin/points/promotion`).
  - Toast notifications for point operations.
- **Admin Product Management**:
  - `ProductForm` component for adding/editing products.
  - Category selection in product form.
  - Search by product name.
- **Admin Store Management**:
  - `StoreForm` component for store registration.
  - Store registration page (`/admin/stores/new`).
- **New Admin Screens (Placeholders/UI)**:
  - Ticket Cancellation Approval page (`/admin/tickets/cancellations`).
  - Tailor Settlement Management page (`/admin/settlements`).
  - Tailor Management registration (`/admin/tailors/new`) and `TailorForm`.
- **Store Dashboard**:
  - New "Sales Dashboard" (`/store/sales`) for real-time sales statistics and recent orders.
  - Display today's and monthly sales (count and point total).
  - Recent 10 orders list with user details.

### Changed
- **Admin Dashboard**:
  - Reorganized metrics to include cumulative points (granted, used, reserved).
  - Added placeholders for operational metrics (settlement requests, low stock, etc.).
  - Replaced duplicate imports and cleaned up the page structure.
- **User Management Table**:
  - Reordered columns: Military Number, Rank, Name, Unit.
  - Mapped English rank codes (sgt, captain, etc.) to Korean labels.
- **Product Management Table**:
  - Improved UI with images and clear status badges.
- **Navigation**:
  - Renamed store menu items for better clarity.
  - Updated links for all fixed registration and edit pages.
- **Server Actions**:
  - Added `getRecentOrders` for sales monitoring.
  - Added `updateUser` and `checkMilitaryNumber`.
  - Refactored `grantAnnualPoints` to work with client-side feedback.

### Fixed
- Fixed 404 errors on user, product, and store registration pages.
- Fixed broken 'Edit', 'Adjust', and 'Search' buttons in various admin tables.
- Fixed lint errors in `ProductForm` and `Store Sales` page.
- Fixed duplicate imports in `Admin Dashboard`.
