/*
 * Generated type guards for "Game.ts".
 * WARNING: Do not manually change this file.
 */
import { VerifyFile, GamedigOptions, LoggingOptions, GameData } from "./Game";

export function isVerifyFile(obj: any, _argumentName?: string): obj is VerifyFile {
    return (
        typeof obj === "object" &&
        typeof obj.path === "string" &&
        typeof obj.hash === "string"
    )
}

export function isGamedigOptions(obj: any, _argumentName?: string): obj is GamedigOptions {
    return (
        typeof obj === "object" &&
        typeof obj.active === "boolean" &&
        typeof obj.id === "string"
    )
}

export function isLoggingOptions(obj: any, _argumentName?: string): obj is LoggingOptions {
    return (
        typeof obj === "object" &&
        typeof obj.logFile === "object" &&
        typeof obj.logFile.useLogFile === "boolean" &&
        typeof obj.logFile.path === "string" &&
        typeof obj.useStdout === "boolean"
    )
}

export function isGameData(obj: any, _argumentName?: string): obj is GameData {
    return (
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        isGamedigOptions(obj.gamedig) as boolean &&
        Array.isArray(obj.install) &&
        obj.install.every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(obj.update) &&
        obj.update.every((e: any) =>
            typeof e === "string"
        ) &&
        typeof obj.startCommand === "string" &&
        typeof obj.stopConsoleCommand === "string" &&
        typeof obj.dockerType === "string" &&
        isLoggingOptions(obj.logging) as boolean &&
        Array.isArray(obj.verify) &&
        obj.verify.every((e: any) =>
            isVerifyFile(e) as boolean
        )
    )
}
