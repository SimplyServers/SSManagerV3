/*
 * Generated type guards for "Plugin.ts".
 * WARNING: Do not manually change this file.
 * These types were generated with the help of https://github.com/usabilityhub/ts-auto-guard.
 */
import { PluginData } from "./Plugin";

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

export function isPluginData(obj: any, argumentName: string = "pluginData"): obj is PluginData {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.game === "string", `${argumentName}.game`, "string", obj.game) &&
        evaluate(typeof obj.name === "string", `${argumentName}.name`, "string", obj.name) &&
        evaluate(Array.isArray(obj.install) &&
            obj.install.every((e: any) =>
                typeof e === "string"
            ), `${argumentName}.install`, "string[]", obj.install) &&
        evaluate(Array.isArray(obj.remove) &&
            obj.remove.every((e: any) =>
                typeof e === "string"
            ), `${argumentName}.remove`, "string[]", obj.remove)
    )
}
