import config              from 'server/config';
import { EvaluationError } from '../errors/evaluation-error';

/**
 * EventEvaluationState - Server Version
 *
 * Used to keep track of the current state of evaluation during an event
 */
export class EventEvaluationState {

    private actionCount = 0;
    private _midEvaluation = false;

    /**
     * Marks evaluation as having started
     */
    public startEvaluation(): void {
        this._midEvaluation = true;
    }

    /**
     * Bumps current action count and raises error if limit exceeded
     */
    public bumpActionCount(): void {
        if (++this.actionCount > config.evaluationActionLimit)
            throw new EvaluationError('Action evaluation count exceeded', `Tried to execute ${this.actionCount} actions within a single evaluation.`);
    }

    /**
     * Getters and setters
     */

    public get midEvaluation(): boolean {
        return this._midEvaluation;
    }
}
