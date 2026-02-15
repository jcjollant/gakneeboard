# Admin Console Extraction

## 1. Goal
The goal is to separate the Admin UI and Logic from the main `gakneeboard` application. This allows the Admin Console to have an independent deployment lifecycle, enabling updates and maintenance without affecting the main user-facing application.

## 2. Architecture: Satellite Project (Nuxt)
We are adopting a **Satellite Project** architecture using **Nuxt 4**.
- **Location**: `/admin` (Root level directory).
- **Framework**: Nuxt 4 (Vue 3 + Nitro Server).
- **Integration**: The Admin project will "reach into" the existing codebase to reuse business logic and database connections.

### Why Nuxt?
- **Unified Stack**: Nuxt handles both the Frontend (Vue) and the Backend API (Server Routes) in a single project.
- **Direct Access**: Nuxt's server routes can import existing classes from `../server/backend` without needing a separate microservice or package refactor immediately.
- **Simplification**: Eliminates the need to maintain a separate Express server configuration for the Admin console.

## 3. Directory Structure

```text
/Users/jc/src/gakneeboard/
├── admin/                 (NEW: Nuxt Project)
│   ├── nuxt.config.ts     (Config: aliases to ../server)
│   ├── app/               (Application Source)
│   │   ├── app.vue        (Root Component)
│   │   └── ...
│   ├── server/
│   │   └── api/           (Admin API Endpoints)
│   │       ├── health.ts  (Migrated from server/api/index.ts)
│   │       ├── users.ts   (Migrated from server/api/index.ts)
│   │       └── ...
│   ├── components/        (Admin Components)
│   └── package.json       (Admin dependencies)
├── server/                (EXISTING: Core Logic)
│   └── backend/           (DAOs, Services, Models - Shared Source)
└── ui/                    (EXISTING: Public UI)
```

## 4. Implementation Plan

### Phase 1: Initialization
1.  Create the `/admin` directory.
2.  Initialize a new Nuxt 3 project.
3.  Configure `nuxt.config.ts` to handle imports from `../server`.
4.  Install necessary dependencies (e.g., `pg`, `stripe`, `@supabase/supabase-js`) to match `server/package.json`.

### Phase 2: Migration
1.  **API Migration**:
    - Move Admin API routes from `server/api/index.ts` to `admin/server/api/`.
    - Ensure these routes correctly import `DAOs` and `Services` from `../server/backend`.
2.  **UI Migration**:
    - Move `ui/src/views/Admin.vue` and `ui/src/components/admin/*` to `admin/pages` and `admin/components`.
    - Refactor Vue components to use Nuxt's auto-imports and routing.

### Phase 3: Cleanup
1.  Remove Admin routes from the main `server/api/index.ts`.
2.  Remove Admin components and views from `ui/src`.
3.  Verify independent deployment on Vercel.
