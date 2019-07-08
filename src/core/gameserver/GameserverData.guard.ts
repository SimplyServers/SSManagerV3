/*
 * Generated type guards for "Gameserver.ts".
 * WARNING: Do not manually change this file.
 * These types were generated with the help of https://github.com/usabilityhub/ts-auto-guard, however, major changes have been made to get things working
 */

import {BuildData, GameserverData} from "./Gameserver";
import {isPluginData} from "../plugin/PluginData.guard";
import {isGameData} from "../game/GameData.guard";

function evaluate(
    isCorrect: boolean,
    varName: string,
    expected: string,
    actual: any
): boolean {
    if (!isCorrect) {
        console.error(
            `${varName} type mismatch, expected: ${expected}, found:`,
            actual
        )
    }
    return isCorrect
}

export function isBuildData(obj: any, argumentName: string = "buildData"): obj is BuildData {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.io === "number", `${argumentName}.io`, "number", obj.io) &&
        evaluate(typeof obj.cpu === "number", `${argumentName}.cpu`, "number", obj.cpu) &&
        evaluate(typeof obj.mem === "number", `${argumentName}.mem`, "number", obj.mem)
    )
}

export function isGameserverData(obj: any, argumentName: string = "gameserverData"): obj is GameserverData {
    return (
        typeof obj === "object" &&
        isGameData(obj.game) &&
        evaluate(typeof obj.id === "string", `${argumentName}.id`, "string", obj.id) &&
        evaluate(typeof obj.port === "number", `${argumentName}.port`, "number", obj.port) &&
        evaluate(typeof obj.build === "object" &&
            evaluate(typeof obj.build.io === "number", `${argumentName}.build.io`, "number", obj.build.io) &&
            evaluate(typeof obj.build.cpu === "number", `${argumentName}.build.cpu`, "number", obj.build.cpu) &&
            evaluate(typeof obj.build.mem === "number", `${argumentName}.build.mem`, "number", obj.build.mem), `${argumentName}.build`, "{ io: number; cpu: number; mem: number; }", obj.build) &&
        obj.plugins.every(e => isPluginData(e)) &&
        evaluate(typeof obj.maxPlayers === "number", `${argumentName}.maxPlayers`, "number", obj.maxPlayers) &&
        evaluate(typeof obj.isInstalled === "boolean", `${argumentName}.isInstalled`, "boolean", obj.isInstalled)
    )
}
