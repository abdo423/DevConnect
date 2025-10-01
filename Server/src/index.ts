// src/index.ts
import mongoose from 'mongoose';
import config from 'config';
import app from './app';

const port = config.get('app.port') as number;
const dbURI = config.get('db.connectionString') as string;

mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
