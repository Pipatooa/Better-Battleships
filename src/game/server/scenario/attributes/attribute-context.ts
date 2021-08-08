import {Ability} from '../abilities/ability';
import {Player} from '../player';
import {Scenario} from '../scenario';
import {Ship} from '../ship';
import {Team} from '../team';
import {Attribute} from './attribute';
import {IAttributeHolder} from './i-attribute-holder';

export class AttributeContext {
    public constructor(public readonly scenario: Scenario,
                       protected _team?: Team,
                       protected _player?: Player,
                       protected _ship?: Ship,
                       protected _ability?: Ability) {
    }

    public getAttribute(attributePath: AttributePath): Attribute {
        let selectorStr: string;
        let attributeName: string;

        [selectorStr, attributeName] = attributePath.split('.');

        let attributeSelector = selectorStr as AttributeSelector;
        let attributeHolder: IAttributeHolder | undefined;

        switch (attributeSelector) {
            case 'scenario':
                attributeHolder = this.scenario;
                break;
            case 'team':
                attributeHolder = this._team;
                break;
            case 'player':
                attributeHolder = this._player;
                break;
            case 'ship':
                attributeHolder = this._ship;
                break;
            case 'ability':
                attributeHolder = this._ability;
                break;
        }

        if (attributeHolder == undefined || !(attributeName in attributeHolder.attributes))
            throw new AttributeNotFoundError(`Could not find attribute '${attributePath}' in current context '${this.getContextName()}'`);

        return attributeHolder.attributes[attributeName];
    }

    public getContextName(): AttributeSelector {
        if (!(this._ability == undefined))
            return 'ability';

        if (!(this._ship == undefined))
            return 'ship';

        if (!(this._player == undefined))
            return 'player';

        if (!(this._team == undefined))
            return 'team';

        return 'scenario';
    }

    public withTeam(team: Team): AttributeContext {
        return new AttributeContext(this.scenario, team, this._player, this._ship, this._ability);
    }

    public withPlayer(player: Player): AttributeContext {
        return new AttributeContext(this.scenario, this._team, player, this._ship, this._ability);
    }

    public withShip(ship: Ship): AttributeContext {
        return new AttributeContext(this.scenario, this._team, this._player, ship, this._ability);
    }

    public withAbility(ability: Ability): AttributeContext {
        return new AttributeContext(this.scenario, this._team, this._player, this._ship, ability);
    }

    public get team(): Team | undefined {
        return this._team;
    }

    public get player(): Player | undefined {
        return this._player;
    }

    public get ship(): Ship | undefined {
        return this._ship;
    }

    public get ability(): Ability | undefined {
        return this._ability;
    }
}

export type AttributePath = string;

type AttributeSelector =
    'scenario' |
    'team' |
    'player' |
    'ship' |
    'ability';

export class AttributeNotFoundError extends Error {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AttributeNotFoundError.prototype);
    }
}
