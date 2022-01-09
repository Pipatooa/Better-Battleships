import assert        from 'assert';
import fs            from 'fs';
import path          from 'path';
import ms            from 'ms';
import toml          from 'toml';
import defaultConfig from './default-config.toml';

/**
 * Container object containing values from config.tml file
 */
export class Config {

    public readonly port: number;

    public readonly gameLimit: number;
    public readonly gameIDLength: number;
    public readonly gameJoinTimeout: number;
    public readonly gameStartWaitDuration: number;

    public readonly evaluationActionLimit: number;

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
     *
     * @param  configRaw Parsed JSON config
     */
    public constructor(configRaw: any) {

        this.configRaw = configRaw;

        // Server section
        assert.deepStrictEqual(typeof configRaw.server, 'object', 'Config: could not find server section');
        this.port = this.getFromConfig('number', 'server.port');

        // Game section
        assert.deepStrictEqual(typeof configRaw.game, 'object', 'Config: could not find game section');
        this.gameLimit = this.getFromConfig('number', 'game.limit');
        this.gameIDLength = this.getFromConfig('number', 'game.idLength');
        this.gameJoinTimeout = this.getFromConfig('number', 'game.joinTimeout');
        this.gameStartWaitDuration = this.getFromConfig('number', 'game.startWaitDuration');

        // Evaluation section
        assert.deepStrictEqual(typeof configRaw.evaluation, 'object', 'Config: could not find evaluation section');
        this.evaluationActionLimit = this.getFromConfig('number', 'evaluation.actionLimit');

        // Sql section
        assert.deepStrictEqual(typeof configRaw.sql, 'object', 'Config: could not find sql section');
        this.sqlHost = this.getFromConfig('string', 'sql.host');
        this.sqlUser = this.getFromConfig('string', 'sql.user');
        this.sqlPassword = this.getFromConfig('string', 'sql.password');
        this.sqlDatabase = this.getFromConfig('string', 'sql.database');
        this.sqlConnectionLimit = this.getFromConfig('number', 'sql.connectionLimit');

        // Auth section
        assert.deepStrictEqual(typeof configRaw.sql, 'object', 'Config: could not find auth section');
        this.authHashRounds = this.getFromConfig('number', 'auth.hashRounds');
        this.authJwtSecretToken = this.getFromConfig('string', 'auth.jwtSecretToken');
        this.authJwtExpiryTimeSeconds = ms(this.getFromConfig('string', 'auth.jwtExpiryTime')) as unknown as number;
    }

    /**
     * Checks that a value matches a type string and returns the value if type check succeeds
     *
     * @param    typeString Type string to check type of value against
     * @param    name       Name of config option. Used in error messages
     * @returns             Value returned if type check succeeded
     */
    private getFromConfig(typeString: string, name: string): any {

        // Get value from path
        let value: any = this.configRaw;
        for (const part of name.split('.')) {
            value = value[part];
        }

        // Assert type equality
        assert.deepStrictEqual(typeof value, typeString, `Config: ${name} must be of type '${typeString}'.`);

        // Return value if assertion did not throw error
        return value;
    }
}

// ----- On Module Load ----- //

// If config file does not exist, create default config file
const configFilePath = path.join(__dirname, './config.tml');
if (!fs.existsSync(configFilePath))
    fs.writeFileSync(configFilePath, defaultConfig, 'utf-8');

// Parse config.tml file
const configRaw = toml.parse(fs.readFileSync(configFilePath, 'utf-8'));
const config = new Config(configRaw);
export default config;
