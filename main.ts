import {SSManagerV3} from "./src/SSManagerV3";
import * as proc from "child_process";
import * as path from "path";
import * as util from "util";

(async () => {
    // TODO: Make SSManager more of an daemon then something that needs tmux.

    let verbose = false;
    let install = false;

    process.argv.forEach((val, index, arr) => {
        if (val === "--verbose") {
            verbose = true;
        } else if (val === "--install") {
            install = true;
        }
    });

    if (install) { // Check if we're installing or running.
        console.log("Please wait, running install script.");

        try{
            await new Promise((resolve, reject) => {
                proc.exec(path.join(__dirname, "src/bashScripts/install.sh"), (err) => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
            });

            console.log("Successfully installed SSManager.")
        } catch (e) {
            console.log("Install failed; " + e);
        }
    } else {
        await new Promise((resolve, reject) => {
            const execPath = util.format("chmod +x %s/src/bashScripts/*.sh", __dirname);
            console.log("Making scripts executable (" + execPath + ")...");

            proc.exec(execPath, (err) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
        console.log("Starting... (verbose: " + verbose + ")");

        const manager = new SSManagerV3();
        await manager.init(verbose); // Ignoring the promise in this case is totally ok
    }
})();
