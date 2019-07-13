import {Gameserver} from "../../../core/gameserver/Gameserver";
import {IController} from "./IController";
import {Request, Router} from "express";
import {SecretMiddleware} from "../middleware/SecretMiddleware";
import {ServerMiddleware} from "../middleware/ServerMiddleware";
import {check} from "express-validator";
import {isGameserverData, isServerEditPayload} from "../../../core/gameserver/Gameserver.guard";
import {FilesystemHelper} from "../../../core/gameserver/helpers/FilesystemHelper";

// Get types for
export interface RequestAppendedServer extends Request {
    server: Gameserver
}

export class GameserverController implements IController {
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
            check("contents").isString()
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
        router.get("/gameserver/:server/control/power/:power", [
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
            check("config").exists(),
            check("config").customSanitizer(input => {
                if (!isGameserverData(input)) {
                    throw new Error("INVALID_PAYLOAD_GENERIC");
                }

                return input;
            })

        ], this.add);
    }

    public getGameservers = async (req, res, next) => {
        const servers = Gameserver.loadedServers.map(gameserver => gameserver.getInfo());

        return res.json({
            servers
        });
    };

    public getServer = async (req: RequestAppendedServer, res, next) => {
        return res.json({
            server: req.server.getInfo() // The req.server object is made in the middleware
        })
    };

    public checkPathAllowed = async (req: RequestAppendedServer, res, next) => {
        res.json({
            allowed: (
                req.server.fsHelper.checkBlocked(req.body.path) &&
                FilesystemHelper.checkEdible(req.body.path)
            )
        })
    };

    public writeFile = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.fsHelper.writeFile(req.body.path, req.body.contents);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public removeFile = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.fsHelper.removeFile(req.body.path);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public removeFolder = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.fsHelper.removeFolder(req.body.path);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public getFileContents = async (req: RequestAppendedServer, res, next) => {
        try {
            return res.json({
                contents: await req.server.fsHelper.getFileContents(req.body.path)
            });
        } catch (e) {
            return next(e);
        }
    };

    public getFolderContents = async (req: RequestAppendedServer, res, next) => {
        try {
            return res.json({
                contents: await req.server.fsHelper.getDirectoryContents(req.body.path)
            });
        } catch (e) {
            return next(e);
        }
    };

    public executeCommand = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.dockerHelper.writeToProcess(req.body.command);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public power = async (req: RequestAppendedServer, res, next) => {
        try {
            switch (req.params.power) {
                case "on":
                    await req.server.start();
                    break;
                case "off":
                    await req.server.stop();
                    break;
                case "kill":
                    await req.server.kill();
                    break;
                default:
                    return next(new Error("INVALID_POWER_ACTION"));
            }
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public reinstall = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.game.reinstallGame(req.server);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public edit = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.edit(req.body.config);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public update = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.game.updateGame(req.server);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public install = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.game.installGame(req.server);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public remove = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.deleteServer();
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public removePlugin = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.removePlugin(req.body.plugin);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public installPlugin = async (req: RequestAppendedServer, res, next) => {
        try {
            await req.server.installPlugin(req.body.plugin);
            return res.json({});
        } catch (e) {
            return next(e);
        }
    };

    public getPlugins = async (req: RequestAppendedServer, res, next) => {
        try {
            return res.json({
                plugins: req.server.plugins
            });
        } catch (e) {
            return next(e);
        }
    };

    public add = async (req, res, next) => {
        const newServer = new Gameserver(req.body.config);
        await newServer.init();
        return res.json({
            server: newServer
        })
    };
}
