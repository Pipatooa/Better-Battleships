import crypto            from 'crypto';
import fs                from 'fs';
import path              from 'path';
import AdmZip            from 'adm-zip';
import yaml              from 'yaml';
import { queryDatabase } from '../../db/query';

const scenarioDirectory = './public/scenarios';
export const scenarios: { [hash: string]: [filename: string, author: string, name: string, description: string] } = {};

/**
 * Finds built-in scenarios which are provided to the user
 */
export async function findAvailableScenarios(): Promise<void> {
    const files = fs.readdirSync(scenarioDirectory);
    for (const file of files) {
        const filePath = path.join(scenarioDirectory, file);
        const scenarioZip = new AdmZip(filePath);

        // Find scenario definition entries in zip file
        const formatEntry = scenarioZip.getEntry('format.txt')!.getData();
        const format = formatEntry.toString().trim() as 'JSON' | 'YAML';
        const scenarioEntry = scenarioZip.getEntry(`scenario.${format.toLowerCase()}`)!.getData();

        // Parse scenario definition file
        let scenarioEntryData: any;
        switch (format) {
            case 'JSON':
                scenarioEntryData = JSON.parse(scenarioEntry.toString());
                break;
            case 'YAML':
                scenarioEntryData = yaml.parse(scenarioEntry.toString());
                break;
        }

        // Unpack scenario data
        const author = scenarioEntryData.author;
        const name = scenarioEntryData.descriptor.name;
        const description = scenarioEntryData.descriptor.description;

        // Compute hash of zip file
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        const digest = await new Promise<string>((resolve) => {
            stream.on('end', () => {
                hash.setEncoding('hex');
                hash.end();
                resolve(hash.read());
            });
            stream.pipe(hash);
        });

        // Record scenario data
        scenarios[digest] = [file, author, name, description];

        // Check that entry in database exists for scenario
        const query = 'INSERT INTO scenario VALUES (?, TRUE, ?, ?, ?) ON DUPLICATE KEY UPDATE builtin = TRUE, author = ?, name = ?, description = ?;';
        await queryDatabase(query, [digest, author, name, description, author, name, description]);
    }
}
