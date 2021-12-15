import type { Descriptor } from '../descriptor';

/**
 * Ability - Client Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability {

    protected _gameElement: JQuery | undefined;

    /**
     * Ability constructor
     *
     * @param  shipIndex  Index of the ship that this ability belongs to
     * @param  index      Index of this ability in ship's ability list
     * @param  descriptor Descriptor for ability
     */
    public constructor(protected readonly shipIndex: number,
                       protected readonly index: number,
                       public readonly descriptor: Descriptor) {

    }

    /**
     * Creates an element representing this ability during the game
     *
     * @param    container Container to place element under
     * @returns            Created element
     */
    public createGameElement(container: JQuery): JQuery {
        this._gameElement = $('<div class="ability border border-2 border-dark"></div>');
        container.append(this._gameElement);
        return this._gameElement;
    }

    /**
     * Getters and setters
     */

    public get gameElement(): JQuery | undefined {
        return this._gameElement;
    }
}
