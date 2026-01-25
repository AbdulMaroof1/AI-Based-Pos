# Build Fix Instructions

## Issues Fixed

1. ✅ Created `pnpm-workspace.yaml` (pnpm doesn't use `workspaces` in package.json)
2. ✅ Removed `workspaces` field from root `package.json`
3. ✅ Added workspace dependencies to packages
4. ✅ Fixed TypeScript path resolution with project references
5. ✅ Fixed implicit `any` type in api-client

## Steps to Build

### 1. Install Dependencies First

```bash
pnpm install
```

This will install all dependencies for all packages and services.

### 2. Build in Order

The build script now builds packages in the correct order:

```bash
pnpm build
```

Or manually:

```bash
# Build shared packages first
pnpm --filter @pos/shared-types build
pnpm --filter @pos/config build
pnpm --filter @pos/api-client build
pnpm --filter @pos/utils build

# Then build services
pnpm --filter './services/*' build
```

### 3. Alternative: Build Packages Only

```bash
pnpm build:packages
```

### 4. Build Services Only (after packages are built)

```bash
pnpm build:services
```

## What Changed

### Root package.json
- Removed `workspaces` field (pnpm uses `pnpm-workspace.yaml`)
- Updated build script to build in correct order

### pnpm-workspace.yaml
- Created workspace configuration file

### Package tsconfig.json files
- Added `composite: true` for project references
- Added `references` to dependent packages

### Package package.json files
- Added `@pos/shared-types` as workspace dependency where needed

### api-client/src/index.ts
- Fixed implicit `any` type in interceptor

## If Build Still Fails

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules packages/*/node_modules services/*/node_modules
   pnpm install
   ```

2. **Build shared-types first manually:**
   ```bash
   cd packages/shared-types
   pnpm install
   pnpm build
   cd ../..
   ```

3. **Then build other packages:**
   ```bash
   cd packages/config && pnpm build && cd ../..
   cd packages/api-client && pnpm build && cd ../..
   cd packages/utils && pnpm build && cd ../..
   ```

4. **Finally build services:**
   ```bash
   pnpm --filter './services/*' build
   ```

## Verification

After building, verify the dist folders exist:

```bash
ls packages/shared-types/dist
ls packages/config/dist
ls packages/api-client/dist
ls packages/utils/dist
```

All should contain `index.js` and `index.d.ts` files.

