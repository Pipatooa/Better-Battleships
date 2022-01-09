import crypto from 'crypto';
import fs     from 'fs';
import path   from 'path';
import AdmZip from 'adm-zip';
import yaml   from 'yaml';

const scenarioDirectory = './public/scenarios';
export const scenarios: { [hash: string]: [filename: string, name: string, description: string] } = {};

/**
 * Finds built-in scenarios which are provided to the user
 */
export function findAvailableScenarios(): void {
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
        const name = scenarioEntryData.descriptor.name;
        const description = scenarioEntryData.descriptor.description;

        // Compute hash of zip file
        const hash = crypto.createHash('sha256');
        hash.update(scenarioZip.toBuffer());
        hash.setEncoding('hex');
        hash.end();

        // Record scenario data
        scenarios[hash.read()] = [file, name, description];
    }
}
