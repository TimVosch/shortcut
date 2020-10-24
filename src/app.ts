import 'reflect-metadata';
import { createServer } from 'http';
import express from 'express';
import bodyparser from 'body-parser';
import { Container } from 'inversify';
import { ShortcutAPI } from './web/shortcut.api';
import { db, DB_TOKEN } from './data/database';
import { TOKEN_SERVICE_TOKEN } from './domain/shortcut/token-service.interface';
import { DatabaseTokenService } from './shared/database-token.service';

(async () => {
  // ---- Initialize core objects ----
  const container = new Container({
    autoBindInjectable: true,
  });
  const app = express();
  const server = createServer(app);

  // ---- Add server/Express middleware ----
  app.use(bodyparser.json());

  // ---- Populate IoC Container ----
  container.bind(DB_TOKEN).toConstantValue(db);
  container.bind(TOKEN_SERVICE_TOKEN).to(DatabaseTokenService);

  // ---- Bind web interface ----
  const shortcutAPI = container.resolve(ShortcutAPI);
  app.use(shortcutAPI.createRouter());

  // ---- Start server ----
  const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 3000;
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();
