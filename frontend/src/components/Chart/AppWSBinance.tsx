import React, { useState, useEffect, useRef, useCallback } from "react";

const paramsWS = [
  /* 
    The Kline/Candlestick Stream push updates to the current klines/candlestick every second.
    m -> minutes; h -> hours; d -> days; w -> weeks; M -> months
    1m 3m 5m 15m 30m 1h 2h 4h 6h 8h 12h 1d 3d 1w 1M
  */
  "btcbrl@kline_5m", 
  /* 
    24hr rolling window ticker statistics for a single symbol. 
    These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs.
  */
  "btcbrl@ticker"
]

export function AppWSBinance() {
  const [tickerWS, setTickerWS] = useState({});
  const [klines, setKlines] = useState([{}]);
  const [isSubscribed, setIsSubscribed] = useState(false);  
  const [currency, setCurrency] = useState('BRL');
  const ws = useRef(null);

  let first = useRef(false);

  const formatPrice = useCallback((price)=>{
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency })
      .format(price)
  },[])

  useEffect(() => {
    ws.current = new WebSocket("wss://stream.binance.com:9443/ws");    
    first.current = true;              
  }, []);

  const handleUnSubscribe = () => {
    if (!first.current) return;
    let unsubMsg = {method: "UNSUBSCRIBE", params: paramsWS, id: 321};    
    ws.current.send(JSON.stringify(unsubMsg));   
    setIsSubscribed(false) ;
  };

  const handleSubscribe = () => {
    if (!first.current) return;

    let msg = { method: "SUBSCRIBE", params: paramsWS,id: 1 };
    ws.current.send(JSON.stringify(msg));

    ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      console.log(data);      
      if (!['24hrTicker','kline'].includes(data.e)) return;     
      
      if (data.e === 'kline') {
        // "e": "kline",     // Event type
        // "E": 123456789,   // Event time
        // "s": "BNBBTC",    // Symbol
        // "k": {
        //   "t": 123400000, // Kline start time
        //   "T": 123460000, // Kline close time
        //   "s": "BNBBTC",  // Symbol
        //   "i": "1m",      // Interval
        //   "f": 100,       // First trade ID
        //   "L": 200,       // Last trade ID
        //   "o": "0.0010",  // Open price
        //   "c": "0.0020",  // Close price
        //   "h": "0.0025",  // High price
        //   "l": "0.0015",  // Low price
        //   "v": "1000",    // Base asset volume
        //   "n": 100,       // Number of trades
        //   "x": false,     // Is this kline closed?
        //   "q": "1.0000",  // Quote asset volume
        //   "V": "500",     // Taker buy base asset volume
        //   "Q": "0.500",   // Taker buy quote asset volume
        //   "B": "123456"   // Ignore
        // }
        const newKline = {
          eventTime: new Date(data.E),
          interval: data.i,
          openPrice: formatPrice(data.k.o),
          closePrice: formatPrice(data.k.c),
          highPrice: formatPrice(data.k.h),
          lowPrice: formatPrice(data.k.l),
          baseAssetVolume: data.k.v,
          //   "v": "1000",    // Base asset volume
        }
        setKlines([...klines, newKline])
      }

      if (data.e === '24hrTicker') {        
          // "e": "24hrTicker",  // Event type
          // "E": 123456789,     // Event time
          // "s": "BNBBTC",      // Symbol
          // "p": "0.0015",      // Price change
          // "P": "250.00",      // Price change percent
          // "w": "0.0018",      // Weighted average price
          // "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
          // "c": "0.0025",      // Last price
          // "Q": "10",          // Last quantity
          // "b": "0.0024",      // Best bid price
          // "B": "10",          // Best bid quantity
          // "a": "0.0026",      // Best ask price
          // "A": "100",         // Best ask quantity
          // "o": "0.0010",      // Open price
          // "h": "0.0025",      // High price
          // "l": "0.0010",      // Low price
          // "v": "10000",       // Total traded base asset volume
          // "q": "18",          // Total traded quote asset volume
          // "O": 0,             // Statistics open time
          // "C": 86400000,      // Statistics close time
    
        setTickerWS(          
          {
            eventTime: new Date(data.E),
            statisticsOpenTime: new Date(data.O),
            statisticsCloseTime: new Date(data.C),            
            priceChange: formatPrice(data.p),      
            PriceChangePercent: data.P,
            lastPrice: formatPrice(data.c),
            openPrice: formatPrice(data.o),
            highPrice: formatPrice(data.h),
            lowPrice: formatPrice(data.l),                      
            weightedAveragePrice: formatPrice(data.w),
            totalTradedBaseAssetVolume: data.v,
            totalTradedQuoteAssetVolume: formatPrice(data.q),                                  
          }
        )   
      }   
    };
    setIsSubscribed(true);
  };
  
  return (
    <div className="container">
    <button onClick={handleSubscribe}>Subscribe Binance</button>
    <button onClick={handleUnSubscribe}>UnSubscribe Binance</button>
    {isSubscribed ? 
    ('Real time: ' + JSON.stringify(tickerWS))
    : 
    ('Last info:' + JSON.stringify(tickerWS)) }
    <br/><br/>
    {tickerWS.totalTradedBaseAssetVolume + ', ' + tickerWS.totalTradedQuoteAssetVolume}
    <br/><br/>
    {JSON.stringify(klines)}
    </div>
  );
}
