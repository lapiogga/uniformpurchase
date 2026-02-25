# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-25] - Navy Archive: Ocean Edition Rebranding & Deployment

### Added
- **Premium 'Ocean Edition' Visuals**:
    - High-resolution maritime hero slideshow (8 images) on the landing page.
    - Tactical Luxe design theme with Deep Navy and Tactical Red accents.
    - Commercial high-density 'Fashion Plus' layout for the Premium Mall.
- **Enhanced Typography**:
    - Implementation of bold italicized headlines for dynamic impact.
    - Comprehensive font scale update for high-resolution displays.
- **Production Deployment**:
    - Successful deployment to Google Cloud Run with automated Cloud Build CI/CD.
    - Cloud SQL (PostgreSQL) integration with optimized pooling.
- **Project Knowledge Base**:
    - Centralized documentation in `.agent/knowledge/` and `.agent/skills/`.
    - Automated deployment requirements checklist.

## [2026-02-25] - Authentication, Security & Advanced Product Management

### Added
- **Real Authentication System**:
  - Implemented real database-backed login in `src/actions/users.ts`.
  - Added session management using HTTP cookies (`user_session`) for server-side state and `localStorage` for client-side persistence.
  - Case-insensitive email login support.
  - Added `password` column to `users` table and initialized with default `test1234`.
- **Advanced Product Management**:
  - **Hierarchical Category Selection**: Implemented 3-level category specification (Large -> Medium -> Small) in `ProductForm`.
  - **Product Specification Management**: Added `ProductSpecModal` for real-time CRUD operations on product sizes/specs.
  - **Product Editing**: Created full product edit flow with `getProductById` action and `/admin/products/edit/[id]` page.
- **Improved UI/UX**:
  - **No Image Placeholder**: Replaced external images with an internal, styled "No Image" placeholder for products.
  - **Dynamic Header**: Header now displays the real name and rank of the logged-in user from the session.
  - **Logout**: Implemented secure logout that clears all session data and cookies.
- **GCP Deployment**:
  - Configured Cloud Run & Cloud SQL for production.
  - Added Dockerfile (standalone mode) and Cloud Build automation.
  - Created a one-click deployment batch file (`deploy-to-gcp.bat`).
  - Documented the entire setup and deployment process in `GCP_SETUP_AND_DEPLOY.md`.

### Changed
- **Personalized Dashboards**:
  - **Store/Tailor/User Dashboards**: Removed hardcoded test IDs. All dashboards now fetch data based on the logged-in user's role and assigned ID (Store ID, Tailor ID, etc.).
- **Login Page**:
  - Completely redesigned the login interface, removing hardcoded test accounts and integrating real server actions.
- **User Settings**:
  - Connected the Password Change page to the real `changePassword` server action with current password verification.

### Fixed
- Fixed broken links in Admin Product management table.
- Fixed session persistence issues across page refreshes.

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
