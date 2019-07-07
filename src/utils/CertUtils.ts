import * as path from "path";
import * as util from "util";
import * as fs from "fs-extra";
import {SSManagerV3} from "../SSManagerV3";
import {FSUtils} from "./FSUtils";

export class CertUtils {
    public ensureCerts = async (): Promise<void> => {
        try {
            await fs.stat(path.join(SSManagerV3.instance.root, "../certs/server.cert"));
            await fs.stat(path.join(SSManagerV3.instance.root, "../certs/server.key"));
        } catch (e) {
            SSManagerV3.instance.logger.info("Generating SSL certificate...");
            await this.generateCerts();
            SSManagerV3.instance.logger.info("SSL certificate generated");
        }
    };

    public getOptions = async (): Promise<object> => {
        return {
            key: await fs.readFile(path.join(SSManagerV3.instance.root, "../certs/server.key")),
            cert: await fs.readFile(path.join(SSManagerV3.instance.root, "../certs/server.cert"))
        };
    };

    private generateCerts = async (): Promise<void> => {
        await FSUtils.executeCommand(util.format(path.join(SSManagerV3.instance.root, "/bashScripts/generateSsl.sh") + " %s", SSManagerV3.instance.config.api.addr), {
            cwd: path.join(SSManagerV3.instance.root, "../certs/")
        });
    };
}
