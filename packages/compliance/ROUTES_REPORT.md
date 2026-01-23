# Compliance Routes Report

This document provides a comprehensive summary of all routes in the compliance extension, organized by their nesting structure.

## Route Structure

Based on `routes.ts`, the routes are organized as follows:

```
/app/compliance (layout route)
├── /app/compliance/reports/me
├── /app/compliance/reports/me/link
├── /app/compliance/qualify
├── /app/compliance/share
├── /app/compliance/shared
├── /app/compliance/shared/reports/:orcid
├── /app/compliance/scientists
├── /app/compliance/scientists/:orcid
└── /app/compliance/help-request

/app/task/compliance-wizard (separate top-level route)
```

---

## Route Details

### 1. `/app/compliance` (Layout Route)

**File:** `compliance.tsx`

**Type:** Layout route (no direct rendering, provides outlet for child routes)

**Meta:**
- No meta function defined

**Breadcrumbs:**
- Not applicable (layout route)

**PageFrame:**
- Not applicable (layout route)
- Provides `SecondaryNav` with title:
  - "Dashboards" (for lab-manager role)
  - "My Dashboard" (for scientist role)

**Notes:**
- Handles redirects based on user role and ORCID status
- Builds compliance menu dynamically
- Conditionally shows secondary navigation

---

### 2. `/app/compliance/reports/me`

**File:** `compliance.reports.me.tsx`

**Meta:**
- **Title:** Dynamic - `${scientist.fullName} - Compliance Dashboard` OR `My Compliance Dashboard` (if no scientist)

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'My Compliance Dashboard', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"My Compliance Dashboard"`
- **Description:** `<ComplianceInfoCards className="mt-4" dashboard={!isOrcidLinkedButNotFound} />`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- Redirects to `/app/compliance/reports/me/link` if no ORCID account
- Shows `ComplianceDashboardRequest` if ORCID linked but scientist not found in database

---

### 3. `/app/compliance/reports/me/link`

**File:** `compliance.reports.link.tsx`

**Meta:**
- **Title**: `Link Your ORCID Account - My Compliance`

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Link Your ORCID Account', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"My Compliance Dashboard"`
- **Description:** `<ComplianceInfoCards className="mt-4" />`
- **className:** `"mx-auto mb-6 max-w-screen-lg"`

**Notes:**
- Redirects to `/app/compliance/reports/me` if ORCID already linked
- Allows users to link their ORCID account

---

### 4. `/app/compliance/qualify`

**File:** `compliance.qualify/route.tsx`

**Meta:**
- **Title**: `Confirm your role - My Compliance`

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Confirm your role', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Welcome to HHMI Compliance Dashboards"`
- **Description:** `"Before we begin, let's confirm what you are here to do. Please choose the role that best describes how HHMI Compliance applies to you."`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- Redirects based on existing role
- Role selection page for first-time users

---

### 5. `/app/compliance/share`

**File:** `compliance.share/route.tsx`

**Meta:**
```javascript
[
  { title: 'Delegate Access - Compliance Dashboard' },
  { name: 'description', content: 'Manage who can access your compliance dashboard' }
]
```

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Delegate Access', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Delegate Access"`
- **Subtitle:** `"Manage who can access your compliance dashboard"`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- No `description` prop on PageFrame (uses `subtitle` instead)
- Manages access grants for user's own compliance dashboard

---

### 6. `/app/compliance/shared`

**File:** `compliance.shared/route.tsx`

**Meta:**
```javascript
[
  { title: 'Dashboards - My Compliance' },
  { name: 'description', content: 'View compliance dashboards that I have access to' }
]
```

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Dashboards', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Dashboards that have been shared with you"`
- **Subtitle:** `"If other users have granted access to their dashboards, they will appear here."`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- No `description` prop on PageFrame (uses `subtitle` instead)
- Shows dashboards shared with the current user

---

### 7. `/app/compliance/shared/reports/:orcid`

**File:** `compliance.shared.reports.$orcid.tsx`

**Meta:**
- **Title:** Dynamic - `${scientist.fullName} - Compliance Dashboard` OR `Compliance Dashboard` (if no scientist)

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Dashboards', href: '/app/compliance/shared' },
  { label: scientist?.fullName || orcid, isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** Dynamic - `Compliance Dashboard for ${scientist.fullName}` OR `Compliance Dashboard for ${orcid}`
- **Description:** `<ComplianceInfoCards dashboard className="mt-4" />`
- **className:** `"mx-auto max-w-screen-lg"`

**Error State:**
- If access denied or error:
  - **Title:** `"Access Error"`
  - **Breadcrumbs:** `[{ label: 'My Compliance', href: '/app/compliance' }, { label: 'Dashboards', href: '/app/compliance/shared' }, { label: 'Error', isCurrentPage: true }]`

**Notes:**
- Requires access grant to view
- Shows compliance report for a shared dashboard

---

### 8. `/app/compliance/scientists`

**File:** `compliance.scientists/route.tsx`

**Meta:**
```javascript
[
  { title: 'Management - My Compliance' },
  { name: 'description', content: 'View compliance data for all scientists' }
]
```

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Compliance Management', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Compliance Management"`
- **Description:** `"View compliance data for any scientist in the compliance database"`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- Admin-only route (requires `hhmi.compliance.admin` scope)
- Wrapped in `MainWrapper` (not using layout's MainWrapper)

---

### 9. `/app/compliance/scientists/:orcid`

**File:** `compliance.scientists.$orcid.tsx`

**Meta:**
- **Title:** Dynamic - `${scientist.fullName} - Compliance` OR `Scientist Compliance` (if no scientist)

**Breadcrumbs:**
```javascript
[
  { label: 'My Compliance', href: '/app/compliance' },
  { label: 'Compliance Management', href: '/app/compliance/scientists' },
  { label: `${scientist?.fullName || orcid}'s compliance dashboard`, isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Open Science Compliance"`
- **Description:** `"You are viewing this dashboard as a Compliance Manager"`
- **className:** `"mx-auto max-w-screen-lg"`

**Notes:**
- Admin-only route (requires `hhmi.compliance.admin` scope)
- Wrapped in `MainWrapper` (not using layout's MainWrapper)
- Includes share dialog functionality

---

### 10. `/app/compliance/help-request`

**File:** `compliance.help-request.tsx`

**Meta:**
- No meta function defined

**Breadcrumbs:**
- Not applicable (action-only route, no UI)

**PageFrame:**
- Not applicable (action-only route)

**Notes:**
- Action-only route (POST requests only)
- Returns 405 for GET requests
- Handles help request submissions via email

---

### 11. `/app/task/compliance-wizard`

**File:** `task.compliance.wizard.tsx`

**Meta:**
- **Title:** Dynamic - `joinPageTitle('Get Help with Compliance', branding.title)`

**Breadcrumbs:**
```javascript
[
  { label: 'Home', href: '/app/dashboard' },
  { label: 'Open Access Policy Compliance Questionnaire', isCurrentPage: true }
]
```

**PageFrame:**
- **Title:** `"Get Help with Open Access Policy Compliance"`
- **Description:** Long multi-paragraph description about the compliance questionnaire and HHMI/NIH policy information
- **className:** `"pr-0"`

**Notes:**
- Separate top-level route (not under `/app/compliance`)
- Redirects to `/app/works` if PMC extension is not enabled
- Wrapped in `MainWrapper`
- Interactive wizard component

---

## Summary of Inconsistencies

### Breadcrumb Labeling
1. **Base label inconsistency:**
   - Most routes use `'Compliance'` as base breadcrumb
   - Some routes use `'My Compliance'` as base breadcrumb
   - **Recommendation:** Standardize to one consistent label

2. **Specific inconsistencies:**
   - `/app/compliance/reports/me` uses `'My Compliance'` → `'My Dashboard'`
   - `/app/compliance/share` uses `'Compliance'` → `'Delegate Access'`
   - `/app/compliance/shared` uses `'My Compliance'` → `'Dashboards'`
   - `/app/compliance/scientists` uses `'Compliance'` → `'Compliance Management'`
   - `/app/compliance/scientists/:orcid` uses `'My Compliance'` → `'Compliance Management'` → `'...'s compliance dashboard'`

### PageFrame Title vs Meta Title
1. **Title consistency:**
   - Most routes have matching meta titles and PageFrame titles
   - `/app/compliance/scientists/:orcid` has different meta title (`${scientist.fullName} - Compliance`) vs PageFrame title (`"Open Science Compliance"`)

2. **Description vs Subtitle:**
   - Most routes use `description` prop on PageFrame
   - `/app/compliance/share` and `/app/compliance/shared` use `subtitle` instead of `description`
   - **Recommendation:** Standardize to use `description` consistently

### Missing Meta Functions
1. Routes without meta functions:
   - `/app/compliance` (layout route - acceptable)
   - `/app/compliance/reports/me/link`
   - `/app/compliance/qualify`
   - `/app/compliance/help-request` (action-only - acceptable)

### MainWrapper Usage
1. **Inconsistent MainWrapper:**
   - Most routes rely on layout's MainWrapper
   - `/app/compliance/scientists` and `/app/compliance/scientists/:orcid` wrap themselves in MainWrapper
   - `/app/task/compliance-wizard` wraps itself in MainWrapper
   - **Recommendation:** Use layout's MainWrapper consistently, or document why certain routes need their own

---

## Recommendations

1. **Standardize breadcrumb base label** - Choose either `'Compliance'` or `'My Compliance'` and use consistently
2. **Use `description` prop consistently** - Replace `subtitle` with `description` on PageFrame components
3. **Add meta functions** - Add meta functions to routes that are missing them (especially user-facing routes)
4. **Align PageFrame and meta titles** - Ensure meta title and PageFrame title match or are intentionally different with clear reasoning
5. **Document MainWrapper usage** - Either standardize MainWrapper usage or document why certain routes need their own wrapper
6. **Review breadcrumb hierarchy** - Ensure breadcrumb paths accurately reflect the route hierarchy and user navigation flow
