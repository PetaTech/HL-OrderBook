import React from 'react';
import OrderBook from './components/OrderBook';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="app-container">
        <h1 className="app-title">HyperLiquid Order Book</h1>
        <OrderBook symbol="AVAX" />
      </div>
    </div>
  );
}

export default App;