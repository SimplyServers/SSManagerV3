import * as devNull from "dev-null";
import * as Dockerode from "dockerode";
import * as DockerodeUtils from "dockerode-utils";
import * as path from "path";
import {SSManagerV3} from "../SSManagerV3";

export class DockerUtils {

    private readonly dockerController;

    constructor() {
        this.dockerController = new Dockerode({
            socketPath: SSManagerV3.instance.config.dockerSocket
        });
    }

    public bootstrap = async (): Promise<void> => {
        if (!(await DockerodeUtils.imageExists(this.dockerController, "ssjava"))) {
            await this.addImage(path.join(SSManagerV3.instance.root, "../docker_templates/java_generic/"), "java_generic");
        }
    };

    private addImage = async (filePath: string, name: string): Promise<void> => {
        SSManagerV3.instance.logger.verbose("Adding Docker image for " + name + "... this may take some time!");

        await new Promise((resolve, reject) => {
            this.dockerController.buildImage({
                context: filePath,
                src: ['Dockerfile']
            }, {t: name}, (err, stream) => {
                if (err) {
                    return reject(err);
                }

                // Pipe the stream to its doom!
                stream.pipe(devNull(), {end: true});

                // Return when its done installing
                stream.on('end', () => {
                    return resolve();
                });
            });
        });
    }
}
