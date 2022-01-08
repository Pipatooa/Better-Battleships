import { game } from '../../game';

const viewContainer = $('#view-container');
const views: { [name: string]: [activeCallback: () => void, inactiveCallback: () => void, wrapperElement: JQuery, element: JQuery, keyboardListener: (ev: KeyboardEvent) => void] } = {};

let defaultView: string | undefined;

export let selectedView: string | undefined;
export let currentView: string | undefined;

/**
 * Registers event listeners and creates the default view
 */
export function initialiseViewManager(): void {
    createView('Normal', () => {
        game.board!.informationGenerator!.clearHighlight();
        game.board!.informationGenerator!.push();
        game.gameRenderer!.renderNext();
    }, () => {}, 'N');
    setDefaultView('Normal');

    document.addEventListener('keydown', ev => {
        if (ev.key === 'Tab') {
            ev.preventDefault();
            cycleViews();
        }
    });
}

/**
 * Create a new view for player to select
 *
 * @param  name             Name of view
 * @param  activeCallback   Callback for when view becomes active
 * @param  inactiveCallback Callback for when view becomes inactive
 * @param  key              Key which can be pressed to switch to this view
 */
export function createView(name: string, activeCallback: () => void, inactiveCallback: () => void, key: string): void {

    const element = $('<div class="view p-3 border border-dark"></div>').text(name);
    const wrapperElement = $('<div class="col"></div>').append(element);

    wrapperElement.on('click', (ev) => {
        ev.preventDefault();
        selectView(name);
    });
    wrapperElement.on('mouseenter', () => hoverView(name));
    wrapperElement.on('mouseleave', () => {
        if (selectedView !== undefined)
            hoverView(selectedView);
        else
            selectedView = currentView;
    });

    key = key.toLowerCase();
    const keyboardListener = (ev: KeyboardEvent): void => {
        if (ev.key.toLowerCase() === key) {
            if (selectedView !== name)
                selectView(name);
            else if (defaultView !== undefined)
                selectView(defaultView);
        }
    };
    document.addEventListener('keypress', keyboardListener);
    
    viewContainer.prepend(wrapperElement);
    views[name] = [activeCallback, inactiveCallback, wrapperElement, element, keyboardListener];
}

/**
 * Sets a default view which can be fallen back to
 *
 * @param  name Name of view
 */
export function setDefaultView(name: string): void {
    defaultView = name;
}

/**
 * Selects a particular view and makes it active
 *
 * @param  name Name of view
 */
export function selectView(name: string): void {
    const [activeCallback, , , innerElement] = views[name];

    if (currentView !== undefined)
        views[currentView][1]();
    if (selectedView !== undefined)
        views[selectedView][3].removeClass('view-active');
    
    innerElement.addClass('view-active');

    currentView = name;
    selectedView = name;

    activeCallback();
}

/**
 * Updates the named view if it is the currently active view
 *
 * @param  view View to update if active
 */
export function updateViewIfActive(view: string): void {
    if (currentView !== view)
        return;
    const callback = views[view][0];
    callback();
}

/**
 * Updates the currently active view
 */
export function updateCurrentView(): void {
    if (currentView === undefined)
        return;
    const callback = views[currentView][0];
    callback();
}

/**
 * Makes a particular view active without selecting it
 *
 * @param  name Name of view
 */
function hoverView(name: string): void {
    if (currentView !== undefined)
        views[currentView][1]();

    currentView = name;
    views[name][0]();
}

/**
 * Removes a view
 *
 * @param  name Name of view
 */
export function removeView(name: string): void {
    const entry = views[name];
    if (entry === undefined)
        return;

    const [, inactiveCallback, wrapperElement, , keyboardListener] = entry;
    inactiveCallback();

    const oldSelectedView = selectedView;
    if (selectedView === name)
        selectedView = undefined;
    if (defaultView === name)
        defaultView = undefined;

    let newView: string | undefined;
    if (currentView === name) {
        newView = selectedView ?? defaultView;
        currentView = undefined;
    }

    if (oldSelectedView === name)
        newView ??= defaultView;

    if (newView !== undefined)
        selectView(newView);

    wrapperElement.remove();
    document.removeEventListener('keypress', keyboardListener);
    delete views[name];
}

/**
 * Cycles to the next available view and selects it
 */
export function cycleViews(): void {
    if (selectedView === undefined)
        return;
    const viewsArray = Object.keys(views);
    const index = viewsArray.indexOf(selectedView) + 1;
    const newView = viewsArray[index % viewsArray.length];
    selectView(newView);
}

/**
 * Checks if a view with a particular name exists already
 *
 * @param    name Name of view
 * @returns       Whether view exists already
 */
export function viewExists(name: string): boolean {
    return views[name] !== undefined;
}
