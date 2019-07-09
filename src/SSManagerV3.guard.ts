/*
 * Generated type guards for "SSManagerV3.ts".
 * WARNING: Do not manually change this file.
 */
import { Config } from "./SSManagerV3";

export function isConfig(obj: any, _argumentName?: string): obj is Config {
    return (
        typeof obj === "object" &&
        typeof obj.servers === "object" &&
        typeof obj.servers.pingTime === "number" &&
        typeof obj.servers.maxPort === "number" &&
        typeof obj.servers.minPort === "number" &&
        typeof obj.api === "object" &&
        typeof obj.api.port === "number" &&
        typeof obj.api.secret === "string" &&
        typeof obj.api.addr === "string" &&
        typeof obj.socket === "object" &&
        typeof obj.socket.maxFileSize === "number" &&
        typeof obj.dockerSocket === "string"
    )
}
