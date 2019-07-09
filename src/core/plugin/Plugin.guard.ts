/*
 * Generated type guards for "Plugin.ts".
 * WARNING: Do not manually change this file.
 */
import { PluginData } from "./Plugin";

export function isPluginData(obj: any, _argumentName?: string): obj is PluginData {
    return (
        typeof obj === "object" &&
        typeof obj.game === "string" &&
        typeof obj.name === "string" &&
        Array.isArray(obj.install) &&
        obj.install.every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(obj.remove) &&
        obj.remove.every((e: any) =>
            typeof e === "string"
        )
    )
}
