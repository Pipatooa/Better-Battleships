import { createCustomGame }    from './create-custom-game';
import { setFileFromDownload } from './filedrop';

let currentScenario = '';
let scenarios: [string, string, string][];

/**
 * Shows built-in scenarios to the user
 */
export async function showBuiltinScenarios(): Promise<void> {

    // Retrieve scenario listing from server
    scenarios = await (await fetch('scenarios/list')).json();
    const scenarioList = $('#scenario-list');
    const scenarioDescription = $('#scenario-description');

    // Create option elements for each scenario
    for (const [, name] of scenarios) {
        const scenarioElement = $(`<option>${name}</option>`);
        scenarioList.append(scenarioElement);
    }

    // Register event listeners
    scenarioList.on('change', (ev) => {
        const selectElement = ev.currentTarget as HTMLSelectElement;
        const selectedIndex = selectElement.options.selectedIndex;
        const [filename, , description] = scenarios[selectedIndex];
        currentScenario = filename;
        scenarioDescription.text(description);
    });

    // Use first scenario as default selected
    currentScenario = scenarios[0][0];
    scenarioDescription.text(scenarios[0][2]);
}

/**
 * Creates a new game using a builtin scenario
 *
 * @param  errorContainer      HTML element containing all error information
 * @param  errorMessageElement HTML element showing error message
 * @param  errorContextElement HTML element showing error context message
 */
export async function createBuiltinGame(errorContainer: JQuery, errorMessageElement: JQuery, errorContextElement: JQuery): Promise<void> {
    await setFileFromDownload(`/scenarios/${currentScenario}`);
    await createCustomGame(errorContainer, errorMessageElement, errorContextElement);
}
