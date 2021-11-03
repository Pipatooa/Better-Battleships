/**
 * VariableVisibilityElement - Client Version
 *
 * Wrapper for JQuery elements whose visibility is frequently toggled
 */
export class VariableVisibilityElement {
    
    private _visible: boolean;
    
    public constructor(public readonly element: JQuery) {
        this._visible = !this.element.hasClass('d-none');
    }

    /**
     * Updates the visibility of the element
     *
     * @param  newVisibility New visibility of the element
     */
    public setVisibility(newVisibility: boolean): void {
        if (newVisibility !== this._visible) {
            if (newVisibility)
                this.element.removeClass('d-none');
            else
                this.element.addClass('d-none');
            
            this._visible = newVisibility;
        }
    }

    /**
     * Getters and setters
     */

    public get visible(): boolean {
        return this._visible;
    }
}