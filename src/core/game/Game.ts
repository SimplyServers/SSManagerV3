import {FSUtils} from "../../utils/FSUtils";

import * as path from "path";
import {SSManagerV3} from "../../SSManagerV3";
import {Gameserver, ServerStatus} from "../gameserver/Gameserver";

/** @see {isVerifyFile} ts-auto-guard:type-guard */
export interface VerifyFile {
    path: string;
    hash: string;
}

/** @see {isGamedigOptions} ts-auto-guard:type-guard */
export interface GamedigOptions {
    active: boolean,
    id: string
}

/** @see {isLoggingOptions} ts-auto-guard:type-guard */
export interface LoggingOptions {
    logFile: {
        useLogFile: boolean,
        path: string
    }
    useStdout: boolean,
}

/** @see {isGameData} ts-auto-guard:type-guard */
export interface GameData {
    name: string,
    gamedig: GamedigOptions,
    install: Array<string>,
    update: Array<string>,
    startCommand: string,
    stopConsoleCommand: string,
    dockerType: string, // This should be an enum but I don't want to break stuff when it comes to backwards compatibility.
    logging: LoggingOptions,
    verify: Array<VerifyFile>
}

export class Game {

    static loadedGames: Array<Game>;

    static loadGames = async () => {
        Game.loadedGames = [];
        const data = await FSUtils.dirToJson(path.join(SSManagerV3.instance.root, "../localstorage/games")) as unknown as Array<GameData>;
        data.forEach(gameData => {
            Game.loadedGames.push(new Game(gameData));
            SSManagerV3.instance.logger.verbose("Loaded game: " + JSON.stringify(gameData));
        })
    };

    static findByName = (name: string): Game => {
        return Game.loadedGames.find(game => game.name === name);
    };

    get name(): string {
        return this._name;
    }

    get gamedig(): GamedigOptions {
        return this._gamedig;
    }

    get install(): Array<string> {
        return this._install;
    }

    get update(): Array<string> {
        return this._update;
    }

    get startCommand(): string {
        return this._startCommand;
    }

    get stopConsoleCommand(): string {
        return this._stopConsoleCommand;
    }

    get dockerType(): string {
        return this._dockerType;
    }

    get logging(): LoggingOptions {
        return this._logging;
    }

    get verify(): Array<VerifyFile> {
        return this._verify;
    }

    private readonly _name: string;
    private readonly _gamedig: GamedigOptions;
    private readonly _install: Array<string>;
    private readonly _update: Array<string>;
    private readonly _startCommand: string;
    private readonly _stopConsoleCommand: string;
    private readonly _dockerType: string; // This should be an enum but I don't want to break stuff when it comes to backwards compatibility.
    private readonly _logging: LoggingOptions;
    private readonly _verify: Array<VerifyFile>;

    constructor(gameData: GameData) {
        this._name = gameData.name;
        this._gamedig = gameData.gamedig;
        this._install = gameData.install;
        this._update = gameData.update;
        this._startCommand = gameData.startCommand;
        this._stopConsoleCommand = gameData.stopConsoleCommand;
        this._dockerType = gameData.dockerType;
        this._logging = gameData.logging;
        this._verify = gameData.verify;
    }

    public installGame = async (server: Gameserver) => {
        if (server.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if (server.isInstalled) {
            throw new Error("ALREADY_INSTALLED")
        }

        if (server.status !== ServerStatus.STOPPED) {
            throw new Error("SERVER_NOT_OFF")
        }


        SSManagerV3.instance.logger.verbose("executing command series...");

        server.isBlocked = true;
        await FSUtils.executeCommandSeries(server.fsHelper.getRoot(), this.install, server.id);
        server.isInstalled = true;
        await server.saveData();
        server.isBlocked = false;
    };

    public reinstallGame = async (server: Gameserver) => {
        if (server.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if (server.isInstalled) {
            throw new Error("ALREADY_INSTALLED")
        }

        if (server.status !== ServerStatus.STOPPED) {
            throw new Error("SERVER_NOT_OFF")
        }

        await server.clearServer();
        await this.installGame(server);
    };

    public updateGame = async (server: Gameserver) => {
        if (server.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if (server.isInstalled) {
            throw new Error("ALREADY_INSTALLED")
        }

        if (server.status !== ServerStatus.STOPPED) {
            throw new Error("SERVER_NOT_OFF")
        }

        server.isBlocked = true;
        await FSUtils.executeCommandSeries(server.fsHelper.getRoot(), this.update, server.id);
        server.isBlocked = false;
    };

    public exportData = (): GameData => {
        return {
            name: this.name,
            gamedig: this.gamedig,
            install: this.install,
            update: this.update,
            startCommand: this.startCommand,
            stopConsoleCommand: this.stopConsoleCommand,
            dockerType: this.dockerType, // This should be an enum but I don't want to break stuff when it comes to backwards compatibility.
            logging: this.logging,
            verify: this.verify
        }
    }
}
