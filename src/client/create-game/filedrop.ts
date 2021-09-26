import ChangeEvent = JQuery.ChangeEvent;
import DragOverEvent = JQuery.DragOverEvent;
import DropEvent = JQuery.DropEvent;

const fileDrop = $('#file-drop');
const fileSelect = $('<input type="file" id="file-select" style="display: none;">');

export let file: File;

/**
 * Binds event handlers for file drop
 */
export function bindFileDrop(): void {
    fileDrop.on('drop', onDrop);
    fileDrop.on('dragover', onDragOver);
    fileDrop.on('dragenter', onDragEnter);
    fileDrop.on('dragexit', onDragExit);
    fileDrop.on('click', onClick);
    fileSelect.on('change', onChange);
}

/**
 * Called on file drop event
 *
 * @param  ev File drop event
 */
function onDrop(ev: DropEvent): void {
    ev.preventDefault();

    // Set file to file dropped into file drop
    const files = ev.originalEvent?.dataTransfer?.files;
    if (files !== undefined && files.length !== 0) {
        file = files[0];
    }

    fileDrop.removeClass('file-drop-highlighted');
}

/**
 * Called while file is being dragged over file drop
 *
 * @param  ev Drag over event
 */
function onDragOver(ev: DragOverEvent): void {
    ev.preventDefault();
}

/**
 * Called when file is first dragged over file drop
 */
function onDragEnter(): void {
    fileDrop.addClass('file-drop-highlighted');
}

/**
 * Called when file is dragged away from file drop
 */
function onDragExit(): void {
    fileDrop.removeClass('file-drop-highlighted');
}

/**
 * Called when file drop is clicked on
 */
function onClick(): void {
    fileSelect.trigger('click');
}

/**
 * Called when file is selected from file select window
 *
 * @param  ev Change event
 */
function onChange(ev: ChangeEvent): void {
    const files = ev.currentTarget.files as File[];
    if (files.length) {
        file = files[0];
    }
}

/**
 * Sets the file from a url download
 *
 * @param  url Url to download file from
 */
export async function setFileFromDownload(url: string): Promise<void> {

    // Submit request
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin'
    });

    const data = await res.blob();
    file = new File([data], 'scenario.zip');
    console.log(file);
}
