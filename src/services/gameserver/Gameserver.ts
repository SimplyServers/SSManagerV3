import {Game, GameData} from "../game/Game";
import {FSUtils} from "../../utils/FSUtils";
import * as path from "path";
import {SSManagerV3} from "../../SSManagerV3";
import EventEmitter = NodeJS.EventEmitter;
import {PluginData} from "../plugin/Plugin";
import {FilesystemHelper} from "./helpers/FilesystemHelper";
import {DockerHelper} from "./helpers/DockerHelper";

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
    isInstalled: boolean
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
        const data = await FSUtils.dirToJson(path.join(SSManagerV3.instance.root, "localstorage/servers")) as unknown as Array<GameserverData>;
        data.forEach(serverData => {
            Gameserver.loadedServers.push(new Gameserver(serverData));
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
    }

    public logAnnounce = (data: string) => {

    };

    public logConsole = (data: string) => {

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
}
