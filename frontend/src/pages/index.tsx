import Head from 'next/head';

import { MyChart } from '../components/Chart';

import styles from './home.module.scss';

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Coin Bot</title>
      </Head>
      <main className={styles.contentContainer}>
        <MyChart />

      </main>
    </>
  )
}
