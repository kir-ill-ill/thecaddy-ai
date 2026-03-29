# TheCaddy.AI - macOS Application Setup

This guide explains how to build and run TheCaddy.AI as a native macOS application using Tauri.

## What is Tauri?

Tauri is a modern framework for building native desktop applications using web technologies. It's lightweight (~600KB), secure, and uses the system's native webview.

## Architecture

The macOS app wraps the mobile-optimized demo interface in a native macOS window:

```
┌─────────────────────────────────┐
│  macOS Native Window (Tauri)    │
│  ┌───────────────────────────┐  │
│  │  Next.js Static Export    │  │
│  │  (Mobile Demo Interface)  │  │
│  │  - Forest Green Theme     │  │
│  │  - Bottom Tab Navigation  │  │
│  │  - Dashboard, Roster,     │  │
│  │    Vote, Itinerary        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Prerequisites

Before you can run the macOS app, you need to install Rust and additional dependencies:

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the prompts and restart your terminal when done.

Verify installation:
```bash
rustc --version
cargo --version
```

### 2. Install Xcode Command Line Tools (if not already installed)

```bash
xcode-select --install
```

## Project Structure

```
caddyAI/
├── app/
│   ├── demo-mobile/
│   │   └── page.tsx          # Mobile demo interface (main app)
│   └── page.tsx               # Landing page
├── src-tauri/
│   ├── src/
│   │   └── main.rs            # Tauri Rust entry point
│   ├── icons/                 # App icons
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Tauri configuration
├── out/                       # Next.js static export (generated)
└── package.json               # Includes Tauri scripts
```

## Development Mode

Run the app in development mode (hot reload enabled):

```bash
npm run tauri:dev
```

This will:
1. Start Next.js dev server on `http://localhost:3000`
2. Launch a native macOS window (430x932px - iPhone 14 Pro Max size)
3. Load the demo-mobile page (`/demo-mobile`)

## Building for Production

### 1. Build the Next.js static export

```bash
npm run build
```

This creates static HTML/CSS/JS files in the `out/` directory.

### 2. Build the macOS app

```bash
npm run tauri:build
```

This will:
1. Run `npm run build` automatically
2. Compile the Rust code
3. Bundle everything into a native macOS `.dmg` installer

The output will be in:
```
src-tauri/target/release/bundle/dmg/TheCaddy.AI_1.0.0_universal.dmg
```

## Configuration

### Window Size

The app is configured with a mobile-sized window to match the demo.html design:

- Width: 430px (iPhone 14 Pro Max width)
- Height: 932px (iPhone 14 Pro Max height)
- Resizable: No (locked to mobile size)
- Centered: Yes

See `src-tauri/tauri.conf.json` for full window configuration.

### App Metadata

- **Product Name**: TheCaddy.AI
- **Bundle ID**: ai.thecaddy.app
- **Version**: 1.0.0
- **Minimum macOS**: 10.15 (Catalina)

## Features

The macOS app includes the full mobile demo interface from `demo.html`:

### Dashboard Tab
- Trip overview card with countdown and weather
- Agent status updates (The Treasurer)
- Commissioner action items (Approve Itinerary, Deposit Deadline)
- Financial snapshot widget

### Roster Tab
- Active roster (12 players)
- Payment status indicators
- "The Cut Line" separator
- Waitlist section
- Nudge functionality for pending payments

### Vote Tab
- Tinder-style voting cards
- Course and housing options
- Swipe left (veto) / right (approve) interactions
- Match percentages
- Option details (tags, descriptions, pricing)

### Itinerary Tab
- Timeline view with day-by-day schedule
- Golf rounds, meals, social events
- Course guide and scorecard buttons
- Visual timeline with dots and connecting lines

## Color Scheme

- **Forest Green**: `#1A4D2E` (primary)
- **Sand**: `#F5F5DC` (accent)
- **Gold**: `#D4AF37` (highlights)

## Notes

### API Routes Not Supported

Since the app uses Next.js static export, API routes (`/api/extract`, `/api/plan`, `/api/negotiate`) are excluded. The demo-mobile interface uses mock data only.

For AI-powered trip planning, you would need to:
1. Run the MCP server separately
2. Configure the app to connect to a backend API
3. Use Tauri's backend capabilities to spawn the Node.js MCP server

### Future Enhancements

- [ ] Bundle MCP server with the app
- [ ] Add native macOS menu bar integration
- [ ] Implement system tray icon
- [ ] Add push notifications
- [ ] Persist trip data locally using Tauri's filesystem API
- [ ] Add auto-update functionality

## Troubleshooting

### "cargo: command not found"

Install Rust following step 1 above.

### Build fails with "Xcode license agreement"

Run:
```bash
sudo xcodebuild -license accept
```

### App doesn't open

Check Console.app for crash logs. Common issues:
- Missing Xcode Command Line Tools
- Incorrect Rust version (requires 1.70+)

## Resources

- [Tauri Documentation](https://tauri.app)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Rust Installation](https://www.rust-lang.org/tools/install)

---

Built with ❤️ using Tauri, Next.js, and OpenAI GPT-4o
