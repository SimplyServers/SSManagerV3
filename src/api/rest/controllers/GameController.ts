import {Game} from "../../../core/game/Game";
import {IController} from "./IController";
import {Router} from "express";
import {SecretMiddleware} from "../middleware/SecretMiddleware";

export class GameController implements IController{
    initRoutes(router: Router): void {
        router.get("/game/", [
            SecretMiddleware.requireSecret
        ], this.getGames);
    }

    public getGames = (req, res, next) => {
      return res.json({
          games: Game.loadedGames
      })
    };
}
