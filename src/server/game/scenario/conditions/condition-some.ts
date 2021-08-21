import {IValueConstraintSource, ValueConstraint, valueConstraintSchema} from '../constraints/value-constaint';
import {buildValueConstraint} from '../constraints/value-constraint-builder';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {Condition} from './condition';
import {ConditionMultiple, conditionMultipleSchema, IConditionMultipleSource} from './condition-multiple';

/**
 * ConditionSome - Server Version
 *
 * Condition which holds true when the number of sub conditions which hold true meet a value constraint
 *
 * Extends ConditionMultiple
 */
export class ConditionSome extends ConditionMultiple {

    /**
     * ConditionSome constructor
     * @param subConditions List of sub conditions to check
     * @param valueConstraint Value constraint defining the number of sub conditions
     * that must hold true for the condition as a whole to hold true
     * @param inverted Whether or not the condition result will be inverted before it is returned
     */
    public constructor(subConditions: Condition[],
                       public readonly valueConstraint: ValueConstraint,
                       inverted: boolean) {
        super(subConditions, inverted);
    }

    /**
     * Checks whether or not this condition holds true
     * @returns boolean -- Whether or not this condition holds true
     */
    public check(): boolean {

        // Keep count of number of sub conditions which hold true
        let count: number = 0;

        // Loop through sub conditions and increment count for each condition that holds true
        for (let i = 0; i < this.subConditions.length; i++) {
            if (this.subConditions[i].check())
                count++;
        }

        // Check whether the count meets the held value constraint
        let meetsConstraint: boolean = this.valueConstraint.check(count);

        // Return result (invert result if necessary)
        return this.inverted ? !meetsConstraint : meetsConstraint;
    }

    /**
     * Factory function to generate ConditionAll from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param conditionSomeSource JSON data for ConditionAll
     * @param checkSchema When true, validates source JSON data against schema
     * @returns conditionAll -- Created ConditionAll object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionSomeSource: IConditionSomeSource, checkSchema: boolean): Promise<ConditionSome> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionSomeSource = await checkAgainstSchema(conditionSomeSource, conditionSomeSchema, parsingContext);

        // Get sub conditions and value constraint from source
        let subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionSomeSource.subConditions);
        let valueConstraint: ValueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.valueConstraint'), conditionSomeSource.valueConstraint, true);

        // Return created ConditionSome object
        return new ConditionSome(subConditions, valueConstraint, conditionSomeSource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionSomeSource extends IConditionMultipleSource {
    type: 'some',
    valueConstraint: IValueConstraintSource
}

/**
 * Schema for validating source JSON data
 */
export const conditionSomeSchema = conditionMultipleSchema.keys({
    type: 'some',
    valueConstraint: valueConstraintSchema
});