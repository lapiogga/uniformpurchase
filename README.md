<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/daa286cf-373d-49e2-91bf-6c8ccc17ef06

## Project Progress & Documentation

- [요구사항정의서 (v1.0)](./요구사항정의서_v1.0.md)
- [상세 개발계획서](./개발계획상세.md)
- [변경이력 (CHANGELOG)](./CHANGELOG.md)

### Current Status
- **Authentication & Security**: Integrated real database login, cookie-based sessions, and secure logout.
- **Admin Dashboard**: Revamped with real-time metrics and operational status overview.
- **User Management**: Completed (Search, Registration, Editing, Role-based filtering).
- **Point Management**: Completed (Batch Granting, Promotion Bonus UI).
- **Product Management**: Hierarchical category selection (3-level) and Specification (Size) management via popups.
- **Sales & Store Dashboard**: Personalized for managers with real-time tracking based on session data.

## Prerequisites
- Node.js (v18+)
- PostgreSQL (or Supabase)

## Getting Started
1. `npm install`
2. Configure `.env.local`
3. `npm run dev`