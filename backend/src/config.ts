import { getLastData, IPreference } from './model';

export const config = async (): Promise<IPreference> => {
  const lastData = await getLastData();
  if (lastData?.rows[0]) {
    return {
      //intervalToCheck: lastData.rows[0].intervalToCheck,
      intervalToCheck: parseInt(`${process.env.INTERVAL_TO_CHECK}`),
      mailTo: lastData.rows[0]?.mailTo,
      topLimit: lastData.rows[0]?.topLimit,
      downLimit: lastData.rows[0]?.downLimit,
      btcBase: lastData.rows[0]?.btcBase,
      createdAt: lastData.rows[0]?.createdAt
    } as IPreference;

  } else {
    return {
      intervalToCheck: parseInt(`${process.env.INTERVAL_TO_CHECK}`),
      mailTo: `${process.env.MAIL_TO}`,
      topLimit: Number(`${process.env.BTC_LIMIT_VAR_TOP}`),
      downLimit: Number(`${process.env.BTC_LIMIT_VAR_DOWN}`),
      btcBase: Number(`${process.env.BTC_BASE_IN_BRL}`),
      createdAt: new Date(),
    } as IPreference;

  }
}
