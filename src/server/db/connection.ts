import mysql from 'mysql';
import config from '../config';

export const pool = mysql.createPool({
    host: config.sqlHost,
    user: config.sqlUser,
    password: config.sqlPassword,
    database: config.sqlDatabase,
    connectionLimit: config.sqlConnectionLimit
});
