import * as SocketIO from "socket.io";
import {Gameserver} from "../../core/gameserver/Gameserver";
import {SSManagerV3} from "../../SSManagerV3";

export class ServerConsole {

    private _namespace: SocketIO.Namespace;
    private active: Array<string>;

    constructor(namespace: SocketIO.Namespace) {
        this._namespace = namespace;
        this.active = [];
    }

    public init = () => {
        this.setupAuth();

        this._namespace.on("connection", socket => {
            socket.on("subscribe", payload => {
                if (this.active.includes(socket.id)) {
                    socket.emit("error", "Already subscribed to server. You must first disconnect.");
                    return;
                }

                this.active.push(socket.id); // Make sure that the client can't sub to multiple servers

                const targetServer = Gameserver.loadedServers.find(gameserver => gameserver.id === payload.toString());
                if (!targetServer) {
                    socket.emit("error", "Unknown server.");
                    return;
                }

                const onConsole = data => {
                    socket.emit("console", data);
                };

                const onStatus = data => {
                    socket.emit("status", data);
                };

                const onAnnouncement = data => {
                    socket.emit("announcement", data);
                };

                // Add the listeners
                targetServer.on("console", onConsole);
                targetServer.on("status", onStatus);
                targetServer.on("announcement", onAnnouncement);

                // Remove them on disconnect
                socket.on("disconnect", () => {
                    targetServer.removeListener("console", onConsole);
                    targetServer.removeListener("status", onStatus);
                    targetServer.removeListener("announcement", onAnnouncement);
                })
            })
        });
    };

    private setupAuth = () => {
        this._namespace.use((params, next) => {
            // Check for valid token and auth
            if (!params.handshake.query.authentication) { // Check for auth
                return next(new Error("No token."));
            }

            if (params.handshake.query.authentication !== SSManagerV3.instance.config.api.secret) {
                return next(new Error("Bad token."));
            }
            return next(); // Everything is good, continue.
        });
    };

}
