import {Gameserver} from "../../../core/gameserver/Gameserver";
import {IController} from "./IController";
import {Router} from "express";
import {SecretMiddleware} from "../middleware/SecretMiddleware";
import {ServerMiddleware} from "../middleware/ServerMiddleware";
import {check} from "express-validator";
import {SSManagerV3} from "../../../SSManagerV3";
import {isGameserverData, isServerEditPayload} from "../../../core/gameserver/Gameserver.guard";

export class GameserverController implements IController{
    initRoutes(router: Router): void {
        router.get("/gameserver/", [
            SecretMiddleware.requireSecret
        ], this.getGameservers);
        router.get("/gameserver/:server", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer
        ], this.getServer);
        router.post("/gameserver/:server/checkAllowed", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            }),
        ], this.checkPathAllowed);
        router.post("/gameserver/:server/fs/writeFile", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            }),
            check("contents").exists(),
            check("contents").isString(),
            check("contents").isLength({
                min: 0,
                max: 1000 * 1000 * 1000
            }),
        ], this.writeFile);
        router.post("/gameserver/:server/fs/removeFile", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            })
        ], this.removeFile);
        router.post("/gameserver/:server/fs/removeFolder", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            })
        ], this.removeFolder);
        router.post("/gameserver/:server/fs/fileContents", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            })
        ], this.getFileContents);
        router.post("/gameserver/:server/fs/folderContents", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("path").exists(),
            check("path").isString(),
            check("path").isLength({
                min: 0,
                max: 60
            })
        ], this.getFolderContents);
        router.post("/gameserver/:server/control/execute", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("command").exists(),
            check("command").isString(),
            check("command").isLength({
                min: 0,
                max: 60
            })
        ], this.executeCommand);
        router.get("/gameserver/:server/control/power/:action", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
        ], this.power);
        router.get("/gameserver/:server/control/reinstall", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
        ], this.reinstall);
        router.post("/gameserver/:server/edit", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("config").exists(),
            check("config").customSanitizer(input => {
                if (!isServerEditPayload(input)) {
                    throw new Error("INVALID_PAYLOAD_GENERIC");
                }

                return input;
            })
        ], this.edit);
        router.get("/gameserver/:server/update", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer
        ], this.update);
        router.get("/gameserver/:server/install", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer
        ], this.install);
        router.get("/gameserver/:server/remove", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer
        ], this.remove);
        router.post("/gameserver/:server/plugin/remove", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("plugin").exists(),
            check("plugin").isString(),
        ], this.removePlugin);
        router.post("/gameserver/:server/plugin/install", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,
            check("plugin").exists(),
            check("plugin").isString(),
        ], this.installPlugin);
        router.get("/gameserver/:server/plugin/", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer
        ], this.getPlugins);
        router.post("/gameserver/add", [
            SecretMiddleware.requireSecret,
            ServerMiddleware.fillServer,check("config").exists(),
            check("config").customSanitizer(input => {
                if (!isGameserverData(input)) {
                    throw new Error("INVALID_PAYLOAD_GENERIC");
                }

                return input;
            })

        ], this.add);
    }

    public getGameservers = (req, res, next) => {
        const servers = Gameserver.loadedServers.map(gameserver => gameserver.getInfo());

        return res.json({
            servers
        });
    };

    public getServer = (req, res, next) => {
        return res.json({
            server: req.server.getInfo() // The req.server object is made in the middleware
        })
    };

    public checkPathAllowed = (req, res, next) => {
        res.json({
            allowed: (
                req.server.fsHelper.checkBlocked(req.body.path) &&
                req.server.fsHelper.checkEdible(req.body.path)
            )
        })
    }
}
