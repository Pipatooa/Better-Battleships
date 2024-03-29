import { pool }              from './connection';
import type { QueryOptions } from 'mysql';

/**
 * Queries the database asynchronously
 *
 * @param    query  Query to send to the database
 * @param    values Values to insert into prepared query statement in place of '?'
 * @returns         Query results
 */
export async function queryDatabase(query: string | QueryOptions, values?: unknown): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        pool.query(query, values, (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(results);
        });
    });
}
