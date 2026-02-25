---
name: Navy Archive Development Guide
description: Guidelines for maintaining and extending the Navy Archive: Ocean Edition project.
---

# Navy Archive: Development Guide

This guide ensures consistency and efficiency for any AI engine or developer working on the Navy Archive project.

## 1. Design Principles (Tactical Commercial)
- **High Density**: Follow `fashionplus.co.kr` pattern for shopping mall sections. 
- **Typography**: 
    - Use `font-black italic uppercase` for high-impact headlines.
    - Use `font-dream` for body text with high readability.
- **Color Usage**: 
    - Secondary/Accent: Red (`#EE1C23`)
    - Primary: Navy (`#1e3b5a`)
    - Base: White (`#FFFFFF`) with Zinc-based grays for depth.

## 2. Component Standards
- **Buttons**: Square corners (rounded-none), bold text, tracking-widest.
- **Grids**: 4-5 items per row for desktop, 2 for mobile.
- **Hero/Banners**: Multi-column layouts for commercial appeal.

## 3. Tech Stack & Utilities
- **Next.js 15 (App Router)**
- **Tailwind CSS** (Strictly follow `globals.css` utility classes like `.red-text-gradient`, `.navy-gradient`).
- **Lucide Icons**: Use for all iconography.
- **Sonner**: For UI notifications.

## 4. Verification Workflow
1. Check build status with `npm run build`.
2. Verify interactive elements (SlideShow, Modals, Login popups).
3. Ensure Git commits follow `feat:`, `fix:`, `docs:`, `ui:` conventions.
