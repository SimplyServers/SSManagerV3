import {Plugin} from "../../../core/plugin/Plugin";
import {IController} from "./IController";
import {Router} from "express";
import {SecretMiddleware} from "../middleware/SecretMiddleware";

export class PluginController implements IController{
    initRoutes(router: Router): void {
        router.get("/plugin/", [
            SecretMiddleware.requireSecret
        ], this.getPlugins);
    }

    public getPlugins = (req, res, next) => {
        return res.json({
            plugins: Plugin.loadedPlugins
        })
    }
}
