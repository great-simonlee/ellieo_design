# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is **design and layout only** — screens, components, typography, spacing, colors, and navigation shells for the Ellieo React Native app. Do not implement real business logic, API calls, auth, or data persistence unless explicitly requested.

## Commands

```bash
npm install          # install / refresh deps
npm run ios          # start Expo + open iOS Simulator (primary target)
npm run ios:localhost # use localhost instead of LAN IP (fixes some network issues)
npm run ios:offline  # skip network steps (useful on slow/blocked networks)
npm start            # interactive: press i for iOS, a for Android, scan QR for device
npm run web          # web preview (layout-only, not a substitute for native testing)
```

First run can take 1–2 minutes before the simulator launches — that's normal. If Metro appears stuck, install Watchman (`brew install watchman`) and restart.

**Prerequisites:** Node ≥ 20.19.4, macOS + Xcode (for iOS Simulator).

## Architecture

All screens currently live in `App.tsx` as a flat component tree. `index.ts` is the Expo entry point (`registerRootComponent`). No router or navigation library is in use yet — screen transitions are managed with local `useState`.

**Design tokens** (`design/theme.ts`) — source of truth for all visual values. Import from here; never use magic numbers:
- `colors` — full palette; `colors.primary` = `#2F6DF6` (brand blue, key actions/links/selection)
- `space` — xs/sm/md/lg/xl/xxl/xxxl (4–40 px scale)
- `radius` — xs through pill
- `type` — micro/caption/body/bodyLarge/title/display (11–26 px)

**Font:** Pretendard (loaded via `expo-font` in `App`). Its `defaultProps` are patched onto `Text` and `TextInput` globally at startup — individual components don't need to set `fontFamily`.

**Assets:** images live under `assets/img/`, fonts under `assets/fonts/`. The vertical logo is at `img/logo_vert.png`; the horizontal logo used in-app is `assets/img/ellieo_logo.png`.

## Design rules (from DESIGN_RULES.md)

- Minimum touch target: ~44×44 pt.
- Safe to change: screen layouts, styles, static copy, dummy lists, navigation structure.
- Ask first or defer: native modules, env secrets, CI, release builds, backend contracts.
- Keep commits focused on design-related changes.
