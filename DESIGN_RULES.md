# Ellieo design rules

Edit this file anytime. Anyone working in this repo (including AI assistants) must **read and follow** these rules before changing UI or project setup.

## Purpose

- **Design and layout only** in the React Native app: screens, components, typography, spacing, colors, navigation shells.
- **Do not** implement real business logic, API calls, auth, or data persistence unless explicitly requested.

## Stack

- **React Native** via **Expo** (same RN primitives; fastest path to iOS/Android simulators).
- TypeScript for new files unless you standardize otherwise below.

## Visual consistency

- Define shared tokens (colors, font sizes, spacing) in one place and reuse them—avoid magic numbers scattered across screens.
- Prefer accessible contrast and touch targets (roughly 44×44 pt minimum for tappable areas).
- Match naming and file layout to what already exists in the project root (`App.tsx`, `assets/`) as you add files.

## What to change vs leave alone

- **Safe to change:** Screen layouts, styles, static placeholder copy, dummy lists, navigation structure for previews.
- **Ask first or defer:** Native modules, env secrets, CI, release builds, backend contracts.

## Simulator / device

- Primary preview: **iOS Simulator** (macOS). Android emulator is optional.
- Use Expo’s dev server; reload after style changes (shake device / `r` in terminal / Fast Refresh).

## How to run this project

**Prerequisites**

- **Node.js** ≥ **20.19.4** (Expo SDK 54 warns if older; upgrade with `nvm` or from nodejs.org).
- **macOS + Xcode** (for iOS Simulator). Install Xcode from the App Store, then open it once to finish setup: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- For Android later: Android Studio + emulator.

**Install dependencies** (first clone or after dependency changes):

```bash
cd /path/to/ellieo_design
npm install
```

**Start Expo and open iOS Simulator**

```bash
npm run ios
```

That runs `expo start --ios`, installs/opens the dev client in the simulator, and loads the app.

**Alternative:** interactive dev menu

```bash
npm start
```

Then press **`i`** for iOS simulator, **`a`** for Android emulator, or scan the QR code with **Expo Go** on a physical device.

**Web preview** (optional, layout-only; not a substitute for native spacing):

```bash
npm run web
```

## Git / commits

- Keep commits focused on design-related changes.
- Do not commit secrets or local-only paths.

## Your overrides (customize below)

<!-- Add project-specific rules, brand notes, Figma links, font files, etc. -->

- Brand colors (hex):
  - Primary: _TBD_
  - Background: _TBD_
- Typography: _TBD_
- Spacing scale (e.g. 4 / 8 / 16): _TBD_
