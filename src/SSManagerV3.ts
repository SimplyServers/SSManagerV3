import {Logger} from "./Logger";

import * as configData from "../config.json";
import {Gameserver} from "./services/gameserver/Gameserver";
import {Plugin} from "./services/plugin/Plugin";
import {Game} from "./services/game/Game";

export interface Config {
    servers: {
        pingTime: number,
        maxPort: number,
        minPort: number
    },
    api: {
        port: number,
        secret: string
    },
    socket: {
        maxFileSize: number
    }
}

export class SSManagerV3 {
    get config(): Config {
        return this._config;
    }

    set config(value: Config) {
        this._config = value;
    }
    static get instance(): SSManagerV3 {
        return this._instance;
    }

    static set instance(value: SSManagerV3) {
        this._instance = value;
    }

    private static _instance: SSManagerV3;

    get logger(): Logger {
        return this._logger;
    }

    set logger(value: Logger) {
        this._logger = value;
    }

    get root(): string {
        return __dirname;
    }

    private _logger: Logger;
    private _config: Config;

    constructor(){
        SSManagerV3.instance = this;
        this._config = configData as Config;
        this._logger = new Logger();
    }

    public init = async () => {
        await Plugin.loadPlugins();
        await Game.loadGames();
        await Gameserver.loadServers();
    }

}
