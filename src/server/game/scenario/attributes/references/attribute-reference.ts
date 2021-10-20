import Joi from 'joi';
import { EvaluationContext } from '../../evaluation-context';

/**
 * AttributeReference - Server Version
 *
 * Base class for references to attributes
 */
export abstract class AttributeReference {

    /**
     * Get the value of the referenced attribute
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Value of the referenced attribute
     */
    public abstract getValue(evaluationContext: EvaluationContext): number;

    /**
     * Set the value of the referenced attribute
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     * @param  value             New value to assign to referenced attribute
     */
    public abstract setValue(evaluationContext: EvaluationContext, value: number): void;

}

/**
 * Regex matching all attribute reference strings
 */
export const attributeReferenceRegex = /^(local:(scenario|team|player|ship|ability)|foreign:(team|player|ship))\.[a-zA-Z\-_\d]+$/;

/**
 * Schema for validating source JSON data
 */
export const attributeReferenceSchema = Joi.string().regex(attributeReferenceRegex).required();

/**
 * Type matching reference type part of attribute reference strings
 */
export type AttributeReferenceType =
    'local' |
    'foreign';

/**
 * Type matching object selector part of attribute reference strings
 */
export type AttributeReferenceObjectSelector =
    'scenario' |
    'team' |
    'player' |
    'ship' |
    'ability';

/**
 * Type matching all attribute reference strings
 */
export type AttributeReferenceSource = string;
