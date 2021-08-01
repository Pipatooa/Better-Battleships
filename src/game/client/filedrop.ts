import DropEvent = JQuery.DropEvent;
import DragEnterEvent = JQuery.DragEnterEvent;
import DragOverEvent = JQuery.DragOverEvent;
import DragExitEvent = JQuery.DragExitEvent;
import ClickEvent = JQuery.ClickEvent;
import ChangeEvent = JQuery.ChangeEvent;

const fileDrop = $('#file-drop');
const fileSelect = $('<input type="file" id="file-select" style="display: none;">');

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
        handleFile(files[0]);
    }

    fileDrop.removeClass('file-drop-highlighted');
}

function onDragOver(ev: DragOverEvent) {
    ev.preventDefault();
}

function onDragEnter(ev: DragEnterEvent) {
    fileDrop.addClass('file-drop-highlighted');
}

function onDragExit(ev: DragExitEvent) {
    fileDrop.removeClass('file-drop-highlighted');
}

function onClick(ev: ClickEvent) {
    fileSelect.trigger('click');
}

function onChange(ev: ChangeEvent) {
    let files = ev.currentTarget.files;
    if (files.length) {
        handleFile(files[0]);
    }
}

function handleFile(file: File) {
    console.log(file);

    let formData = new FormData();
    formData.append('file', file);
    formData.append('test', "hello");

    fetch('/game/create', {
        method: 'POST',
        body: formData,
    }).then(r => {
        console.log(r);
    });
}

export function unbindFileDrop() {
    fileDrop.off();
}
