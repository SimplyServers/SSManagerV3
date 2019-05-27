import * as path from "path";
import * as fs from "fs-extra";
import {SSManagerV3} from "../SSManagerV3";

export class FSUtils {
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
