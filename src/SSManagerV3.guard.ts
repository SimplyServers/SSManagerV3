/*
 * Generated type guards for "SSManagerV3.ts".
 * WARNING: Do not manually change this file.
 */
import { Config } from "./SSManagerV3";

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

export function isConfig(obj: any, argumentName: string = "config"): obj is Config {
    return (
        typeof obj === "object" &&
        evaluate(typeof obj.servers === "object" &&
            evaluate(typeof obj.servers.pingTime === "number", `${argumentName}.servers.pingTime`, "number", obj.servers.pingTime) &&
            evaluate(typeof obj.servers.maxPort === "number", `${argumentName}.servers.maxPort`, "number", obj.servers.maxPort) &&
            evaluate(typeof obj.servers.minPort === "number", `${argumentName}.servers.minPort`, "number", obj.servers.minPort), `${argumentName}.servers`, "{ pingTime: number; maxPort: number; minPort: number; }", obj.servers) &&
        evaluate(typeof obj.api === "object" &&
            evaluate(typeof obj.api.port === "number", `${argumentName}.api.port`, "number", obj.api.port) &&
            evaluate(typeof obj.api.secret === "string", `${argumentName}.api.secret`, "string", obj.api.secret) &&
            evaluate(typeof obj.api.addr === "string", `${argumentName}.api.addr`, "string", obj.api.addr), `${argumentName}.api`, "{ port: number; secret: string; addr: string; }", obj.api) &&
        evaluate(typeof obj.socket === "object" &&
            evaluate(typeof obj.socket.maxFileSize === "number", `${argumentName}.socket.maxFileSize`, "number", obj.socket.maxFileSize), `${argumentName}.socket`, "{ maxFileSize: number; }", obj.socket) &&
        evaluate(typeof obj.dockerSocket === "string", `${argumentName}.dockerSocket`, "string", obj.dockerSocket)
    )
}
