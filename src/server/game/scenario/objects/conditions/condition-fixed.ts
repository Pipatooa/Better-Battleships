import { Condition } from './condition';

/**
 * ConditionFixed - Server Version
 *
 * Test condition which will return a static result when checked
 */
export class ConditionFixed extends Condition {

    /**
     * ConditionFixed constructor
     *
     * @param  result Result to return when checked
     * @protected
     */
    public constructor(private readonly result: boolean) {
        super(false);
    }

    /**
     * Checks whether this condition holds true
     *
     * @returns  Whether this condition holds true
     */
    public check(): boolean {
        return this.result;
    }
}
