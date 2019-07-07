import {Helper} from "./Helper";
import {Gameserver, ServerStatus} from "../Gameserver";

import * as Dockerode from "dockerode";
import * as userid from "userid";
import * as Tail from "tail";
import {SSManagerV3} from "../../../SSManagerV3";

export class DockerHelper extends Helper {
    private shellStream;
    private stdinSteam;
    private loggerStream;
    private dockerContainer;
    private dockerController;

    constructor(parent: Gameserver) {
        super(parent);

        this.dockerController = new Dockerode({
            socketPath: SSManagerV3.instance.config.dockerSocket
        });

        this.dockerContainer = this.dockerController.getContainer(this.parentServer.id);
    }

    // General stuff

    public killContainer = async () => {
        SSManagerV3.instance.logger.verbose("sending kill to dockerode");
        await this.dockerContainer.kill();
    };

    public ensureStopped = async (): Promise<boolean> => {
        SSManagerV3.instance.logger.verbose("ensuring stopped");

        const data = await this.dockerContainer.inspect();
        if (data.State.Status === "running") {
            SSManagerV3.instance.logger.verbose("seems like server is running, killing the boi");
            this.parentServer.status = ServerStatus.MGTHALT;
            await this.killContainer();
            return true;
        }
        return false;
    };

    public rebuild = async () => {
        await this.remove();
        await this.create();
    };

    public remove = async () => {
        this.dockerContainer.remove();
    };

    public create = async () => {
        SSManagerV3.instance.logger.verbose("Starting docker configure");
        let image;
        if (this.parentServer.game.dockerType === "java_generic") {
            image = "java_generic";
        } else {
            throw new Error("DOCKET_IMAGE_INVALID");
        }

        const newContainer = {
            Image: image,
            name: this.parentServer.id,
            User: String(userid.uid(this.parentServer.id)), // Fix Docker user issue
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            Tty: true,
            ExposedPorts: {}, // Fill this in later
            HostConfig: {
                PortBindings: {}, // Fill this in later
                Mounts: [
                    {
                        Target: "/home/container",
                        Source: this.parentServer.fsHelper.getRoot(),
                        Type: "bind",
                        ReadOnly: false
                    },
                    {
                        Target: "/opt/ss-static",
                        Source: "/opt/ss-static",
                        Type: "bind",
                        ReadOnly: true
                    }

                ],
                Tmpfs: {
                    "/tmp": "rw,exec,nosuid,size=50M"
                },
                Memory: Math.round(this.parentServer.build.mem * 1000000),
                MemoryReservation: Math.round(this.parentServer.build.mem * 1000000),
                MemorySwap: -1,
                CpuQuota: (this.parentServer.build.cpu > 0) ? this.parentServer.build.cpu * 1000 : -1,
                CpuPeriod: 100000,
                CpuShares: 1024,
                BlkioWeight: this.parentServer.build.io,
                Dns: ["8.8.8.8", "8.8.4.4"],
                LogConfig: {
                    Type: "json-file",
                    Config: {
                        "max-size": "5m",
                        "max-file": "1"
                    }
                },
                SecurityOpt: ["no-new-privileges"],
                ReadonlyRootfs: true,
                CapDrop: [
                    "setpcap", "mknod", "audit_write", "net_raw", "dac_override",
                    "fowner", "fsetid", "net_bind_service", "sys_chroot", "setfcap"
                ],
                OomKillDisable: false
            }
        };

        // Fill in exposed ports
        newContainer.ExposedPorts[this.parentServer.port + "/tcp"] = {};
        newContainer.ExposedPorts[this.parentServer.port + "/udp"] = {};
        // Fill in port bindings
        newContainer.HostConfig.PortBindings[this.parentServer.port + "/tcp"] = [{
            "HostPort": this.parentServer.port.toString()
        }];
        newContainer.HostConfig.PortBindings[this.parentServer.port + "/udp"] = [{
            "HostPort": this.parentServer.port.toString()
        }];

        SSManagerV3.instance.logger.verbose("sending create");

        await this.dockerController.createContainer(newContainer);
    };

    public updateContainer = async () => {
        await this.dockerContainer.update({
            BlkioWeight: this.parentServer.build.io,
            CpuQuota: (this.parentServer.build.cpu > 0) ? this.parentServer.build.cpu * 1000 : -1,
            CpuPeriod: 100000,
            CpuShares: 1024,
            Memory: Math.round(this.parentServer.build.mem * 1000000),
            MemoryReservation: Math.round(this.parentServer.build.mem * 1000000),
            MemorySwap: -1

        });
    };

    public start = async () => {
        await this.ensureStopped();

        // Get our container up and running
        await this.dockerContainer.start();

        // Build the command we're going to use to load the game server
        let startCmd = this.parentServer.game.startCommand.replace(new RegExp("{memory}", "g"), String(this.parentServer.build.mem)); // Server memory
        startCmd = startCmd.replace(new RegExp("{port}", "g"), String(this.parentServer.port)); // Server port
        startCmd = startCmd.replace(new RegExp("{players}", "g"), String(this.parentServer.maxPlayers)); // Server port

        // Docker start commands
        const dockerOptions = {
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Tty": true,
            "OpenStdin": true,
            "StdinOnce": false,
            Cmd: ["/bin/bash", "-c", startCmd]
        };
        // Execute commands on container
        const exec = await this.dockerContainer.exec(dockerOptions);
        // Get the stream created by the process
        this.stdinSteam = (await exec.start({stream: true, stdout: true, stderr: true, stdin: true})).output;
        this.stdinSteam.setEncoding("utf8");

        await this.initContainerShell();
        await this.initFileLog();

        this.stdinSteam.on("end", () => {
            SSManagerV3.instance.logger.verbose("this isn't supposed to do it");
            this.killContainer(); // The container stopped
        });
    };

    // Logging

    public writeToProcess = (data: string) => {
        if (!this.stdinSteam) {
            return;
        }
        this.stdinSteam.pause();
        this.stdinSteam.write(data + "\n"); // New line is very critical. It cost me like an hour of debugging
        this.stdinSteam.resume();
    };

    public initFileLog = async () => {
        if (this.parentServer.game.logging.logFile.useLogFile) {
            let hadLogError = false;

            // Get the log file specified
            const filePath = this.parentServer.game.logging.logFile.path;

            // We need to make sure these files exist for logging
            await this.parentServer.fsHelper.ensureFile(filePath);
            await this.parentServer.fsHelper.truncateFile(filePath);

            SSManagerV3.instance.logger.verbose("watching file: " + filePath);

            this.loggerStream = new Tail.Tail(this.parentServer.fsHelper.extendPath(filePath));
            this.loggerStream.on("line", this.parentServer.logConsole);
            this.loggerStream.on("error", () => {
                if (!hadLogError) {
                    hadLogError = true;
                    this.parentServer.logAnnounce("Failed to find log file for server. You may need to restart to see log messages again.");
                }
            });
        }
    };

    private closeStreams = () => {
        if (this.loggerStream) {
            this.loggerStream.unwatch();
        }
        this.loggerStream = undefined;

        if (this.shellStream) {
            this.shellStream._output.removeAllListeners();
        }

        this.shellStream = undefined;

        if (this.stdinSteam) {
            this.stdinSteam.removeAllListeners();
        }

        this.stdinSteam = undefined;
    };

    public initContainerShell = async () => {
        this.shellStream = await this.dockerContainer.attach({
            "Detach": false,
            "Tty": false,
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true
        });

        // This is always enabled
        this.shellStream._output.on("end", () => { // I don't care that its supposed to be private I want it
            this.closeStreams();
            this.parentServer.status = ServerStatus.STOPPED;
        }).on("error", data => {
            this.parentServer.logAnnounce("Your servers container encountered an error; " + data);
        });

        // Only enabled if specified
        // TODO: this might be brolken
        if (this.parentServer.game.logging.useStdout) {
            this.shellStream.on("data", this.parentServer.logConsole);
        }
    };

}
