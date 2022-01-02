import type { ColorAtlas }          from '../../ui/canvas/color-atlas';
import type { AttributeCollection } from '../attribute-collection';
import type { Board }               from '../board';
import type { Descriptor }          from '../descriptor';
import type { Ship }                from '../ship';

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
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  attributeCollection Attributes for this ability
     * @param  _usable             Whether this ability is usable
     */
    public constructor(protected readonly ship: Ship,
                       protected readonly index: number,
                       public readonly descriptor: Descriptor,
                       private readonly icon: string,
                       public readonly attributeCollection: AttributeCollection,
                       protected _usable: boolean) {

    }

    /**
     * Creates an element representing this ability during the game
     *
     * @param    container Container to place element under
     * @returns            Created element
     */
    public createGameElement(container: JQuery): JQuery {
        this._gameElement = $('<div class="ability p-1 border border-2 border-dark"></div>');
        if (!this._usable)
            this._gameElement.addClass('ability-unavailable');
        this._gameElement.css('background-image', `url(${this.icon})`);
        container.append(this._gameElement);
        return this._gameElement;
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @param    colorAtlas Color atlas to use for tile colors
     * @returns             Board representing possible actions for this ability
     */
    public abstract generateAbilityBoard(colorAtlas: ColorAtlas<'moveValid' | 'moveOrigin'>): Board | undefined;

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
