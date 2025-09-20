// useOrderBook.js - Stable WebSocket hook without flickering

import { useState, useEffect, useRef } from 'react';

const useOrderBook = (symbol = 'AVAX') => {
  const [orderBook, setOrderBook] = useState({
    bids: [],
    asks: [],
    lastUpdate: null
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // Refs to avoid dependencies in useEffect
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const mockIntervalRef = useRef(null);

  const maxReconnectAttempts = 5;
  const throttleMs = 100;

  useEffect(() => {
    let mounted = true;

    const loadMockData = () => {
      if (!mounted) return;

      console.log('📊 Loading mock order book data...');

      const basePrice = 29.50;
      const spread = 0.001;

      const generateBids = () => {
        const bids = [];
        for (let i = 0; i < 15; i++) {
          const price = basePrice - spread - (i * 0.001);
          const size = (Math.random() * 200 + 50);
          bids.push({ price: parseFloat(price.toFixed(3)), size: parseFloat(size.toFixed(2)) });
        }
        return bids;
      };

      const generateAsks = () => {
        const asks = [];
        for (let i = 0; i < 15; i++) {
          const price = basePrice + spread + (i * 0.001);
          const size = (Math.random() * 200 + 50);
          asks.push({ price: parseFloat(price.toFixed(3)), size: parseFloat(size.toFixed(2)) });
        }
        return asks;
      };

      if (mounted) {
        setOrderBook({
          bids: generateBids(),
          asks: generateAsks(),
          lastUpdate: Date.now()
        });

        // Update mock data every 5 seconds (less frequent to reduce flickering)
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
        }

        mockIntervalRef.current = setInterval(() => {
          if (mounted) {
            setOrderBook({
              bids: generateBids(),
              asks: generateAsks(),
              lastUpdate: Date.now()
            });
          }
        }, 5000);
      }
    };

    const processOrderBookData = (data) => {
      if (!mounted) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 200) { // Increased throttle to 200ms
        return;
      }
      lastUpdateRef.current = now;

      try {
        // Handle HyperLiquid WebSocket data format
        if (data.channel === 'l2Book' || (data.data && data.data.coin)) {
          const bookData = data.data || data;
          const { levels } = bookData;

          if (levels && Array.isArray(levels) && levels.length === 2) {
            const [bidLevels, askLevels] = levels;

            const bids = bidLevels.map(level => ({
              price: parseFloat(level.px),
              size: parseFloat(level.sz)
            })).filter(level => level.size > 0);

            const asks = askLevels.map(level => ({
              price: parseFloat(level.px),
              size: parseFloat(level.sz)
            })).filter(level => level.size > 0);

            bids.sort((a, b) => b.price - a.price);
            asks.sort((a, b) => a.price - b.price);

            if (mounted) {
              setOrderBook({
                bids: bids.slice(0, 15),
                asks: asks.slice(0, 15),
                lastUpdate: now
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing order book data:', error);
      }
    };

    const connectWebSocket = () => {
      if (!mounted || isConnectingRef.current || reconnectAttemptsRef.current >= maxReconnectAttempts) {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          loadMockData();
        }
        return;
      }

      isConnectingRef.current = true;
      setIsConnecting(true);
      console.log(`🔌 Connecting to HyperLiquid (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);

      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      try {
        const websocket = new WebSocket('wss://api.hyperliquid.xyz/ws');

        websocket.onopen = () => {
          if (!mounted) return;

          console.log('✅ Connected to HyperLiquid WebSocket');
          setIsConnected(true);
          setIsConnecting(false);
          isConnectingRef.current = false;
          reconnectAttemptsRef.current = 0;

          const subscriptionMessage = {
            method: 'subscribe',
            subscription: {
              type: 'l2Book',
              coin: symbol
            }
          };

          websocket.send(JSON.stringify(subscriptionMessage));
        };

        websocket.onmessage = (event) => {
          if (!mounted) return;

          try {
            const data = JSON.parse(event.data);
            processOrderBookData(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        websocket.onerror = (error) => {
          if (!mounted) return;

          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          setIsConnecting(false);
          isConnectingRef.current = false;
        };

        websocket.onclose = (event) => {
          if (!mounted) return;

          console.log(`❌ Connection closed: ${event.code}`);
          setIsConnected(false);
          setIsConnecting(false);
          isConnectingRef.current = false;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 8000);

            console.log(`🔄 Reconnecting in ${delay/1000}s...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              setIsConnecting(true);
              connectWebSocket();
            }, delay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.log('❌ Max attempts reached, loading mock data...');
            setIsConnecting(false);
            loadMockData();
          }
        };

        wsRef.current = websocket;

      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        isConnectingRef.current = false;
        setIsConnecting(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = 2000 * reconnectAttemptsRef.current;
          reconnectTimeoutRef.current = setTimeout(() => {
            setIsConnecting(true);
            connectWebSocket();
          }, delay);
        } else {
          setIsConnecting(false);
          loadMockData();
        }
      }
    };

    // Initial connection attempt
    connectWebSocket();

    // Cleanup function
    return () => {
      mounted = false;
      isConnectingRef.current = false;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
    };
  }, [symbol]); // Only depend on symbol

  // Manual reconnect function
  const reconnect = () => {
    console.log('🔄 Manual reconnect...');
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    setIsConnecting(true);

    if (wsRef.current) {
      wsRef.current.close();
    }

    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }

    setTimeout(() => {
      // Trigger a new connection by incrementing a counter
      setOrderBook(prev => ({ ...prev, lastUpdate: Date.now() }));
    }, 1000);
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
  };

  return {
    orderBook,
    isConnected,
    isConnecting,
    disconnect,
    reconnect
  };
};

export default useOrderBook;