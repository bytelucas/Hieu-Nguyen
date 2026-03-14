import { registerAs } from '@nestjs/config';

export interface IConfigDatabase {
  url: string;
  debug: boolean;
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const name = process.env.DB_NAME ?? 'metric_tracking';
  const user = process.env.DB_USER ?? 'postgres';
  const pass = process.env.DB_PASS ?? 'postgres';
  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
}

export default registerAs(
  'database',
  (): IConfigDatabase => ({
    url: getDatabaseUrl(),
    debug: process.env.DATABASE_DEBUG === 'true',
  }),
);
