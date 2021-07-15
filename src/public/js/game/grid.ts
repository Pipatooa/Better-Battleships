const documentElement = document.documentElement;
let playGridElement : JQuery;

let gridSizeX : number;
let gridSizeY : number;

$(() => {
    playGridElement = $('#play-grid');
    setGrid(10, 10);
})

function setGrid(sizeX: number, sizeY: number): void {
    documentElement.style.setProperty('--grid-size-x', sizeX.toString());
    documentElement.style.setProperty('--grid-size-y', sizeY.toString());

    gridSizeX = sizeX;
    gridSizeY = sizeY;
    populateGrid();
}

function populateGrid(): void {
    const totalGridCells = gridSizeX * gridSizeY;

    // Remove elements from the grid that are no longer needed
    const gridChildren = playGridElement.children();
    gridChildren.slice(totalGridCells, gridChildren.length).remove();

    // Add new elements where needed
    for (let i = gridChildren.length; i < totalGridCells; i++) {
        playGridElement.append($(`<div class='play-grid-item'>${i}</div>`));
    }
}
