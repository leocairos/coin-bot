import React, { useState, useEffect, useRef, useCallback } from "react";

export function AppWSCoinbase() {
  const [tickerWS, setTickerWS] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  // {
  //   high24h: '', 
  //   low24h: '',
  //   open24h: '',
  //   price: '',
  //   side:  '',
  //   time: '',
  //   volume24h: '',
  //   volume30d: ''
  // });
  const ws = useRef(null);

  let first = useRef(false);
  const url = "https://api.pro.coinbase.com";

  const formatUSD = useCallback((price)=>{
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'USD' })
      .format(price)
  },[])

  useEffect(() => {
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");    
    const apiCall = async () => {
       await fetch(url + "/products")
         .then((res) => res.json())
         first.current = true;              
     }; 
    apiCall();
  }, []);

  const handleUnSubscribe = () => {
    if (!first.current) return;
    let unsubMsg = {
        type: "unsubscribe",
        product_ids: ['BTC-USD'],
        channels: ["ticker"]
      };    
    ws.current.send(JSON.stringify(unsubMsg));   
    setIsSubscribed(false) ;
  };

  const handleSubscribe = () => {
    if (!first.current) return;
    // let unsubMsg = {
    //     type: "unsubscribe",
    //     product_ids: ['BTC-USD'],
    //     channels: ["ticker"]
    //   };    
    // ws.current.send(JSON.stringify(unsubMsg));

    let msg = {
      type: "subscribe",
      product_ids: ['BTC-USD'],
      channels: ["ticker"]
    };
    ws.current.send(JSON.stringify(msg));

    ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      if (data.type !== "ticker") return;
      if (data.product_id === 'BTC-USD') {
        //console.log(data);
        setTickerWS(          
          {
            high24h: formatUSD(data.high_24h), 
            low24h: formatUSD(data.low_24h),
            open24h: formatUSD(data.open_24h),
            price: formatUSD(data.price),
            side:  data.side,
            time: data.time,
            volume24h: formatUSD(data.volume_24h),
            volume30d: formatUSD(data.volume_30d)
          }
        )   
      }   
    };
    setIsSubscribed(true);
  };
  
  return (
    <div className="container">
    <button onClick={handleSubscribe}>Subscribe Coinbase</button>
    <button onClick={handleUnSubscribe}>UnSubscribe Coinbase</button>
    {isSubscribed ? 
    ('Real time: ' + JSON.stringify(tickerWS))
    : 
    ('Last info:' + JSON.stringify(tickerWS)) }
    </div>
  );
}
