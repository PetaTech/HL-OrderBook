import React, { useMemo } from 'react';
import useOrderBook from '../hooks/useOrderBook';
import './OrderBook.css';

// Individual order row component - heavily optimized to prevent flickering
const OrderRow = React.memo(({ price, size, total, type, isSpread = false, index }) => {
  return (
    <div
      className={`order-row ${type} ${isSpread ? 'spread-row' : ''}`}
      style={{ '--index': index }}
    >
      <div className="price-cell">{price}</div>
      <div className="size-cell">{size}</div>
      <div className="total-cell">{total}</div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.price === nextProps.price &&
    prevProps.size === nextProps.size &&
    prevProps.total === nextProps.total &&
    prevProps.type === nextProps.type &&
    prevProps.isSpread === nextProps.isSpread &&
    prevProps.index === nextProps.index
  );
});

// Main OrderBook component
const OrderBook = ({ symbol = 'AVAX' }) => {
  // Use custom hook for optimized WebSocket connection and data management
  const { orderBook, isConnected, isConnecting, reconnect } = useOrderBook(symbol);

  // Calculate running totals for display
  const processedAsks = useMemo(() => {
    let runningTotal = 0;
    return orderBook.asks.map(ask => {
      runningTotal += ask.size;
      return {
        ...ask,
        total: runningTotal.toFixed(2)
      };
    });
  }, [orderBook.asks]);

  const processedBids = useMemo(() => {
    let runningTotal = 0;
    return orderBook.bids.map(bid => {
      runningTotal += bid.size;
      return {
        ...bid,
        total: runningTotal.toFixed(2)
      };
    });
  }, [orderBook.bids]);

  // Find the spread (difference between best bid and best ask)
  const spread = useMemo(() => {
    if (processedAsks.length > 0 && processedBids.length > 0) {
      return (processedAsks[0].price - processedBids[0].price).toFixed(3);
    }
    return null;
  }, [processedAsks, processedBids]);

  return (
    <div className="order-book-container">
      {/* Loading overlay */}
      {isConnecting && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      {/* Header */}
      <div className="order-book-header">
        <div className="tabs-container">
          <div className="tab active">Order Book</div>
          <div className="tab">Trades</div>
        </div>
        <div className="settings-icon">⋮</div>
      </div>

      {/* Symbol and size selector */}
      <div className="symbol-header">
        <span className="size-selector">
          0.001
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="symbol">
          {symbol}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* Column headers */}
      <div className="column-headers">
        <div className="header-cell">Price (USD)</div>
        <div className="header-cell">Size ({symbol})</div>
        <div className="header-cell">Total ({symbol})</div>
      </div>

      {/* Order book content */}
      <div className="order-book-content">

        {/* Asks (sell orders) - displayed in reverse order */}
        <div className="asks-section">
          {processedAsks.slice().reverse().slice(0, 11).map((ask, index) => (
            <OrderRow
              key={`ask-${ask.price.toFixed(3)}`}
              price={ask.price.toFixed(3)}
              size={ask.size.toFixed(2)}
              total={ask.total}
              type="ask"
              index={index}
            />
          ))}
        </div>

        {/* Spread indicator */}
        <div className="spread-indicator">
          {isConnected && processedAsks.length > 0 && (
            <div className="spread-price">{(processedAsks[0]?.price || 0).toFixed(3)}</div>
          )}
        </div>

        {/* Bids (buy orders) */}
        <div className="bids-section">
          {processedBids.slice(0, 11).map((bid, index) => (
            <OrderRow
              key={`bid-${bid.price.toFixed(3)}`}
              price={bid.price.toFixed(3)}
              size={bid.size.toFixed(2)}
              total={bid.total}
              type="bid"
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Connection status indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-indicator">
          {isConnected ? '🟢' : '🔴'}
        </span>
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {!isConnected && (
          <button className="reconnect-btn" onClick={reconnect}>
            Reconnect
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderBook;