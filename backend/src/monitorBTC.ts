import { CronJob } from 'cron';
import axios from 'axios';
import { config } from './config';

import sendMail from './sendMail';
import { insertData } from './model';

//var intervalToCheck: number;
var limiteVarDow: number;
var limiteVarTop: number;
var BTCBase: number;
var mailTo: string;

const getPreferences = async () => {
  try {
    const configs = await config();

    //intervalToCheck = configs.intervalToCheck;
    limiteVarDow = configs.downLimit / 100;
    limiteVarTop = configs.topLimit / 100;
    BTCBase = configs.btcBase;
    mailTo = configs.mailTo;

  } catch (error) {
    console.log(`[getPreferences] Error:${error}`);
  }
}

const intervalToCheck = parseInt(`${process.env.INTERVAL_TO_CHECK}`);

// const limiteVarDow = Number(`${process.env.BTC_LIMIT_VAR_DOWN}`) / 100;
// const limiteVarTop = Number(`${process.env.BTC_LIMIT_VAR_TOP}`) / 100;
// const BTCBase = Number(`${process.env.BTC_BASE_IN_BRL}`);

const calculateVariation = (last: number) => {
  const variation = (last / BTCBase);
  let varTopDow = variation >= 1
    ? (variation - 1) * 100
    : (1 - variation) * -100;

  return varTopDow;
}

interface IOriginalTicker {
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  open: string;
  date: number;
}

export const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2
})

export const dataTicker = (parms: IOriginalTicker) => {
  const { high, low, last, date } = parms;
  // const maior = formatter.format(Number(high));
  // const menor = formatter.format(Number(low));
  // const ultima = formatter.format(Number(last));
  const maior = Number(high).toFixed(2);
  const menor = Number(low).toFixed(2);
  const ultima = Number(last).toFixed(2);
  const tickerDate = new Date(date * 1000).toUTCString();

  const variacao = calculateVariation(Number(last));

  return { maior, menor, ultima, tickerDate, variacao };
}

const htmlMessage = (parms: IOriginalTicker) => {
  const { maior, menor, ultima, tickerDate, variacao } = dataTicker(parms);

  let html = `${tickerDate} <h3> Bitcoin (BTC):</h3>`
  html += `<ul><li><strong>Ultima cotação ${ultima}</strong></li>`;
  html += `<li>Menor valor ${menor}</li>`;
  html += `<li>Maior valor ${maior}</li>`;
  html += `<li>Variação ${(variacao).toFixed(2)}% (ultima/Base)</li></ul>`;

  html += `<br>Base BTC: ${formatter.format(Number(BTCBase))}.`;
  html += `<br>Limite alerta Top: ${(limiteVarTop * 100).toFixed(2)}%.`;
  html += `<br>Limite alerta Dow: ${(limiteVarDow * 100).toFixed(2)}%.`;
  html += `<br><h4>Ticker</h4><pre>${JSON.stringify(parms, null, 2)}</pre>`

  return html;
}

const checkAndAlert = async (originalTicker: IOriginalTicker) => {

  const variacao = calculateVariation(Number(originalTicker.last));
  console.log(`   Base: ${formatter.format(Number(BTCBase))} Variação ${(variacao).toFixed(3)}%`)
  console.log(`   Limite Top: ${(limiteVarTop * 100).toFixed(2)}%.`);
  console.log(`   Limite Dow: ${(limiteVarDow * 100).toFixed(2)}%.`);

  const lastConfig = await config();

  const alertTop = ((variacao >= 0) && (variacao >= limiteVarTop * 100));
  const alertDow = ((variacao < 0) && (variacao <= limiteVarDow * -100));

  //console.log(variacao, limiteVarTop, limiteVarDow, (variacao >= limiteVarTop), (variacao <= limiteVarDow * -1))
  let subject = alertTop
    ? 'BTC-Bot Alert (TOP)'
    : alertDow
      ? 'BTC-Bot Alert (DOW)'
      : 'BTC-Bot Alert';

  if (alertTop) {
    const newPref = {
      interval: intervalToCheck,
      topLimit: 5,//limiteVarTop * 100,
      downLimit: 3,//limiteVarDow * 100,
      email: mailTo,
      btcBase: BTCBase * (1 + variacao / 100)
    }
    await insertData(newPref.interval, newPref.email,
      newPref.topLimit, newPref.downLimit, newPref.btcBase)
  }

  if (alertDow) {
    const newPref = {
      interval: intervalToCheck,
      topLimit: 5,//limiteVarTop * 100,
      downLimit: 3,//limiteVarDow * 100,
      email: mailTo,
      btcBase: BTCBase * (1 + variacao / 100)
    }
    await insertData(newPref.interval, newPref.email,
      newPref.topLimit, newPref.downLimit, newPref.btcBase)
  }

  const inDEV = process.env.NODE_ENV === 'development';
  if (inDEV)
    subject = subject + ' - by Env Dev'

  if (alertTop || alertDow) {
    const html = htmlMessage(originalTicker);
    await sendMail({ subject, html })
  }
}

export const getTicker = async () => {
  //Retorna informações com o resumo das últimas 24 horas de negociações.
  const { data } = await axios
    .get('https://www.mercadobitcoin.net/api/BTC/ticker/');
  const originalTicker = data.ticker as IOriginalTicker;
  const tickerDate = new Date(originalTicker.date * 1000).toUTCString();
  console.log('\nCheck in ', tickerDate, 'LastValue: ', formatter.format(Number(originalTicker.last)));
  return originalTicker;
}

const monitorBTC = () => {
  console.log(`Every ${intervalToCheck} seconds check BTC value.`);
  let isRunning = false;
  try {
    const job = new CronJob(
      `*/${intervalToCheck} * * * * *`,
      () => {
        if (!isRunning) {
          isRunning = true;
          setTimeout(async () => {
            //Retorna informações com o resumo das últimas 24 horas de negociações.
            const originalTicker = await getTicker();
            await getPreferences();
            await checkAndAlert(originalTicker);
            isRunning = false;
          }, 1000);
        }
      });
    job.start();
  } catch (err) {
    console.log(`Finished with error: ${err}`);
  }
}

(async () => {
  await getPreferences()
})();

export default monitorBTC;