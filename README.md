# HyperLiquid Order Book - React Application

A complete React application featuring a real-time order book that connects to the HyperLiquid API and displays live trading data with pixel-perfect styling matching the provided Figma design.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - The order book will connect to HyperLiquid's API and display real-time data

## 📁 Project Structure

```
hyperliquid-orderbook/
├── public/
│   ├── index.html              # Main HTML template
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/
│   │   ├── OrderBook.jsx       # Main order book component
│   │   └── OrderBook.css       # Styling matching Figma design
│   ├── hooks/
│   │   └── useOrderBook.js     # Custom WebSocket hook
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Global application styles
│   ├── index.js                # Application entry point
│   └── index.css               # Global CSS reset and base styles
├── package.json                # Dependencies and scripts
├── .gitignore                  # Git ignore file
└── README.md                   # This file
```

## ✨ Features

- **Real-time WebSocket Connection**: Direct connection to HyperLiquid's API
- **Pixel-Perfect Design**: Exact match to provided Figma screenshot
- **Performance Optimized**: Throttled updates, memoized components
- **Auto-Reconnection**: Handles connection failures gracefully
- **Responsive Design**: Works on desktop and mobile devices
- **Clean Architecture**: Modular components with separation of concerns

## 🎯 Key Components

### OrderBook Component
- Real-time order book visualization
- Color-coded bids (green) and asks (red)
- Running totals and spread indicator
- Connection status with manual reconnect option

### useOrderBook Hook
- WebSocket connection management
- Data processing and throttling
- Automatic reconnection with backoff
- Connection state management

### OrderRow Component
- Memoized for optimal performance
- Individual price level display
- Hover effects and animations

## 🎨 Design Features

- **Dark Theme**: `#1a1a1a` background matching Figma
- **Color Scheme**:
  - Bids: `#2ed573` (green)
  - Asks: `#ff4757` (red)
  - Spread: `#ffa502` (orange)
- **Typography**: System fonts for optimal readability
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first responsive design

## ⚡ Performance Optimizations

- `React.memo` for component memoization
- `useMemo` for expensive calculations
- Throttled WebSocket updates (100ms intervals)
- Efficient data diffing to prevent unnecessary renders
- Optimized CSS with minimal reflows

## 🔌 API Integration

Connects to HyperLiquid WebSocket: `wss://api.hyperliquid.xyz/ws`

**Subscription Message:**
```json
{
  "method": "subscribe",
  "subscription": {
    "type": "l2Book",
    "coin": "AVAX"
  }
}
```

## 📱 Browser Support

- ✅ Chrome 16+
- ✅ Firefox 11+
- ✅ Safari 7+
- ✅ Edge 12+
- ✅ Modern mobile browsers

## 🛠 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔧 Configuration

The application works out of the box with no additional configuration required. The WebSocket connection to HyperLiquid is established automatically when the component mounts.

## 🐛 Troubleshooting

**Connection Issues:**
- Check your internet connection
- Ensure WebSocket connections aren't blocked by firewall
- Use the "Reconnect" button if connection fails

**Performance Issues:**
- The app is optimized for 60fps updates
- Data is throttled to prevent excessive re-renders
- Close other browser tabs if experiencing lag

## 📄 License

MIT License - feel free to use this code for your projects.

## 🤝 Contributing

This is a job assessment project, but feel free to suggest improvements or report issues.