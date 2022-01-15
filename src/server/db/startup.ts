import fs                from 'fs';
import { queryDatabase } from './query';

/**
 * Executes startup database script
 */
export async function executeDBStartupScript(): Promise<void> {
    const queryData = fs.readFileSync('./db-scripts/startup.sql');
    const queries = queryData.toString().trim().split(';');

    for (const query of queries) {
        if (query.length !== 0)
            await queryDatabase(`${query};`);
    }
}
