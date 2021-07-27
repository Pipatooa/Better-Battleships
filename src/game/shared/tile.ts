import {TileType} from "./tileType";

export class Tile {
    constructor(public readonly x: number,
                public readonly y: number,
                public readonly tileType: TileType) { }
}