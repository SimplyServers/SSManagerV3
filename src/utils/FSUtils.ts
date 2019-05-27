import * as path from "path";
import * as fs from "fs-extra";
import {SSManagerV3} from "../SSManagerV3";

import * as Pty from "node-pty";

export class FSUtils {

    static executeCommandSeries = async (currentDirectory: string, commands: Array<string>, user: string) => {
        await Promise.all(commands.map(async (command) => {
            const shell = "su";
            const params = [
                "-s",
                "/bin/bash",
                "-l",
                user,
                "-c",
                "cd " + currentDirectory + " && " + command
            ];

            await new Promise(resolve => {
                // Typings are incorrect.
                // Look at https://github.com/Microsoft/node-pty/blob/master/src/index.ts and https://github.com/Microsoft/node-pty/blob/master/typings/node-pty.d.ts
                // @ts-ignore
                const installerProcess = Pty.spawn(shell, params);
                installerProcess.on("exit", () => {
                    return resolve();
                });
            })
        }));
    };

    static dirToJson = async (dataFolder: string): Promise<any> => {
        // Get all files in a directory
        const filesList = await fs.readdir(dataFolder);

        const returnArr = [];

        // Loop through files list
        await Promise.all(filesList.map(async (fileName) => {
            // Check if the file is the .gitkeep file
            if (fileName === ".gitkeep") {
                return;
            }

            // Parse the data in the file as JSON
            const jsonData = await fs.readJson(path.join(dataFolder, fileName));

            // Something weird may of happened.
            if (jsonData === undefined) {
                SSManagerV3.instance.logger.error("Failed to load JSON to array; JSON at " + fileName + " is invalid.");
                return;
            }

            // For debugging
            // TODO: remove
            SSManagerV3.instance.logger.verbose("Loaded: " + fileName);

            // Append the game to the games array.
            returnArr.push(jsonData);
        }));

        return returnArr;
    };
}
