import Joi from "joi";
import AdmZip from "adm-zip";
import {IScenarioSource, Scenario} from "./scenario";
import {Board, IBoardSource} from "./board";
import {buildValueConstraint, IValueConstraintSource} from "./constraints/value-constraint-builder";

/**
 * Unpacks a zip file into a scenario object asynchronously
 * @param scenarioZip Zip file to extract
 * @returns scenario -- Scenario object
 */
export async function unpack(scenarioZip: AdmZip): Promise<any> {
    let scenario: Scenario;
    let board: Board;
    let test: any;

    // Used to allow unpacking errors to reference the current file that is being processed during unpacking
    let currentFile: string = '';

    try {
        // Scenario data
        currentFile = 'scenario.json';
        let scenarioSource = getEntryJSON(scenarioZip, currentFile) as unknown as IScenarioSource;
        scenario = await Scenario.fromSource(scenarioSource);

        // Board data
        currentFile = 'board.json';
        let boardSource = getEntryJSON(scenarioZip, currentFile) as unknown as IBoardSource;
        board = await Board.fromSource(boardSource);

        // Test data
        currentFile = 'test.json';
        let testSource = getEntryJSON(scenarioZip, currentFile) as unknown as IValueConstraintSource;
        test = await buildValueConstraint(testSource);
    }
    catch (e) {
        if (e instanceof UnpackingError)
            throw e.withContext(currentFile);
        throw e;
    }

    return [scenario, board, test];
}

/**
 * Gets file entry from a zip file and returns the JSON contents of the decompressed file
 * @param zip ZIP file to extract from
 * @param name Name or path to JSON file
 * @returns json -- JSON data returned from ZIP file
 */
function getEntryJSON(zip: AdmZip, name: string): JSON {
    // Find file in zip file, decompress and retrieve data
    let data = zip.getEntry(name)?.getData();

    // If file was not found
    if (data == undefined)
        throw new UnpackingError(`Could not find '${name}'`).withContext(name);

    // Try to parse data as JSON
    let json: JSON;
    try {
        json = JSON.parse(data.toString());
    }
    catch (e) {
        if (e instanceof SyntaxError)
            throw new UnpackingError(e.message).withContext(name);
        throw e;
    }

    // Return parsed JSON
    return json;
}

/**
 * UnpackingError class thrown when an error is encountered during the scenario unpacking process
 */
export class UnpackingError extends Error {
    private _context: string | undefined;

    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnpackingError.prototype);
    }

    /**
     * Getter function with formatting for context
     */
    public get context(): string | undefined {
        return `An error occurred whilst parsing ${this._context}`;
    }

    /**
     * Sets the context for this unpacking error. Also returns this object
     * @param context New context to use
     * @returns self
     */
    public withContext(context: string): UnpackingError {
        this._context = context;
        return this;
    }

    /**
     * Factory function to generate UnpackingError based on `Joi.ValidationError`
     *
     * Useful for Joi Validation
     *
     * @param err Joi validation error
     * @returns UnpackingError -- Created UnpackingError
     */
    public static fromJoiValidationError(err: Joi.ValidationError): UnpackingError {
        return new UnpackingError(err.message.toString());
    }
}