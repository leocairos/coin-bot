import https from 'https';
import fs from 'fs';

import app from "./app";
import { createDatabase } from './model';
import monitorBTC from './monitorBTC';

(async () => {

  try {
    await createDatabase();

    const port = parseInt(`${process.env.PORT}`);
    //await app.listen(port);

    // Listen both http & https ports    
    const httpsServer = https.createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    }, app);

    await httpsServer.listen(port);

    console.log(`[${process.env.MS_NAME}] Running on port ${port} (https)...`);

    monitorBTC();

    //getLastData();

  } catch (error) {
    console.log(`${error}`);
  }

})();