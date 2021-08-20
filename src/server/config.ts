import * as assert from 'assert';
import fs from 'fs';
import ms from 'ms';
import * as path from 'path';
import toml from 'toml';

/**
 * Container object containing values from config.tml file
 */
export class Config {
    public readonly gameLimit: number;
    public readonly gameIDLength: number;
    public readonly gameJoinTimeout: number;

    public readonly sqlHost: string;
    public readonly sqlUser: string;
    public readonly sqlPassword: string;
    public readonly sqlDatabase: string;
    public readonly sqlConnectionLimit: number;

    public readonly authHashRounds: number;
    public readonly authJwtSecretToken: string;
    public readonly authJwtExpiryTimeSeconds: number;

    protected configRaw: any;

    /**
     * Config constructor
     * @param configRaw Parsed JSON config
     */
    public constructor(configRaw: any) {

        this.configRaw = configRaw;

        // Game section
        assert.deepStrictEqual(typeof configRaw.game, 'object', 'Config: could not find section game');
        this.gameLimit = this.getFromConfig('number', 'game.limit');
        this.gameIDLength = this.getFromConfig('number', 'game.idLength');
        this.gameJoinTimeout = this.getFromConfig('number', 'game.joinTimeout');

        // Sql section
        assert.deepStrictEqual(typeof configRaw.sql, 'object', 'Config: could not find section sql');
        this.sqlHost = this.getFromConfig('string', 'sql.host');
        this.sqlUser = this.getFromConfig('string', 'sql.user');
        this.sqlPassword = this.getFromConfig('string', 'sql.password');
        this.sqlDatabase = this.getFromConfig('string', 'sql.database');
        this.sqlConnectionLimit = this.getFromConfig('number', 'sql.connectionLimit');

        // Auth section
        assert.deepStrictEqual(typeof configRaw.sql, 'object', 'Config: could not find section auth');
        this.authHashRounds = this.getFromConfig('number', 'auth.hashRounds');
        this.authJwtSecretToken = this.getFromConfig('string', 'auth.jwtSecretToken');
        this.authJwtExpiryTimeSeconds = ms(this.getFromConfig('string', 'auth.jwtExpiryTime')) as unknown as number;
    }

    /**
     * Checks that a value matches a type string and returns the value if type check succeeds
     * @param typeString Type string to check type of value against
     * @param name Name of config option. Used in error messages
     * @returns value -- Value returned if type check succeeded
     * @private
     */
    private getFromConfig(typeString: string, name: string): any {

        // Get value from path
        let value: any = this.configRaw;
        for (let part of name.split('.')) {
            value = value[part];
        }

        // Assert type equality
        assert.deepStrictEqual(typeof value, typeString, `Config: ${name} must be of type '${typeString}'.`);

        // Return value if assertion did not throw error
        return value;
    }
}

/**
 * Default config
 */
const defaultConfig = `
[game]
limit = 8
idLength = 6
joinTimeout = 5000

[sql]
host = ""
user = ""
password = ""
database = ""
connectionLimit = 1

[auth]
hashRounds = 10
jwtSecretToken = ""
jwtExpiryTime = ""
`.trimStart();

// If config file does not exist, create default config file
const configFilePath = path.join(__dirname, './config.tml');
if (!fs.existsSync(configFilePath))
    fs.writeFileSync(configFilePath, defaultConfig);

// Parse config.tml file
const configRaw = toml.parse(fs.readFileSync(configFilePath, 'utf-8'));
const config = new Config(configRaw);
export default config;
