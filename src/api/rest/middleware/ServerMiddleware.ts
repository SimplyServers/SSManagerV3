import {Gameserver} from "../../../core/gameserver/Gameserver";

export class ServerMiddleware {
    public static fillServer = async (req, res, next) => {
        if (!req.params.server) {
            return next(new Error("NO_SERVER_PROVIDED"));
        }

        const server = Gameserver.findById(req.params.server); // Get the server from the gameserver listing
        if (!server) {
            return next(new Error("SERVER_NOT_FOUND"));
        }

        req.server = server; // Append the server to the request
        return next();
    };
}
