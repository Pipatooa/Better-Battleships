import {MysqlError, QueryOptions} from 'mysql';
import {pool} from './connection';

export async function queryDatabase(query: string | QueryOptions, values?: any): Promise<any> {
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
