import {Descriptor} from "./descriptor";

export class TileType {
    constructor(public readonly descriptor: Descriptor, public readonly hexColor: string) { }
}