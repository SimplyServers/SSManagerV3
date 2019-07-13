import * as path from "path";
import * as fs from "fs-extra";
import {SSManagerV3} from "../SSManagerV3";

import * as Pty from "node-pty";
import * as proc from "child_process";
import {ExecOptions} from "child_process";

export class FSUtils {

    static executeCommand = async (format: string, options: ExecOptions = {}) => {
        await new Promise((resolve, reject) => {
            proc.exec(format, options,(err) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    };

    static executeCommandSeries = async (currentDirectory: string, commands: Array<string>, user: string) => {
        for (let commandIndex in commands) {
            const shell = "su";
            const params = [
                "-s",
                "/bin/bash",
                "-l",
                user,
                "-c",
                "cd " + currentDirectory + " && " + commands[commandIndex]
            ];

            await new Promise(resolve => {
                // Typings are incorrect.
                // Look at https://github.com/Microsoft/node-pty/blob/master/src/index.ts and https://github.com/Microsoft/node-pty/blob/master/typings/node-pty.d.ts
                // @ts-ignore
                const installerProcess = Pty.spawn(shell, params);
                installerProcess.on("exit", () => {
                    return resolve();
                });
            });
        }

        // await Promise.all(commands.map(async command => {

        // }));
    };

    static dirToJson = async (dataFolder: string): Promise<any> => {
        // Get all files in a directory
        const filesList = await fs.readdir(dataFolder);

        const returnArr = [];
        // Loop through files list
        await Promise.all(filesList.map(async (fileName) => {
            // Make sure the file is a json file
            if (path.extname(fileName) !== ".json") {
                return;
            }

            // Parse the data in the file as JSON
            try {
                const jsonData = await fs.readJson(path.join(dataFolder, fileName));

                // Something weird may of happened.
                if (!jsonData) {
                    SSManagerV3.instance.logger.error("Failed to load JSON to array; JSON at " + fileName + " is invalid.");
                    return;
                }

                // Append the game to the games array.
                returnArr.push(jsonData);
            } catch (e) {
                SSManagerV3.instance.logger.error("Failed to load file containing JSON: " + e);
                return;
            }
        }));

        return returnArr;
    };
}
