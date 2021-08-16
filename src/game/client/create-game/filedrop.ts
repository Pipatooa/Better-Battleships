import ChangeEvent = JQuery.ChangeEvent;
import DragOverEvent = JQuery.DragOverEvent;
import DropEvent = JQuery.DropEvent;

const fileDrop = $('#file-drop');
const fileSelect = $('<input type="file" id="file-select" style="display: none;">');

export let file: File;

export function bindFileDrop() {
    fileDrop.on('drop', onDrop);
    fileDrop.on('dragover', onDragOver);
    fileDrop.on('dragenter', onDragEnter);
    fileDrop.on('dragexit', onDragExit);
    fileDrop.on('click', onClick);
    fileSelect.on('change', onChange);
}

function onDrop(ev: DropEvent) {
    ev.preventDefault();

    let files = ev.originalEvent?.dataTransfer?.files;
    if (files?.length) {
        file = files[0];
    }

    fileDrop.removeClass('file-drop-highlighted');
}

function onDragOver(ev: DragOverEvent) {
    ev.preventDefault();
}

function onDragEnter() {
    fileDrop.addClass('file-drop-highlighted');
}

function onDragExit() {
    fileDrop.removeClass('file-drop-highlighted');
}

function onClick() {
    fileSelect.trigger('click');
}

function onChange(ev: ChangeEvent) {
    let files = ev.currentTarget.files;
    if (files.length) {
        file = files[0];
    }
}

export function unbindFileDrop() {
    fileDrop.off();
}
