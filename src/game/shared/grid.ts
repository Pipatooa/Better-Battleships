import {Descriptor} from "./descriptor";
import {TileType} from "./tileType";
import {Tile} from "./tile";

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

// Test tiles
export let tileTypeA = new TileType(new Descriptor("Tile A", "Desc"), "000000");
export let tileTypeB = new TileType(new Descriptor("Tile B", "Desc"), "FF0000");
export let tileTypeC = new TileType(new Descriptor("Tile C", "Desc"), "00FF00");
export let tileTypeD = new TileType(new Descriptor("Tile D", "Desc"), "0000FF");
