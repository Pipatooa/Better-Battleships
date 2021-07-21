import {Descriptor} from "./descriptor.js";
import {TileType} from "./tileType.js";
import {Tile} from "./tile.js";
import {GridRenderer} from "./canvas/gridRenderer.js";
import {Renderer} from "./canvas/renderer.js";

export class Grid {
    public readonly tiles: Tile[][] = [];

    constructor(public readonly sizeX: number,
                public readonly sizeY: number,
                public readonly tileType: TileType) {

        // Populate grid with tiles
        for (let x = 0; x < sizeX; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < sizeY; y++) {
                this.tiles[x][y] = new Tile(x, y, tileType);
            }
        }
    }
}

let desc = new Descriptor("Name", "Description");
let tileType = new TileType(desc, "000000");

export const grid = new Grid(10, 10, tileType);

let baseRenderer = new Renderer('#game-canvas')
let gridRenderer = new GridRenderer(baseRenderer, grid);
