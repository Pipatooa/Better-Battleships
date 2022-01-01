import type { Descriptor } from '../descriptor';
import type { Ship }       from '../ship';

/**
 * Ability - Client Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability {

    protected _gameElement: JQuery | undefined;
    private _usable = false;

    /**
     * Ability constructor
     *
     * @param  ship       Ship that this ability belongs to
     * @param  index      Index of this ability in ship's ability list
     * @param  descriptor Descriptor for ability
     */
    public constructor(protected readonly ship: Ship,
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
        if (!this._usable)
            this._gameElement.addClass('ability-unavailable');
        container.append(this._gameElement);
        return this._gameElement;
    }

    /**
     * Getters and setters
     */

    public get gameElement(): JQuery | undefined {
        return this._gameElement;
    }

    public get usable(): boolean {
        return this._usable;
    }

    public set usable(usable: boolean) {
        this._usable = usable;

        if (usable)
            this._gameElement?.addClass('ability-unavailable');
        else
            this._gameElement?.removeClass('ability-unavailable');
    }
}
