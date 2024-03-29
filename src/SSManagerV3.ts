import {Logger} from "./Logger";

import * as configData from "../config.json";
import {Gameserver} from "./core/gameserver/Gameserver";
import {Plugin} from "./core/plugin/Plugin";
import {Game} from "./core/game/Game";
import {DockerUtils} from "./utils/DockerUtils";
import {APIManager} from "./api/APIManager";

/** @see {isConfig} ts-auto-guard:type-guard */
export interface Config {
    servers: {
        pingTime: number,
        maxPort: number,
        minPort: number
    },
    api: {
        port: number,
        secret: string,
        addr: string
    },
    socket: {
        maxFileSize: number
    },
    dockerSocket: string
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

    constructor() {
        SSManagerV3.instance = this;
        this._config = configData as Config;
    }

    public init = async (verbose: boolean = false) => {
        this._logger = new Logger(verbose);

        // Check Docker
        const dockerManager = new DockerUtils();
        await dockerManager.bootstrap();

        await Plugin.loadPlugins();
        await Game.loadGames();
        // This must be loaded last
        await Gameserver.loadServers();

        const apiManager = new APIManager();
        await apiManager.loadServer();
    }

}
