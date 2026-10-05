# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are tagged as `vX.Y.Z` on git. See `docs/versioning.md` for how to
maintain this file and release a new version.

## [0.5.0](https://github.com/charanp2006/healhub/compare/HealHub-v0.4.0...HealHub-v0.5.0) (2026-10-05)


### Features

* add apiEndpoints definition for managing API routes ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))
* create API directory layout and page with authentication ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))
* enhance admin panel with sidebar collapse functionality, topbar, and new UI components ([fb26c91](https://github.com/charanp2006/healhub/commit/fb26c919b85b0810d3c5f7f38cfb2a3ad05fcdb0))
* implement API endpoints listing with search and filtering functionality ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))
* implement rescheduling functionality for appointments with improved availability handling ([7805838](https://github.com/charanp2006/healhub/commit/78058386c6a3d9fae225c354ee8a01258d97a610))
* implement rescheduling functionality for appointments with improved availability handling ([479f0a9](https://github.com/charanp2006/healhub/commit/479f0a966c48993eb6c7cd7f33f58d90710a73ad))
* implement ToastProvider for custom toast notifications ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))


### Bug Fixes

* **api:** remove unbounded reconnect recursion in connectDB ([419708c](https://github.com/charanp2006/healhub/commit/419708cd196160ab12dcf393e721844064c54c5a))
* **api:** require request param in handleOptions ([9134b32](https://github.com/charanp2006/healhub/commit/9134b32423383eb13e4aeb8546788f783861e990))
* update AppContext to handle token retrieval from localStorage safely ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))


### Chores

* **apps:** switch Next apps from Turbopack to webpack ([bac5440](https://github.com/charanp2006/healhub/commit/bac54402086b98c54e6d8e30be1809fa974160ee))
* remove react-toastify dependency from package-lock.json ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))
* **render:** add Render blueprint for the API service ([5475aa3](https://github.com/charanp2006/healhub/commit/5475aa35a14c1ba41afdcc9aae9bc54088fed36d))


### Documentation

* remove Razorpay and billing references ([8ae46c6](https://github.com/charanp2006/healhub/commit/8ae46c67b735a757ce3db9e793aad7dd5d73fd5d))


### Refactors

* **api:** remove Razorpay gateway and billing module ([51061c4](https://github.com/charanp2006/healhub/commit/51061c442c452789bb26d10bcbd3f1440f0ff89c))
* **apps:** remove payment UI and billing pages ([9d0c656](https://github.com/charanp2006/healhub/commit/9d0c65689cc0f2d9ac1157a0830c937a43948ad7))
* replace react-toastify with custom ToastProvider and update ToastWrapper ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))


### Styles

* add global CSS styles for API layout and components ([6a04630](https://github.com/charanp2006/healhub/commit/6a04630fbb2cb1463febdb616ae73589a939b270))

## [0.4.0](https://github.com/charanp2006/healhub/compare/HealHub-v0.3.0...HealHub-v0.4.0) (2026-09-07)


### Features

* shared theme system, 404 pages, splash migration, and UI refresh ([abe9c86](https://github.com/charanp2006/healhub/commit/abe9c865618503701a7d2ed0b6c85554f4c5091f))


### Bug Fixes

* **web:** add error diagnostics for doctor list 401 ([8895f14](https://github.com/charanp2006/healhub/commit/8895f14a542cfec58498a01e18c28f09d26e1659))
* **web:** add error diagnostics for doctor list 401 ([539d698](https://github.com/charanp2006/healhub/commit/539d6989f7e54514ee016f503a61044d89edc281))

## [0.3.0](https://github.com/charanp2006/healhub/compare/HealHub-v0.2.0...HealHub-v0.3.0) (2026-09-06)


### Features

* add ApiHealth component and health check API route ([7f68f3e](https://github.com/charanp2006/healhub/commit/7f68f3ecb571c0ccefa54c9299e397232afb316d))
* add doctor availability management, blogs, dashboard, and profile pages ([5ccc349](https://github.com/charanp2006/healhub/commit/5ccc349e6ac012e890ba27acbdf4f1a98c274784))
* add doctor availability management, blogs, dashboard, and profile pages ([814c95e](https://github.com/charanp2006/healhub/commit/814c95e1862974a52fc53a48b58ea01cf3472742))
* dark theme across apps, new brand assets, and mobile splash screen ([8d2e81b](https://github.com/charanp2006/healhub/commit/8d2e81bed52da219276872cb0c563e73215a9a22))
* implement in-memory sliding-window rate limiting for login endpoints ([dc629c7](https://github.com/charanp2006/healhub/commit/dc629c7d4686eef7bfe3114ee3d250fd2643a2a2))
* mobile app UX, doctor tools, rate limiting & skeleton loading ([8ced5ca](https://github.com/charanp2006/healhub/commit/8ced5ca72d6fd9e58868d7fd197b26b018743316))
* **mobile:** redesign web/admin/hospital for mobile app UX ([95002ce](https://github.com/charanp2006/healhub/commit/95002ceb8ffd39448d841d1df302b1f99436f3cc))
* **monorepo:** migrate MERN app to Next.js HealHub monorepo ([57a206b](https://github.com/charanp2006/healhub/commit/57a206b4c03e95e0b3e6a1c3705fd760344b2989))
* **monorepo:** migrate MERN app to Next.js HealHub monorepo ([008b110](https://github.com/charanp2006/healhub/commit/008b11066d4c1b0bc778a58f1295b45813062790))


### Bug Fixes

* **build:** declare internal workspace packages so Vercel resolves @healhub/ui ([7d73e8d](https://github.com/charanp2006/healhub/commit/7d73e8df2a8d475278f07f1e43a2ac7f2cf588f7))
* **deps:** declare recharts for admin/hospital analytics ([5cb1827](https://github.com/charanp2006/healhub/commit/5cb18273b3e0ab808578e4a6786ff7adbadd0421))
* **deps:** declare recharts for admin/hospital analytics, API health check component ([11fb7e4](https://github.com/charanp2006/healhub/commit/11fb7e407a927cea77e5fefbe0909cdbaabfa3bf))


### Chores

* **release:** add Release Please automation and versioning guide ([c392295](https://github.com/charanp2006/healhub/commit/c39229543b4ac3a5b108b74b699ed6b763450bbf))
* **release:** v0.2.0 ([1b5a9f1](https://github.com/charanp2006/healhub/commit/1b5a9f17029e092144d662b9143891cf9bd041f8))


### Build System

* **monorepo:** enable Turbopack and add mobile styles ([7b0c00c](https://github.com/charanp2006/healhub/commit/7b0c00c0ed764b48ba302cdcf4215022b2c37ee7))

## [Unreleased]

### Added

- (new features go here)

### Changed

- (behavior changes go here)

### Deprecated

- (soon-to-be removed features go here)

### Removed

- (removed features go here)

### Fixed

- (bug fixes go here)

### Security

- (security fixes go here)

## [0.2.0] - 2026-09-05

### Added

- Doctor tools: availability management, blog publishing, dashboard, and
  profile pages across the hospital portal (`814c95e`).
- Mobile app UX: `MobileAppBar`, role-aware `MobileTabBar`, and mobile-ready
  layouts for the web, admin, and hospital portals (`95002ce`).
- Shared skeleton loading components replacing "Loading..." and blank states
  across web, admin, and hospital (cards, lists, dashboards, articles,
  counts).
- Login rate limiting: in-memory sliding window — 5 failed attempts / 15 min
  per account, 40 attempts / 15 min per IP (`dc629c7`).
- MongoDB connection troubleshooting doc under `docs/`.

### Changed

- Turbopack enabled for all apps via the shared monorepo config (`7b0c00c`).
- Self-hosted Outfit font; brand color `#179E8D`.
- Lint cleanup: 106 warnings to 0 across web/admin/hospital/api.
- Login error responses no longer leak exception details; "User not found" now
  returns "Invalid credentials" (enumeration-safe).

### Fixed

- Vercel builds failing with `Can't resolve '@healhub/ui'` by declaring
  `@healhub/ui` / `@healhub/config` as dependencies in the consuming apps
  (`7d73e8d`).
- React key and stale/unused import cleanup across all apps.

### Security

- Added security headers: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`.

## [0.1.0] - 2026-09-03

### Added

- Initial release: migrated the MERN application into a Next.js (App Router)
  Turborepo monorepo with `web`, `admin`, `hospital`, and `api` workspaces
  (`008b110`).

[Unreleased]: https://github.com/charanp2006/healhub/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/charanp2006/healhub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/charanp2006/healhub/releases/tag/v0.1.0
