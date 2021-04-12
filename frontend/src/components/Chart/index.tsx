import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
// import { AppWSBinance } from "./AppWSBinance";
// import { AppWSCoinbase } from './AppWSCoinbase';
import {optionsCandlesTick, optionsLinesTick} from './default-apexcharts-options'

import styles from './styles.module.scss';

const formatCurrency = (price, currency) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
    }).format(price)

export function MyChart() {

  const [prices, setPrices] = useState({BTCUSDT: '0', BTCBRL: '0', USDTBRL: '0'})
  const [symbol, setSymbol] = useState('BTCBRL'); // BTCBRL || BTCUSDT
  const [seriesCandles, setSeriesCandles] = useState([{data: []}]);
  const [options, setOptions] = useState(optionsCandlesTick(symbol));
  const [seriesChartLine, setSeriesChartLine] = useState([]);
  const [optionsChartLine, setOptionsChartLine] = useState(optionsLinesTick(symbol));
  const [timeInterval, setTimeInterval] = useState('interval=1d&limit=30');

  useEffect(()=>{

    const fetchPrices = async () => {
      const baseURL = 'https://api.binance.com/api/v3/ticker/price?symbol='
      const btcUSD = await fetch(`${baseURL}BTCUSDT`).then((res) => res.json())
      const btcBRL = await fetch(`${baseURL}BTCBRL`).then((res) => res.json())
      const usdBRL = await fetch(`${baseURL}USDTBRL`).then((res) => res.json())

      setPrices({
        BTCUSDT: formatCurrency(btcUSD.price,'USD'),
        BTCBRL: formatCurrency(btcBRL.price,'BRL'),
        USDTBRL: formatCurrency(usdBRL.price,'BRL')})
    };

    fetchPrices();
  },[])

  useEffect(()=>{
    const historicalDataURL =
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&${timeInterval}`;
    /*
      [
        [
          1499040000000,      // Open time
          "0.01634790",       // Open
          "0.80000000",       // High
          "0.01575800",       // Low
          "0.01577100",       // Close
          "148976.11427815",  // Volume
          1499644799999,      // Close time
          "2434.19055334",    // Quote asset volume
          308,                // Number of trades
          "1756.87402397",    // Taker buy base asset volume
          "28.46694368",      // Taker buy quote asset volume
          "17928899.62484339" // Ignore.
        ]
      ]
    */
    // OHLC - Open-high-low-close
    // let historicalDataURL = `${url}/products/${pair}/candles?start=2021-03-10&end=2021-03-11&granularity=900`;
    const fetchHistoricalData = async () => {
      let dataArr = [];
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data) => (dataArr = data));

      const newDataCandles = dataArr.map(it => {
        return  {
          x: new Date(it[0]),
          y: [it[1], it[2], it[3], it[4]]
        }
      })
      setSeriesCandles([{ data: newDataCandles}])

      setOptions(optionsCandlesTick(symbol))

      const newData = dataArr.map(it => {
        return [it[0], Number(it[4])];
      })

      setSeriesChartLine([{
        name: symbol === 'BTCUSDT' ? 'BTC/USD' : 'BTC/BRL',
        data: newData
      }])

      setOptionsChartLine(optionsLinesTick(symbol))
    };

    fetchHistoricalData();

  },[symbol, timeInterval])

    return (
      <div className={styles.container}>
        <p>{JSON.stringify(prices)}</p>

        <section className={styles.cardsContainer}>
          <div className={styles.card}>
            <span>BTC/USD</span>
            <p>{prices.BTCUSDT}</p>
          </div>
          <div className={styles.card}>
            <span>BTC/BRL</span>
            <p>{prices.BTCBRL}</p>
          </div>
          <div className={styles.card}>
            <span>USD/BRL</span>
            <p>{prices.USDTBRL}</p>
          </div>
        </section>

      <section className={styles.buttonContainer}>
        <button onClick={()=>setTimeInterval('interval=1m&limit=30')}>Last 1 hour</button>
        <button onClick={()=>setTimeInterval('interval=30m&limit=16')}>Last 8 hours</button>
        <button onClick={()=>setTimeInterval('interval=1h&limit=24')}>Last 24 hours</button>
        <button onClick={()=>setTimeInterval('interval=12h&limit=14')}>Last 7 days</button>
        <button onClick={()=>setTimeInterval('interval=1d&limit=30')}>Last 30 days</button>
        <button onClick={()=>setTimeInterval('interval=1d&limit=90')}>Last 90 days</button>
        <button onClick={()=>setSymbol('BTCBRL')}>BTCBRL</button>
        <button onClick={()=>setSymbol('BTCUSDT')}>BTCUSDT</button>
        <button onClick={()=>setSymbol('USDTBRL')}>USDTBRL</button>

      </section>

      <span>{' '}{timeInterval}</span>

      <section className={styles.chartsContainer}>

        <Chart
        options={options}
        series={seriesCandles}
        type="candlestick"
        height='300rem'
        />
        {/* <Chart
        options={optionsChartLine}
        series={seriesChartLine}
        type="area"
        height='300rem'
        /> */}
        {
          // <AppWSCoinbase />
          // <AppWSBinance />
        }
      </section>
    </div>
    );
}
