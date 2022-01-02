import config              from 'server/config';
import { EvaluationError } from '../errors/evaluation-error';

/**
 * EventEvaluationState - Server Version
 *
 * Used to keep track of the current state of evaluation during an event
 */
export class EventEvaluationState {

    private actionCount = 0;
    public terminate = false;

    /**
     * Bumps current action count and raises error if limit exceeded
     */
    public bumpActionCount(): void {
        if (++this.actionCount > config.evaluationActionLimit)
            throw new EvaluationError('Action evaluation count exceeded', `Tried to execute ${this.actionCount} actions within a single evaluation.`);
    }
}
