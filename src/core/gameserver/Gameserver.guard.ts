/*
 * Generated type guards for "Gameserver.ts".
 * WARNING: Do not manually change this file.
 */
import { isGameData } from "../game/Game.guard";
import { ServerEditPayload, BuildData, GameserverData } from "./Gameserver";
import { isPluginData } from "../plugin/Plugin.guard";

export function isServerEditPayload(obj: any, _argumentName?: string): obj is ServerEditPayload {
    return (
        typeof obj === "object" &&
        isBuildData(obj.build) as boolean &&
        typeof obj.port === "number" &&
        typeof obj.maxPlayers === "number" &&
        isGameData(obj.game) as boolean
    )
}

export function isBuildData(obj: any, _argumentName?: string): obj is BuildData {
    return (
        typeof obj === "object" &&
        typeof obj.io === "number" &&
        typeof obj.cpu === "number" &&
        typeof obj.mem === "number"
    )
}

export function isGameserverData(obj: any, _argumentName?: string): obj is GameserverData {
    return (
        typeof obj === "object" &&
        isGameData(obj.game) as boolean &&
        typeof obj.id === "string" &&
        typeof obj.port === "number" &&
        typeof obj.build === "object" &&
        typeof obj.build.io === "number" &&
        typeof obj.build.cpu === "number" &&
        typeof obj.build.mem === "number" &&
        Array.isArray(obj.plugins) &&
        obj.plugins.every((e: any) =>
            isPluginData(e) as boolean
        ) &&
        typeof obj.maxPlayers === "number" &&
        typeof obj.isInstalled === "boolean"
    )
}
