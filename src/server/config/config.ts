import assert        from 'assert';
import fs            from 'fs';
import path          from 'path';
import ms            from 'ms';
import toml          from 'toml';
import defaultConfig from './default-config.toml';

const configFilePath = path.join(__dirname, './config.toml');

/**
 * Container object containing values from config.tml file
 */
export class Config {

    public readonly host: string;
    public readonly siteName: string;
    public readonly baseUrl: string;

    public readonly gameLimit: number;
    public readonly gameIDLength: number;
    public readonly gameJoinTimeout: number;
    public readonly gameStartWaitDuration: number;

    public readonly parsingMaxFileSize: number;
    public readonly parsingMaxFieldsSize: number;

    public readonly evaluationActionLimit: number;

    public readonly statsResultsPerPage: number;

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
        this.host = this.getFromConfig('string', 'server.host');
        this.siteName = this.getFromConfig('string', 'server.siteName');
        this.baseUrl = this.getFromConfig('string', 'server.baseUrl');

        // Game section
        assert.deepStrictEqual(typeof configRaw.game, 'object', 'Config: could not find game section');
        this.gameLimit = this.getFromConfig('number', 'game.limit');
        this.gameIDLength = this.getFromConfig('number', 'game.idLength');
        this.gameJoinTimeout = this.getFromConfig('number', 'game.joinTimeout');
        this.gameStartWaitDuration = this.getFromConfig('number', 'game.startWaitDuration');

        // Parsing section
        assert.deepStrictEqual(typeof configRaw.parsing, 'object', 'Config: could not find parsing section');
        this.parsingMaxFileSize = this.getFromConfig('number', 'parsing.maxFileSize');
        this.parsingMaxFieldsSize = this.getFromConfig('number', 'parsing.maxFieldsSize');

        // Evaluation section
        assert.deepStrictEqual(typeof configRaw.evaluation, 'object', 'Config: could not find evaluation section');
        this.evaluationActionLimit = this.getFromConfig('number', 'evaluation.actionLimit');

        // Stats section
        assert.deepStrictEqual(typeof configRaw.stats, 'object', 'Config: could not find stats section');
        this.statsResultsPerPage = this.getFromConfig('number', 'stats.resultsPerPage');

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
if (!fs.existsSync(configFilePath))
    fs.writeFileSync(configFilePath, defaultConfig, 'utf-8');

// Parse config.tml file
const contents = fs.readFileSync(configFilePath, 'utf-8');
const configRaw = toml.parse(contents);
const config = new Config(configRaw);
export default config;
