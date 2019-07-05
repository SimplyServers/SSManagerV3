import {Helper} from "./Helper";
import {Gameserver} from "../Gameserver";
import * as fs from "fs-extra";
import * as path from "path";
import * as querystring from "querystring";
import * as userid from "userid";


export class FilesystemHelper extends Helper{

    public static readonly MAX_FILE_SIZE = 1000000;

    public static checkEdible = (fullPath: string): boolean => {
        const ext = path.extname(fullPath);
        return (ext === ".txt" || ext === ".properties" || ext === ".nbt" || ext === ".yaml" || ext === ".json" || ext === ".yml" || ext === ".log");
    };

    constructor(server: Gameserver) {
        super(server);
    }

    public getDirectoryContents = async (relativePath: string) => {
        if (this.parentServer.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if(this.checkBlocked(relativePath)) {
            throw new Error("FILE_BLOCKED");
        }

        const fullPath = this.extendPath(relativePath);
        const fileList = await fs.readdir(fullPath);

        // Loop thru each file in an async style and return data about the file
        return await Promise.all(fileList.map(async (file) => {
            if(this.checkBlocked(file)) return; // Make sure the file isn't supposed to be hidden

            const stat = await fs.stat(file);

            return {
                name: file,
                created: new Date(stat.ctime).toLocaleString(),
                modified: new Date(stat.mtime).toLocaleString(),
                size: stat.size,
                symlink: stat.isSymbolicLink(),
                isDir: stat.isDirectory(),
                isFile: stat.isFile(),
                edible: stat.isFile() && !(stat.size > FilesystemHelper.MAX_FILE_SIZE) && FilesystemHelper.checkEdible(file) // Make sure the file is edible
            };
        }))
    };

    public getFileContents = async (relativePath: string) => {
        if (this.parentServer.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if(this.checkBlocked(relativePath)) {
            throw new Error("FILE_BLOCKED");
        }

        const fullPath = this.extendPath(relativePath);
        const stat = await fs.stat(fullPath);

        if (!stat.isFile() || stat.size > FilesystemHelper.MAX_FILE_SIZE) {
            throw new Error("NOT_A_FILE");
        }

        return await fs.readFile(fullPath, "utf8"); // Make sure we read the file as utf8!
    };

    public writeFile = async (relativePath: string, contents: string) => {
        if (this.parentServer.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if(this.checkBlocked(relativePath)) {
            throw new Error("FILE_BLOCKED");
        }

        const fullPath = this.extendPath(relativePath);

        if(!FilesystemHelper.checkEdible(fullPath)){
            throw new Error("FILE_NOT_EDIBLE");
        }

        await fs.outputFile(fullPath, contents);
        await fs.chown(fullPath, userid.uid(this.parentServer.id), userid.gid(this.parentServer.id));
    };

    public removeFile = async (relativePath: string) => {
        if (this.parentServer.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if(this.checkBlocked(relativePath)) {
            throw new Error("FILE_BLOCKED");
        }

        const fullPath = this.extendPath(relativePath);

        await fs.unlink(fullPath);
    };

    public removeFolder = async (relativePath: string) => {
        if (this.parentServer.isBlocked) {
            throw new Error("SERVER_LOCKED")
        }

        if(this.checkBlocked(relativePath)) {
            throw new Error("FILE_BLOCKED");
        }

        const fullPath = this.extendPath(relativePath);

        await fs.rmdir(fullPath);
    };

    public ensureFile = async (relativePath: string) => {
        const fullPath = this.extendPath(relativePath);

        await fs.ensureFile(fullPath);
        await fs.chown(fullPath, userid.uid(this.parentServer.id), userid.gid(this.parentServer.id));

    };

    public truncateFile = async (partialPath: string) => {
        const filePath = this.extendPath(partialPath);

        await fs.truncate(filePath, 0);
        await fs.chown(filePath, userid.uid(this.parentServer.id), userid.gid(this.parentServer.id));
    };

    public checkBlocked = (fullPath): boolean => {
        if (fullPath === path.join("/home", this.parentServer.id, "/public/identity.json")) {
            return true;
        }
        return this.parentServer.game.logging.logFile.useLogFile && fullPath === path.join("/home", this.parentServer.id, "/public", this.parentServer.game.logging.logFile.path);
    };

    public getRoot = (): string => {
        return path.join("/home/", this.parentServer.id, "/public/");
    };

    public extendPath = (partialPath: string): string => {
        const fullPath = path.join(this.getRoot(), path.normalize(querystring.unescape(partialPath)));
        if (fullPath.indexOf(path.join("/home/", this.parentServer.id, "/public")) !== 0) {
            return this.getRoot();
        }
        return fullPath;
    };
}
