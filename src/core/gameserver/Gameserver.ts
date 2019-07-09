import {Game, GameData} from "../game/Game";
import {FSUtils} from "../../utils/FSUtils";
import * as path from "path";
import {SSManagerV3} from "../../SSManagerV3";
import {Plugin, PluginData} from "../plugin/Plugin";
import {FilesystemHelper} from "./helpers/FilesystemHelper";
import {DockerHelper} from "./helpers/DockerHelper";
import * as fs from "fs-extra";
import * as util from "util";
import {EventEmitter} from 'events';

export enum ServerStatus {
    RUNNING = "RUNNING",
    STOPPED = "STOPPED",
    STARTING = "STARTING",
    STOPPING = "STOPPING",
    MGTHALT = "MGT_HALT"
}

/** @see {isServerEditPayload} ts-auto-guard:type-guard */
export interface ServerEditPayload {
    build: BuildData,
    port: number,
    maxPlayers: number,
    game: GameData
}

/** @see {isBuildData} ts-auto-guard:type-guard */
export interface BuildData {
    io: number,
    cpu: number,
    mem: number
}

/** @see {isGameserverData} ts-auto-guard:type-guard */
export interface GameserverData {
    game: GameData,
    id: string,
    port?: number,
    build: {
        io: number,
        cpu: number,
        mem: number
    },
    plugins: Array<PluginData>,
    maxPlayers: number,
    isInstalled: boolean,
}

export class Gameserver extends EventEmitter {
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
        Gameserver.loadedServers = data.map(gameserverData => new Gameserver(gameserverData));

        SSManagerV3.instance.logger.verbose("Loaded servers: " + Gameserver.loadedServers.length);

    };

    static findById = (name: string): Gameserver => {
        return Gameserver.loadedServers.find(gameserver => gameserver.id === name);
    };

    static findNextPort = (): number => {
        if (Gameserver.loadedServers.length === 0) {
            return SSManagerV3.instance.config.servers.minPort;
        }

        const port = Math.max(...Gameserver.loadedServers.map(server => server.port), 0) + 1;

        if (port > SSManagerV3.instance.config.servers.maxPort) {
            return -1; // No available ports
        }

        return port;
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
        if (value.toLowerCase() !== value) {
            throw new Error("INVALID_ID");
        }

        this._id = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        if (Gameserver.loadedServers.find(gameserver => gameserver.port === value) !== undefined) {
            throw new Error("PORT_IN_USE");
        }

        if (value > SSManagerV3.instance.config.servers.maxPort || value < SSManagerV3.instance.config.servers.minPort) {
            throw new Error("PORT_OUT_OF_RANGE");
        }

        this._port = value;
    }

    get build(): BuildData {
        return this._build;
    }

    set build(value: BuildData) {
        // https://docs.docker.com/engine/reference/run/#block-io-bandwidth-blkio-constraint
        if (value.io < 10 || value.io > 1000) {
            throw new Error("BIKIO_OUT_OF_RANGE");
        }

        this._build = value;
    }

    get plugins(): Array<Plugin> {
        return this._plugins;
    }

    set plugins(value: Array<Plugin>) {
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

    get dataPath(): string {
        return path.join(SSManagerV3.instance.root, "../localstorage/servers/", this.id + ".json");
    }

    private _game: Game;
    private _status: ServerStatus;
    private _isBlocked: boolean;

    private _id: string;
    private _port: number;
    private _build: BuildData;
    private _plugins: Array<Plugin>;
    private _isInstalled: boolean;
    private _maxPlayers: number;

    private _fsHelper: FilesystemHelper;
    private _dockerHelper: DockerHelper;

    constructor(data: GameserverData) {
        super();

        if (data.id.toLowerCase() !== data.id) {
            throw new Error("INVALID_ID");
        }

        if (Gameserver.loadedServers.find(gameserver => gameserver.port === data.port) !== undefined) {
            throw new Error("PORT_IN_USE");
        }

        if (!data.port) {
            const contenderPort = Gameserver.findNextPort();

            if (contenderPort != -1) {
                data.port = contenderPort
            } else {
                throw new Error("NO_PORTS_AVAILABLE");
            }

        } else if (data.port > SSManagerV3.instance.config.servers.maxPort || data.port < SSManagerV3.instance.config.servers.minPort) {
            throw new Error("PORT_OUT_OF_RANGE");

        }

        // https://docs.docker.com/engine/reference/run/#block-io-bandwidth-blkio-constraint
        if (data.build.io < 10 || data.build.io > 1000) {
            throw new Error("BIKIO_OUT_OF_RANGE");
        }

        this._game = new Game(data.game);
        this._id = data.id;
        this._port = data.port;
        this._build = data.build;
        this._plugins = data.plugins.map(pluginData => new Plugin(pluginData));
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
        return {
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
        await this.dockerHelper.create();
        await this.saveIdentityFile();
    };

    public start = async () => {
        await this.dockerHelper.ensureStopped();
        this.status = ServerStatus.STARTING;
        await this.dockerHelper.start();
    };

    public stop = async () => {
        if (this.status !== ServerStatus.RUNNING) {
            throw new Error("SERVER_NOT_RUNNING")
        }

        this.status = ServerStatus.STOPPING;
        this.dockerHelper.writeToProcess(this.game.stopConsoleCommand); // Lets hope the server decides to listen
        // The server status will be automatically updated when it ends.
    };

    public edit = async (payload: ServerEditPayload) => {
        this.port = payload.port;
        this.build = payload.build;
        this.maxPlayers = payload.maxPlayers;

        await this.saveData();
    };

    public getInstalledPluginByName = (name: string): Plugin => {
        const pluginData = this.plugins.find(plugin => plugin.name === name);

        if (!pluginData) {
            return undefined;
        }

        return new Plugin(pluginData);
    };

    public removePlugin = async (name: string) => {
        const index = Gameserver.loadedServers.findIndex(val => val === this);

        if (index === -1) {
            throw new Error("PLUGIN_NOT_INSTALLED")
        }

        await this.plugins[index].removePlugin();

        delete this.plugins[index];
        await this.saveData();
    };

    public installPlugin = async (name: string) => {
        const index = Gameserver.loadedServers.findIndex(val => val === this);

        if (index !== -1) {
            throw new Error("PLUGIN_ALREADY_INSTALLED");
        }

        const plugin = Plugin.findByName(name);

        if (!plugin) {
            throw new Error("PLUGIN_UNKNOWN");
        }

        this.plugins.push(plugin);
        await this.saveData();

        await plugin.installPlugin();
    };

    public updatePlugin = async (name: string) => {
        const plugin = this.getInstalledPluginByName(name);
        await plugin.updatePlugin();
    };

    public kill = async () => {
        await this.dockerHelper.killContainer();
    };

    public saveData = async () => {
        await fs.outputJson(this.dataPath, this.exportData());
    };

    public clearServer = async () => {
        await this.dockerHelper.ensureStopped();
        await FSUtils.executeCommand(util.format(path.join(SSManagerV3.instance.root, "/bashScripts/clearUser.sh") + " %s", this.id));
    };

    public deleteServer = async () => {
        await this.dockerHelper.ensureStopped();
        await FSUtils.executeCommand(util.format(path.join(SSManagerV3.instance.root, "/bashScripts/removeUser.sh") + " %s", this.id));
        await this.dockerHelper.remove();

        try {
            await fs.unlink(this.dataPath);
        } catch (e) {
            // We can probably ignore this error safely. The file probably hasn't been generated (somehow?)
        }

        if (Gameserver.loadedServers.includes(this)) {
            delete Gameserver.loadedServers[Gameserver.loadedServers.findIndex(val => val === this)];
        }
    };

    public saveIdentityFile = async () => {
        await fs.outputJson(path.join(this.fsHelper.getRoot(), "/identity.json"), {
            id: this.id
        });
    }
}
