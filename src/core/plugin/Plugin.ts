import {FSUtils} from "../../utils/FSUtils";

import * as path from "path";
import {SSManagerV3} from "../../SSManagerV3";

/** @see {isPluginData} ts-auto-guard:type-guard */
export interface PluginData {
    game: string,
    name: string,
    install: Array<string>,
    remove: Array<string>
}

export class Plugin {

    static loadedPlugins: Array<Plugin>;

    static loadPlugins = async () => {
        Plugin.loadedPlugins = [];
        const data = await FSUtils.dirToJson(path.join(SSManagerV3.instance.root, "../localstorage/plugins")) as unknown as Array<PluginData>;
        data.forEach(pluginData => {
            Plugin.loadedPlugins.push(new Plugin(pluginData));
            SSManagerV3.instance.logger.verbose("Loaded plugin: " + JSON.stringify(pluginData));
        })
    };

    static findByName = (name: string): Plugin => {
        return Plugin.loadedPlugins.find(plugin => plugin.name === name);
    };

    get game(): string {
        return this._game;
    }

    get name(): string {
        return this._name;
    }

    get install(): Array<string> {
        return this._install;
    }

    get remove(): Array<string> {
        return this._remove;
    }

    private readonly _game: string;
    private readonly _name: string;
    private readonly _install: Array<string>;
    private readonly _remove: Array<string>;

    constructor(pluginData: PluginData) {
        this._game = pluginData.game;
        this._name = pluginData.name;
        this._install = pluginData.install;
        this._remove = pluginData.remove;
    }

    public installPlugin = async () => {
        // TODO: do
    };

    public removePlugin = async () => {
        // TODO: do
    };

    public updatePlugin = async () => {
        // TODO: do
    };

    public exportData = (): PluginData => {
        return {
            game: this.game,
            name: this.name,
            install: this.install,
            remove: this.remove
        }
    };
}
