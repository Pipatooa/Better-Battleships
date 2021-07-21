import {Descriptor} from "./descriptor.js";

export class TileType {
    constructor(public readonly descriptor: Descriptor, public readonly hexColor: string) { }
}