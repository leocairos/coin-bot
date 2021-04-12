import { Router } from 'express';

import { formatter, dataTicker, getTicker } from './monitorBTC';

import { insertData } from './model';
import { config } from './config';
import ensureKeyAuthorization from './ensureKeyAuthorization';

const router = Router();

router.get('/btc-bot/preferences', async (req, res, next) => {
  try {
    const configs = await config();

    const ticker = await getTicker();
    const { maior, menor, ultima, tickerDate, variacao } = dataTicker(ticker);
    const pref = {
      message: `${process.env.MS_NAME} is up and running!`,
      //checkInterval: `Every ${configs.intervalToCheck} seconds`,
      checkInterval: `${configs.intervalToCheck}`,
      mailRecipient: `${(configs.mailTo)?.substring(0, 4)}***`,
      //mailRecipient: `${(configs.mailTo)}`,
      //downLimiteAlert: `${configs.downLimit}%`,
      downLimiteAlert: `${configs.downLimit}`,
      //downLimiteValue: `${formatter.format(Number(configs.downLimit) * Number(configs.btcBase) / 100)}`,
      downLimiteValue: `${(Number(configs.downLimit) * Number(configs.btcBase) / 100).toFixed(2)}`,
      //topLimiteAlert: `${ configs.topLimit }% `,
      topLimiteAlert: `${configs.topLimit} `,
      //topLimiteValue: `${formatter.format(configs.topLimit * Number(configs.btcBase) / 100)}`,
      topLimiteValue: `${(configs.topLimit * Number(configs.btcBase) / 100).toFixed(2)} `,
      //BTCBase: `${formatter.format(Number(configs.btcBase))}`,
      BTCBase: `${(Number(configs.btcBase)).toFixed(2)}`,
      //variation: `${variacao.toFixed(3)}% `,
      variation: `${variacao.toFixed(3)}`,
      //variationValue: `${formatter.format(Number(variacao * configs.btcBase / 100))}`,
      variationValue: `${(Number(variacao * configs.btcBase / 100)).toFixed(2)}`,
      ticker: {
        tickerDate,
        high: maior,
        low: menor,
        last: ultima,
      }
    }
    return res.render('preferences', { pref });
  } catch (error) {
    console.log(`${error} `);
  }
});

router.get('/btc-bot/health', async (req, res, next) => {
  try {
    const configs = await config();

    const ticker = await getTicker();
    const { maior, menor, ultima, tickerDate, variacao } = dataTicker(ticker);
    res.json({
      message: `${process.env.MS_NAME} is up and running!`,
      checkInterval: `Every ${configs.intervalToCheck} seconds`,
      mailRecipient: `${(configs.mailTo)?.substring(0, 4)}*** `,
      downLimiteAlert: `${configs.downLimit}% `,
      topLimiteAlert: `${configs.topLimit}% `,
      BTCBase: `${formatter.format(Number(configs.btcBase))} `,
      ticker: {
        tickerDate,
        high: maior,
        low: menor,
        last: ultima,
        variation: `${variacao.toFixed(3)}% `
      }
    })

  } catch (error) {
    console.log(`${error} `);
  }
});

router.post('/btc-bot/preferences', ensureKeyAuthorization, async (req, res, next) => {
  const { interval, topLimit, downLimit, email, btcBase } = req.body;
  const result = await insertData(interval, email, topLimit, downLimit, btcBase);
  return res.json(result);
})

// router.post('/btc-bot/preferences', async (req, res, next) => {
//   const { pref, checkInterval, topLimit, downLimit, email, btcBase, password } = req.body;
//   //const result = await insertData(checkInterval, email, topLimit, downLimit, btcBase);
//   console.log({ checkInterval, topLimit, downLimit, email, btcBase, password });
//   console.log(JSON.stringify(req.body));
//   return res.json({ checkInterval, topLimit, downLimit, email, btcBase, password });
// })

export default router;