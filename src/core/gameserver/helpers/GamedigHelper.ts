import {Helper} from "./Helper";
import {Gameserver} from "../Gameserver";

import * as gamedig from "gamedig";

export class GamedigHelper extends Helper {

    static PING_TIME: number = 30000;
    static HOST_NAME: string = "127.0.0.1";

    private enabled: boolean;
    private pingerInterval: NodeJS.Timeout;
    public failedPings: number;

    constructor(parent: Gameserver) {
        super(parent);

        this.enabled = false;
        this.failedPings = 0;
    }

    public start = () => {
        this.pingerInterval = setInterval(this.ping, GamedigHelper.PING_TIME);
        this.enabled = true;
    };

    public stop = () => {
        if (this.pingerInterval) {
            clearInterval(this.pingerInterval);
        }

        this.enabled = false;
        this.failedPings = 0;
    };

    private ping = async () => {
        if (this.enabled) {
            return;
        }

        try {
            const result = await gamedig.query({
                type: this.parentServer.game.gamedig.id,
                host: GamedigHelper.HOST_NAME,
                port: this.parentServer.port
            });
        } catch (e) {
            if (this.failedPings >= 3) {
                await this.parentServer.dockerHelper.killContainer();
                this.parentServer.logAnnounce("Your server has been killed due to the server not responding.");
            } else {
                this.failedPings++;
            }
        }

    };
}
