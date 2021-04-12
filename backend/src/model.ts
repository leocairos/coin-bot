import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

//const dbFile = './dbBTCbot.sqlite';
const dbFile = `${process.env.DB_FILE}`;

async function openDb() {
  sqlite3.verbose();
  return open({
    filename: dbFile,
    driver: sqlite3.Database
  })
}
export interface IPreference {
  id?: number;
  intervalToCheck: number;
  mailTo: string;
  topLimit: number;
  downLimit: number;
  btcBase: number;
  createdAt: Date;
}

const dbAction = async (action: string, sql: string, parms: Object[]) => {
  try {
    const db = await openDb();
    let lReturn = false;
    let rows: IPreference[] = [];
    switch (action) {
      case 'create':
        const sqlCreate = `create table if not exists preferences (
          id integer primary key autoincrement, 
          intervalToCheck integer,
          mailTo text,
          topLimit integer,
          downLimit integer,
          btcBase integer, 
          createdAt date
          )`;
        await db.run(sqlCreate);
        console.log('Tables created/updated...');
        lReturn = true;
        break;
      case 'insert':
        const sqlInsert = `insert into preferences (
          intervalToCheck, mailTo, topLimit, 
          downLimit, btcBase, createdAt) values (?,?,?,?,?,?)`;
        await db.run(sqlInsert, [...parms, new Date().toUTCString()]);
        console.log('Data inserted...');
        lReturn = true;
        break;
      case 'getAll':
        const sqlGetAll = 'select * from preferences';
        rows = await db.all(sqlGetAll);
        console.log('All data: ', rows);
        lReturn = true;
        break;
      case 'get':
        rows = await db.all(sql);
        console.log('Preference: ', rows);
        lReturn = true;
        break;
      default:
        console.log(`[dbAction] invalid action: ${action}.`);
    }
    await db.close();
    return { lReturn, rows };
  } catch (error) {
    console.log(`[dbAction] ${action} error: ${error}`);
  }
}

export const insertData = async (interval: number, mail: string,
  top: number, down: number, base: number) => {
  const parmsInsert = [interval, mail, top, down, base];
  await dbAction('insert', '', parmsInsert)
  const res = await getLastData()
  return res;
}

export const createDatabase = async () => {
  const res = await dbAction('create', '', [''])
  return res;
}

export const getLastData = async () => {
  try {
    const res = await dbAction('get', `select 
    id, intervalToCheck, mailTo, topLimit, 
    downLimit, btcBase, createdAt
  from preferences 
  order by id desc LIMIT 1`, ['']);

    return res;
  } catch (err) {
    console.log(`[getLastData] Finished with error: ${err}`);
    return null;
  }

}

/*const model = (async () => {
  try {
    await dbAction('create', '', ['']);
  } catch (error) {
    console.log('[model] error:', error);
  }
})

export default model;*/