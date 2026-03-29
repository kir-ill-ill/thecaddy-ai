# TheCaddy.AI - Quick Start Guide

## Option 1: View in Browser (Works Now!)

The demo interface is already running! Open your browser and go to:

```
http://localhost:3000/demo-mobile
```

You should see:
- ✅ Intro splash screen with "CaddyAI" branding
- ✅ Four-tab navigation (Dashboard, Roster, Vote, Itinerary)
- ✅ Forest green theme (#1A4D2E)
- ✅ Interactive voting cards
- ✅ Full roster management
- ✅ Timeline itinerary

**This is the same interface that will run in the macOS app!**

## Option 2: Native macOS App (Requires Rust)

To run as a native macOS application, you need to install Rust first.

### Step 1: Install Rust (one-time setup)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Press Enter to accept defaults, then:

```bash
source $HOME/.cargo/env
```

Verify installation:
```bash
rustc --version
cargo --version
```

### Step 2: Run the macOS App

```bash
npm run tauri:dev
```

This will:
1. Keep the Next.js dev server running
2. Launch a native macOS window (430x932px - mobile size)
3. Load http://localhost:3000/demo-mobile inside the native window

### Step 3: Build for Distribution (Optional)

```bash
npm run tauri:build
```

Creates: `src-tauri/target/release/bundle/dmg/TheCaddy.AI_1.0.0_universal.dmg`

## What's the Difference?

| Feature | Browser | macOS App |
|---------|---------|-----------|
| Interface | ✅ Same | ✅ Same |
| Features | ✅ Same | ✅ Same |
| Window | Browser tab | Native macOS window |
| Dock Icon | ❌ | ✅ |
| Menu Bar | ❌ | ✅ |
| Standalone | ❌ | ✅ (no browser needed) |
| File Size | N/A | ~600KB |

## Troubleshooting

### "Blank screen in Tauri window"
→ Rust isn't installed. Follow Step 1 above.

### "Page not found"
→ Make sure Next.js dev server is running: `npm run dev`

### "Port 3000 already in use"
→ Stop other processes: `lsof -ti:3000 | xargs kill -9`

## Current Status

✅ Next.js dev server: **RUNNING** on http://localhost:3000
✅ Demo interface: **WORKING** at http://localhost:3000/demo-mobile
⏳ Tauri desktop app: Waiting for Rust installation

## Next Steps

1. **Try the demo in your browser first** - http://localhost:3000/demo-mobile
2. If you like it, install Rust to get the native macOS app
3. Check out `MACOS_APP_SETUP.md` for full details

---

**TIP**: The browser version is perfect for development and testing. The native app is for distribution and a more polished experience.
