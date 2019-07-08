/*
 * Generated type guards for "Game.ts".
 * WARNING: Do not manually change this file.
 * These types were generated with the help of https://github.com/usabilityhub/ts-auto-guard, however, major changes have been made to get things working
 */
import {GameData, GamedigOptions, LoggingOptions, VerifyFile} from "./Game";

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

export function isVerifyFile(obj: any, argumentName: string = "verifyFile"): obj is VerifyFile {
    console.log("recided obj: ", obj)
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.path === "string", `${argumentName}.path`, "string", obj.path) &&
        evaluate(typeof obj.hash === "string", `${argumentName}.hash`, "string", obj.hash)
    )
}

export function isGamedigOptions(obj: any, argumentName: string = "gamedigOptions"): obj is GamedigOptions {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.active === "boolean", `${argumentName}.active`, "boolean", obj.active) &&
        evaluate(typeof obj.id === "string", `${argumentName}.id`, "string", obj.id)
    )
}

export function isLoggingOptions(obj: any, argumentName: string = "loggingOptions"): obj is LoggingOptions {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.logFile === "object" &&
            evaluate(typeof obj.logFile.useLogFile === "boolean", `${argumentName}.logFile.useLogFile`, "boolean", obj.logFile.useLogFile) &&
            evaluate(typeof obj.logFile.path === "string", `${argumentName}.logFile.path`, "string", obj.logFile.path), `${argumentName}.logFile`, "{ useLogFile: boolean; path: string; }", obj.logFile) &&
        evaluate(typeof obj.useStdout === "boolean", `${argumentName}.useStdout`, "boolean", obj.useStdout)
    )
}

export function isGameData(obj: any, argumentName: string = "gameData"): obj is GameData {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.name === "string", `${argumentName}.name`, "string", obj.name) &&
        isGamedigOptions(obj.gamedig) &&
        evaluate(Array.isArray(obj.install) &&
            obj.install.every((e: any) =>
                typeof e === "string"
            ), `${argumentName}.install`, "string[]", obj.install) &&
        evaluate(Array.isArray(obj.update) &&
            obj.update.every((e: any) =>
                typeof e === "string"
            ), `${argumentName}.update`, "string[]", obj.update) &&
        evaluate(typeof obj.startCommand === "string", `${argumentName}.startCommand`, "string", obj.startCommand) &&
        evaluate(typeof obj.stopConsoleCommand === "string", `${argumentName}.stopConsoleCommand`, "string", obj.stopConsoleCommand) &&
        evaluate(typeof obj.dockerType === "string", `${argumentName}.dockerType`, "string", obj.dockerType) &&
        isLoggingOptions(obj.logging) &&
        obj.verify.every(e => {
            return isVerifyFile(e);
        })
    )
}
