/**
 * VariableVisibilityElement - Client Version
 *
 * Wrapper for JQuery elements whose visibility is frequently toggled
 */
export class VariableVisibilityElement {

    private _visible: boolean;
    private _visibilityChanged = false;

    public constructor(public readonly element: JQuery) {
        this._visible = !this.element.hasClass('d-none');
    }

    /**
     * Updates the visibility of the element
     *
     * @param  newVisibility New visibility of the element
     */
    public setVisibility(newVisibility: boolean): void {
        this._visibilityChanged = newVisibility !== this._visible;
        if (this._visibilityChanged) {
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

    public get visibilityChanged(): boolean {
        return this._visibilityChanged;
    }

    public get rawElement(): HTMLElement {
        return this.element.get(0);
    }
}
