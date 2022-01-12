import { UIManager }                                    from '../ui/managers/ui-manager';
import type { AttributeUpdates, MultipleAttributeInfo } from 'shared/network/scenario/i-attribute-info';

/**
 * AttributeCollection - Client Version
 *
 * Keeps track of attribute values on the clientside and displays their values in the UI
 */
export class AttributeCollection {

    public readonly shouldDisplay: boolean;
    private elements: [JQuery, { [name: string]: [JQuery, JQuery] }][] = [];

    /**
     * AttributeCollection constructor
     *
     * @param  attributes Dictionary mapping attribute names to attribute information
     */
    public constructor(private readonly attributes: MultipleAttributeInfo) {
        this.shouldDisplay = Object.entries(this.attributes).length > 0;
    }

    /**
     * Updates the displayed values for this attribute collection
     *
     * @param  updates Dictionary of new attribute values
     */
    public updateAttributes(updates: AttributeUpdates): void {
        for (const [name, newValue] of Object.entries(updates))
            this.attributes[name].value = newValue;
        for (const attributeInfo of Object.values(this.attributes)) {
            const name = attributeInfo.descriptor.name;
            const value = AttributeCollection.convertToDisplayForm(attributeInfo.value);
            for (const elementSet of this.elements) {
                const [ nameElement, attributeElement ] = elementSet[1][name];
                nameElement.text(`${name}: `);
                attributeElement.text(value);
            }
        }
    }

    /**
     * Adds a container to display these attributes within
     *
     * @param  container Container to display attributes within
     */
    public displayInContainer(container: JQuery): void {
        container.children().remove();
        const attributeElements: { [name: string]: [JQuery, JQuery] } = {};
        for (const attributeInfo of Object.values(this.attributes)) {
            const name = attributeInfo.descriptor.name;
            const value = AttributeCollection.convertToDisplayForm(attributeInfo.value);
            const nameElement = $('<span></span>').text(`${name}: `);
            const valueElement = $('<span></span>').text(value);
            const attributeElement = $('<li class="attribute"></li>').append(nameElement, valueElement);
            attributeElement.on('mouseenter', () =>
                UIManager.currentManager!.tooltipInfoText = [attributeInfo.descriptor.name, attributeInfo.descriptor.description]);
            attributeElement.on('mouseleave', () =>
                UIManager.currentManager!.tooltipInfoText = undefined);
            container.append(attributeElement);
            attributeElements[name] = [nameElement, valueElement];
        }
        this.elements.push([container, attributeElements]);
    }

    /**
     * Stops updating of a container for these attributes
     *
     * @param  container Container to no longer display attributes within
     */
    public doNotDisplayInContainer(container: JQuery): void {
        this.elements = this.elements.filter(c => c[0] !== container);
    }

    /**
     * Converts a number to a human-readable format
     *
     * @param    number Number to convert
     * @returns         Number as a human-readable string
     */
    private static convertToDisplayForm(number: number): string {

        if (number === 0)
            return '0';

        let prefix: string;
        let middle: number;
        let suffix: string;

        if (number < 0) {
            prefix = '-';
            number *= -1;
        } else
            prefix = '';

        const exponent = Math.floor(Math.log10(number));
        const mantissa = number / Math.pow(10, exponent);
        const suffixes = ['k', 'M', 'B', 'T', 'S'] as const;

        // Exponential form
        if (exponent / 3 >= suffixes.length + 1 || exponent < -3) {
            middle = mantissa;
            suffix = `e${exponent}`;
        // Suffix form
        } else if (exponent >= 3) {
            middle = mantissa * Math.pow(10, exponent % 3);
            suffix = suffixes[Math.floor(exponent / 3) - 1];
        // Normal form
        } else {
            middle = number;
            suffix = '';
        }

        return `${prefix}${middle.toPrecision(5).replace(/(?:\.0+|(\.\d+?)0+)$/, '$1')}${suffix}`;
    }

    /**
     * Retrieves the value for an attribute
     *
     * @param    attributeName Name of attribute
     * @returns                Value of the attribute
     */
    public getValue(attributeName: string): number {
        return this.attributes[attributeName].value;
    }
}
