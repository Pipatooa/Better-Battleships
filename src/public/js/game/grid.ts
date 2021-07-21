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

    // Sets a tile at a certain position
    public setTile(x: number, y: number, tileType: TileType) {
        this.tiles[x][y] = new Tile(x, y, tileType);
    }

    // Test function to make random tiles
    public generateTestTiles() {
        for (let x = 0; x < this.sizeX; x++) {
            for (let y = 0; y < this.sizeY; y++) {
                let r = Math.random();
                let tileType : TileType;

                if (r < 0.25)
                    tileType = tileTypeA;
                else if (r < 0.5)
                    tileType = tileTypeB;
                else if (r < 0.75)
                    tileType = tileTypeC;
                else
                    tileType = tileTypeD;

                this.tiles[x][y] = new Tile(x, y, tileType);
            }
        }
    }
}

let desc = new Descriptor("Name", "Description");

// Test tiles
let tileTypeA = new TileType(desc, "000000");
let tileTypeB = new TileType(desc, "FF0000");
let tileTypeC = new TileType(desc, "00FF00");
let tileTypeD = new TileType(desc, "0000FF");

export const grid = new Grid(10, 10, tileTypeA);

grid.generateTestTiles();

let baseRenderer = new Renderer('#game-canvas')
let gridRenderer = new GridRenderer(baseRenderer, grid);
