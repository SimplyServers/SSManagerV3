import {Gameserver} from "../Gameserver";

export class Helper {
    protected readonly parentServer: Gameserver;

    constructor(parent: Gameserver) {
        this.parentServer = parent;
    }
}
