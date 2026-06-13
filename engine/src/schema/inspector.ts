import type { SourceConnector } from '../connectors/sources/base-connector.js';
import type { SourceConfig, TableSchema } from './types.js';
import { PostgreSQLConnector } from '../connectors/sources/postgresql.js';
import { SQLServerConnector } from '../connectors/sources/sqlserver.js';
import { MySQLConnector } from '../connectors/sources/mysql.js';
import { logger } from '../utils/logger.js';

export function createSourceConnector(config: SourceConfig): SourceConnector {
  switch (config.type) {
    case 'postgresql':
      return new PostgreSQLConnector(config);
    case 'sqlserver':
      return new SQLServerConnector(config);
    case 'mysql':
      return new MySQLConnector(config);
    default:
      throw new Error(`Unsupported source type: ${config.type}`);
  }
}

export async function inspectSource(config: SourceConfig): Promise<TableSchema[]> {
  const connector = createSourceConnector(config);
  await connector.connect();

  try {
    logger.info('Inspecting source schema', { type: config.type, db: config.database });
    const tables = await connector.inspectTables(config.schemas);
    logger.info(`Found ${tables.length} tables`, {
      totalRows: tables.reduce((s, t) => s + t.rowCount, 0),
    });
    return tables;
  } finally {
    await connector.disconnect();
  }
}
