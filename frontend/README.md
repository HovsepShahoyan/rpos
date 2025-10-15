# RPOS Svelte Frontend

Modern Svelte-based frontend for the RPOS camera control system.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode (with hot reload)
```bash
npm run dev
```
Then open http://localhost:5000 in your browser.

### 3. Build for Production
```bash
npm run build
```
This creates optimized files in `public/build/` that the backend will serve.

## Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html      # Main HTML
│   ├── global.css      # Global styles
│   └── build/          # Built files (generated)
└── src/
    ├── main.js         # Entry point
    ├── App.svelte      # Root component
    ├── components/     # UI components
    ├── stores/         # State management
    └── utils/          # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Serve built files (for testing)

## Components

- **Navigation** - Top navigation bar
- **FastLive** - Live stream with PTZ controls
- **Map** - 3D terrain map view
- **Telemetry** - Real-time sensor data
- **Settings** - Camera configuration
- **Controls** - Advanced camera controls
- **Logs** - System logs viewer
- **Reboot** - System reboot scheduler

## State Management

Uses Svelte stores for reactive state:
- `ui.js` - UI state, page navigation, toasts
- `telemetry.js` - Sensor data with auto-polling
- `camera.js` - Camera settings and state

## API Integration

All API calls are centralized in `utils/api.js`:
- Telemetry data
- PTZ controls
- Camera settings
- System logs
- Reboot scheduling

## Development Tips

1. **Hot Reload**: Changes to `.svelte` files automatically reload
2. **Console**: Check browser console for errors
3. **Network Tab**: Monitor API calls in DevTools
4. **Stores**: Use `$storeName` to access store values in components

## Troubleshooting

### Port Already in Use
If port 5000 is taken, edit `package.json` and change the port in the `start` script.

### API Calls Fail
Make sure the backend is running on the expected port (default: 8081).

### Build Errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build` again

## Learn More

- [Svelte Documentation](https://svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Rollup Documentation](https://rollupjs.org/)

## License

Same as parent project (RPOS)
