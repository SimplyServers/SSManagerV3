import {Game, GameData} from "../game/Game";
import {FSUtils} from "../../utils/FSUtils";
import * as path from "path";
import {SSManagerV3} from "../../SSManagerV3";
import {PluginData} from "../plugin/Plugin";
import {FilesystemHelper} from "./helpers/FilesystemHelper";
import {DockerHelper} from "./helpers/DockerHelper";
import * as fs from "fs-extra";
import * as proc from "child_process";
import * as util from "util";
import {EventEmitter} from 'events';

export enum ServerStatus {
    RUNNING = "RUNNING",
    STOPPED = "STOPPED",
    STARTING = "STARTING",
    STOPPING = "STOPPING",
    MGTHALT = "MGT_HALT"
}

export interface BuildData {
    io: number,
    cpu: number,
    mem: number
}

export interface GameserverData {
    game: GameData,
    id: string,
    port: number,
    build: {
        io: number,
        cpu: number,
        mem: number
    },
    plugins: Array<PluginData>,
    maxPlayers: number,
    isInstalled: boolean,
}

export class Gameserver extends EventEmitter{
    get dockerHelper(): DockerHelper {
        return this._dockerHelper;
    }

    set dockerHelper(value: DockerHelper) {
        this._dockerHelper = value;
    }
    get fsHelper(): FilesystemHelper {
        return this._fsHelper;
    }

    set fsHelper(value: FilesystemHelper) {
        this._fsHelper = value;
    }

    static loadedServers: Array<Gameserver>;

    static loadServers = async () => {
        Gameserver.loadedServers = [];
        const data = await FSUtils.dirToJson(path.join(SSManagerV3.instance.root, "../localstorage/servers")) as unknown as Array<GameserverData>;
        data.forEach(serverData => {
            Gameserver.loadedServers.push(new Gameserver(serverData));
            console.log("Loaded server: " + JSON.stringify(serverData));
        })
    };

    static findById = (name: string): Gameserver => {
        return Gameserver.loadedServers.find(gameserver => gameserver.id === name);
    };

    get game(): Game {
        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }

    get status(): ServerStatus {
        return this._status;
    }

    set status(value: ServerStatus) {
        this.emit("status", value);

        //TODO: remove debug
        SSManagerV3.instance.logger.verbose("[" + this.id + "] Status Update: " + value);

        this._status = value;
    }

    get isBlocked(): boolean {
        return this._isBlocked;
    }

    set isBlocked(value: boolean) {
        this._isBlocked = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    get build(): BuildData {
        return this._build;
    }

    set build(value: BuildData) {
        this._build = value;
    }

    get plugins(): Array<PluginData> {
        return this._plugins;
    }

    set plugins(value: Array<PluginData>) {
        this._plugins = value;
    }

    get isInstalled(): boolean {
        return this._isInstalled;
    }

    set isInstalled(value: boolean) {
        this._isInstalled = value;
    }

    get maxPlayers(): number {
        return this._maxPlayers;
    }

    set maxPlayers(value: number) {
        this._maxPlayers = value;
    }

    private _game: Game;
    private _status: ServerStatus;
    private _isBlocked: boolean;

    private _id: string;
    private _port: number;
    private _build: BuildData;
    private _plugins: Array<PluginData>;
    private _isInstalled: boolean;
    private _maxPlayers: number;

    private _fsHelper: FilesystemHelper;
    private _dockerHelper: DockerHelper;

    constructor(data: GameserverData) {
        super();

        if (data.id.toLowerCase() !== data.id) {
            throw new Error("Id may not contain capital letters");
        }

        this._game = new Game(data.game);
        this._id = data.id;
        this._port = data.port;
        this._build = data.build;
        this._plugins = data.plugins;
        this._isInstalled = data.isInstalled;
        this._maxPlayers = data.maxPlayers;

        this._status = ServerStatus.STOPPED;
        this._isBlocked = false;

        this._fsHelper = new FilesystemHelper(this);
        this._dockerHelper = new DockerHelper(this); // This should be inited last!

        Gameserver.loadedServers.push(this); // Add the server to the loaded servers listing!
    }

    public logAnnounce = (data: string) => {
        this.emit("announcement", data);
        // TODO: remove debug
        SSManagerV3.instance.logger.verbose("[" + this.id + "] Announcement: " + data);
    };

    public logConsole = (data: string) => {
        this.emit("console", data);
        // TODO: remove debug
        SSManagerV3.instance.logger.verbose("[" + this.id + "] Console: " + data);
    };

    public exportData = (): GameserverData => {
        return  {
            game: this.game.exportData(),
            id: this.id,
            port: this.port,
            build: this.build,
            plugins: this.plugins,
            isInstalled: this.isInstalled,
            maxPlayers: this.maxPlayers,
        }
    };

    public getInfo = () => {
        return {
            data: this.exportData(),
            status: this.status,
            blocked: this.isBlocked
        }
    };

    public init = async () => {
        await this.saveData();

        await FSUtils.executeCommand(util.format(path.join(SSManagerV3.instance.root, "/bashScripts/newUser.sh") + " %s", this.id));
        console.log("cb");

        await this.dockerHelper.create();
        await this.saveIdentityFile();
    };

    public start = async () => {

    };

    public stop = async () => {

    };

    public kill = async () => {

    };

    public saveData = async () => {
        await fs.outputJson(path.join(SSManagerV3.instance.root, "../localstorage/servers/", this.id + ".json"), this.exportData());
    };

    public clearServer = async () => {
        await FSUtils.executeCommand(util.format(path.join(SSManagerV3.instance.root, "/bashScripts/clearUser.sh") + " %s", this.id));
    };

    public saveIdentityFile = async () => {
        await fs.outputJson(path.join(this.fsHelper.getRoot(), "/identity.json"), {
            id: this.id
        });
    }
}
