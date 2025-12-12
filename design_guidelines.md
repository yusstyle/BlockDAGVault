# Design Guidelines: BlockDAG Secure Document Platform

## Design Approach: Security-First Enterprise System

**Selected Framework**: Material Design 3 with security-focused enhancements, inspired by enterprise platforms like AWS Console, Dropbox Business, and DocuSign.

**Core Principles**:
- Trust through clarity and consistency
- Security-first visual language
- Multi-role user experience
- Compliance-ready documentation patterns

---

## Color Palette

**Dark Mode (Primary)**:
- Background Base: 220 15% 8%
- Surface Elevated: 220 15% 12%
- Surface Interactive: 220 20% 16%
- Primary Brand: 210 100% 60% (Trust Blue)
- Success/Verified: 145 70% 45%
- Warning/Pending: 35 90% 55%
- Error/Restricted: 0 75% 55%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Light Mode**:
- Background Base: 220 20% 98%
- Surface: 0 0% 100%
- Primary Brand: 210 95% 50%
- Border Subtle: 220 15% 88%

**Accent Colors** (Sparingly):
- Encryption Active: 280 65% 55% (Purple for encryption indicators)
- Role Badges: Use success/warning/error colors contextually

---

## Typography

**Font Families**:
- Primary: Inter (400, 500, 600, 700) via Google Fonts
- Monospace: JetBrains Mono (400, 500) for wallet addresses, hashes, timestamps

**Scale**:
- Hero/Page Titles: text-4xl (36px) font-semibold
- Section Headers: text-2xl (24px) font-semibold
- Card Titles: text-lg (18px) font-medium
- Body Text: text-base (16px) font-normal
- Metadata/Labels: text-sm (14px) font-medium
- Technical Details: text-xs (12px) font-mono

---

## Layout System

**Spacing Units**: Tailwind primitives of 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8, py-12, px-16)

**Grid Structure**:
- Dashboard: 12-column grid with sidebar (256px fixed)
- Document Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Form Layouts: max-w-2xl centered for single-column, max-w-6xl for two-column

**Container Strategy**:
- App Shell: Full viewport with fixed sidebar + scrollable main
- Content Areas: max-w-7xl mx-auto px-6
- Modals/Dialogs: max-w-2xl for forms, max-w-4xl for document previews

---

## Component Library

**Navigation**:
- Fixed sidebar with role-based menu items
- Top bar: Wallet connection status, user profile, network indicator
- Breadcrumbs for deep navigation paths

**Document Cards**:
- Visual hierarchy: Document type icon → Title → Metadata grid → Action buttons
- Status badges (Encrypted, Shared, Pending Access, Verified)
- Hover state reveals quick actions overlay
- Encryption indicator (lock icon with pulse animation)

**Access Control Panel**:
- Table view for granted permissions
- Inline editing for time-limited access
- Visual differentiation for roles (color-coded badges)
- Revoke action with confirmation modal

**Forms & Inputs**:
- High-contrast form fields with clear focus states
- File upload: Drag-drop zone with encryption progress indicator
- Wallet address inputs: Monospace font with validation checkmark
- Time pickers for access duration
- Multi-select for role assignment

**Data Display**:
- Audit log table with sortable columns
- Timeline view for document history
- Blockchain transaction links (external link icon)
- Copy-to-clipboard for hashes and addresses

**Modals/Overlays**:
- Document viewer with encryption status header
- Access grant wizard (multi-step)
- Confirmation dialogs for sensitive actions (revoke access, delete)
- Emergency access request modal

**Security Indicators**:
- Encryption status: Always visible shield/lock icon
- Network connection health: Green dot in top bar
- Active sessions indicator
- Compliance badge (NIST/ISO certified icon)

---

## Page-Specific Guidelines

**Landing Page**:
- Hero: Full-width split (left: headline + CTA, right: animated encryption visualization)
- Trust indicators: Compliance logos, security features grid (3-column)
- Use case tabs with icon-led sections
- No generic stock photos; use abstract geometric patterns or gradient meshes

**Dashboard**:
- Stats cards row (Documents Encrypted, Active Shares, Audit Logs)
- Recent activity feed
- Quick actions panel

**Document Upload**:
- Prominent drag-drop zone
- Encryption options checklist
- Access policy selection
- Submit with visual feedback (progress bar with encryption animation)

**Access Management**:
- Search/filter bar
- Permission matrix view
- Bulk actions toolbar

---

## Images

**Hero Section**: Use abstract 3D isometric illustration of encrypted document flow with blockchain network nodes. Style: Gradient mesh with primary blue and purple accents, dark background.

**Use Case Icons**: Custom SVG icons for each vertical (medical cross, bank vault, government seal, supply chain, handshake)

**No stock photography**; use iconography and abstract illustrations only.

---

## Interaction Patterns

**Micro-interactions**:
- Encryption indicator: Subtle pulse on active encryption
- Button states: Minimal hover lifts, focus rings for accessibility
- Toast notifications for confirmations (slide-in from top-right)

**Animations**: Limit to functional feedback only:
- Loading states: Spinner on data fetch
- Encryption progress: Linear determinate progress bar
- Success confirmations: Checkmark fade-in

---

## Accessibility & Compliance

- WCAG AA contrast ratios minimum
- Keyboard navigation for all interactions
- Screen reader labels for technical elements
- Audit log export for compliance reporting
- Clear error messaging with recovery actions