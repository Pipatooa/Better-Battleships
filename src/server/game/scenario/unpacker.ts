import crypto                   from 'crypto';
import fs                       from 'fs';
import AdmZip                   from 'adm-zip';
import yaml                     from 'yaml';
import { YAMLSyntaxError }      from 'yaml/util';
import { UnpackingError }       from './errors/unpacking-error';
import { Scenario }             from './objects/scenario';
import { ParsingContext }       from './parsing-context';
import type { IScenarioSource } from './objects/sources/scenario';
import type { IZipEntry }       from 'adm-zip';
import type { FileJSON }        from 'formidable';

export type ZipEntryMap = { [name: string]: IZipEntry };
const entryRegex = /^(abilities|ships|players|teams)\/([a-zA-Z\-_\d]+)(\.json|\.yaml)$/;

/**
 * Unpacks a zip file into a scenario object asynchronously
 *
 * @param    fileJSON Scenario file information
 * @returns           Scenario object
 */
export async function unpack(fileJSON: FileJSON): Promise<[Scenario, string]> {
    // Read scenario zip file
    const scenarioZip = new AdmZip(fileJSON.filepath);

    // Get format of scenario
    const formatEntry = await getEntryFromZip(scenarioZip, 'format.txt');
    const format = (await getRawDataFromEntry(formatEntry)).trim();
    if (format !== 'JSON' && format !== 'YAML')
        throw new UnpackingError(`Invalid scenario format '${format}'. Must be either 'JSON' or 'YAML'.`, 'format.txt');
    const fileExtension = `.${format.toLowerCase()}`;

    // Get a list of all zip entries
    const zipEntries: AdmZip.IZipEntry[] = scenarioZip.getEntries();

    // Get entries for named objects
    const abilityEntries: ZipEntryMap = {};
    const shipEntries: ZipEntryMap = {};
    const playerPrototypeEntries: ZipEntryMap = {};
    const teamEntries: ZipEntryMap = {};

    for (const entry of zipEntries) {

        // Check entry regex
        let result: RegExpExecArray | null = entryRegex.exec(entry.entryName);
        if (result === null || result[3] !== fileExtension)
            continue;

        // Put entry in correct array of entries
        switch (result[1]) {
            case 'abilities':
                abilityEntries[result[2]] = entry;
                break;
            case 'ships':
                shipEntries[result[2]] = entry;
                break;
            case 'players':
                playerPrototypeEntries[result[2]] = entry;
                break;
            case 'teams':
                teamEntries[result[2]] = entry;
                break;
        }
    }

    // Fixed filename zip entries
    const boardEntry: IZipEntry = await getEntryFromZip(scenarioZip, `board${fileExtension}`);
    const foreignAttributesRegistryEntry: IZipEntry = await getEntryFromZip(scenarioZip, `foreign-attributes${fileExtension}`);

    // Create parsing context
    const parsingContext = new ParsingContext(fileJSON, format, boardEntry, foreignAttributesRegistryEntry, teamEntries, playerPrototypeEntries, shipEntries, abilityEntries);

    // Parse scenario data
    const scenarioEntry: IZipEntry = await getEntryFromZip(scenarioZip, `scenario${fileExtension}`);
    const scenarioSource: IScenarioSource = await getJSONFromEntry(scenarioEntry, parsingContext.scenarioFormat) as unknown as IScenarioSource;
    const scenario = await Scenario.fromSource(parsingContext.withFile(`scenario${fileExtension}`), scenarioSource, true);

    // Compute hash of zip file
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(fileJSON.filepath);
    const digest = await new Promise<string>((resolve) => {
        stream.on('end', () => {
            hash.setEncoding('hex');
            hash.end();
            resolve(hash.read());
        });
        stream.pipe(hash);
    });

    return [scenario, digest];
}

/**
 * Gets file entry from a ZIP file
 *
 * @param    zip  ZIP file to extract from
 * @param    name Name or path to JSON file
 * @returns       Found zip entry
 */
async function getEntryFromZip(zip: AdmZip, name: string): Promise<IZipEntry> {
    // Find file in zip file
    const entry: IZipEntry | null = zip.getEntry(name);

    // If file was not found
    if (entry == null)
        throw new UnpackingError(`Could not find '${name}'`, 'root');

    return entry;
}

/**
 * Gets decompressed contents from a ZIP entry
 *
 * @param    zipEntry ZIP Entry to decompress and retrieve data from
 * @returns           String contents of ZIP entry
 */
export async function getRawDataFromEntry(zipEntry: IZipEntry): Promise<string> {
    return new Promise<string>((resolve) => {
        // Decompress and retrieve data
        zipEntry.getDataAsync((data: Buffer) => resolve(data.toString('utf-8')));
    });
}

/**
 * Gets decompressed JSON contents from a ZIP entry
 *
 * @param    zipEntry ZIP Entry to decompress and parse formatted data
 * @param    format   Format of source data to turn into JSON
 * @returns           JSON data returned from ZIP entry
 */
export async function getJSONFromEntry(zipEntry: IZipEntry, format: 'JSON' | 'YAML'): Promise<Record<string, unknown>> {
    return new Promise<Record<string, unknown>>((resolve, reject) => {

        // Decompress and retrieve data
        zipEntry.getDataAsync(async (data: Buffer) => {
            // Try to parse data as JSON
            let json: Record<string, unknown>;
            try {
                const contents = data.toString('utf-8');
                switch (format) {
                    case 'JSON':
                        json = JSON.parse(contents);
                        break;
                    case 'YAML':
                        json = yaml.parse(contents);
                        break;
                }
            } catch (e: unknown) {
                if (e instanceof SyntaxError || e instanceof YAMLSyntaxError) {
                    reject(new UnpackingError(e.message, zipEntry.entryName));
                    return;
                }

                reject(e);
                return;
            }

            // Return parsed data
            resolve(json);
        });
    });
}
