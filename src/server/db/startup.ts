import fs from 'fs';
import { queryDatabase } from './query';

/**
 * Executes startup database script
 */
export async function executeDBStartupScript(): Promise<void> {
    const queryData = fs.readFileSync('./db-scripts/startup.sql');
    if (queryData.length === 0)
        return;

    await queryDatabase(queryData.toString());
}
