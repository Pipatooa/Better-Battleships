/**
 * Array of built-in attributes for each attribute holder
 */
export const builtinAttributes = {
    scenario: ['teamCount'],
    team: ['playerCount'],
    player: ['shipCount'],
    ship: ['size', 'abilityCount', 'visibility', 'spottedBy'],
    ability: []
} as const;
