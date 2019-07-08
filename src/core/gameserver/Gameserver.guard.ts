/*
 * Generated type guards for "Gameserver.ts".
 * WARNING: Do not manually change this file.
 */
import { BuildData, GameserverData } from "./Gameserver";
import { isGameData } from "../game/Game.guard";
import { isPluginData } from "../plugin/Plugin.guard";

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
        evaluate(isGameData(obj.game) as boolean, `${argumentName}.game`, "import(\"/home/simplyalec/WebstormProjects/SSManagerV3/src/core/game/Game\").GameData", obj.game) &&
        evaluate(typeof obj.id === "string", `${argumentName}.id`, "string", obj.id) &&
        evaluate(typeof obj.port === "number", `${argumentName}.port`, "number", obj.port) &&
        evaluate(typeof obj.build === "object" &&
            evaluate(typeof obj.build.io === "number", `${argumentName}.build.io`, "number", obj.build.io) &&
            evaluate(typeof obj.build.cpu === "number", `${argumentName}.build.cpu`, "number", obj.build.cpu) &&
            evaluate(typeof obj.build.mem === "number", `${argumentName}.build.mem`, "number", obj.build.mem), `${argumentName}.build`, "{ io: number; cpu: number; mem: number; }", obj.build) &&
        evaluate(Array.isArray(obj.plugins) &&
            obj.plugins.every((e: any) =>
                isPluginData(e) as boolean
            ), `${argumentName}.plugins`, "import(\"/home/simplyalec/WebstormProjects/SSManagerV3/src/core/plugin/Plugin\").PluginData[]", obj.plugins) &&
        evaluate(typeof obj.maxPlayers === "number", `${argumentName}.maxPlayers`, "number", obj.maxPlayers) &&
        evaluate(typeof obj.isInstalled === "boolean", `${argumentName}.isInstalled`, "boolean", obj.isInstalled)
    )
}
