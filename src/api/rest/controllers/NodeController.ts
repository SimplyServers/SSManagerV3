import * as diskspace from "diskspace";
import * as osutils from "os-utils";
import {IController} from "./IController";
import {Router} from "express";
import {SecretMiddleware} from "../middleware/SecretMiddleware";

export class NodeController implements IController{
    initRoutes(router: Router): void {
        router.get("/node/", [
            SecretMiddleware.requireSecret
        ], this.getStatus);
    }

    public getStatus = async (req, res, next) => {
      const cpu: any = await new Promise(resolve => {
         osutils.cpuUsage(cpu => {
             return resolve(cpu);
         })
      });

      const status = {
          cpu,
          totalmem: osutils.totalmem(),
          freemem: osutils.freemem(),
          totaldisk: -1,
          freedisk: -1
      };

      try {
          const disk: any = await new Promise((resolve, reject) => {
              diskspace.check("/", (err, disk) => {
                  if (err) {
                      return reject(err);
                  } else {
                      return resolve(disk);
                  }
              })
          });

          status.totaldisk = disk.total;
          status.freedisk = disk.free;
      } catch (e) {
          // We can safely ignore this error, there may be an issue with the drive
      }

      return res.json({
          status
      })
    };
}
