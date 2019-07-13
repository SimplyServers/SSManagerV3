import * as Express from "express";
import {Router} from "express";
import * as bodyParser from "body-parser";
import * as https from "https";
import * as SocketIO from "socket.io";

import {CertUtils} from "../utils/CertUtils";
import {SSManagerV3} from "../SSManagerV3";
import {GameController} from "./rest/controllers/GameController";
import {GameserverController} from "./rest/controllers/GameserverController";
import {NodeController} from "./rest/controllers/NodeController";
import {PluginController} from "./rest/controllers/PluginController";
import {ServerConsole} from "./socket/ServerConsole";

export class APIManager {
    get express() {
        return this._express;
    }

    set express(value) {
        this._express = value;
    }

    get http(): https.Server {
        return this._http;
    }

    set http(value: https.Server) {
        this._http = value;
    }

    get io(): SocketIO.Server {
        return this._io;
    }

    set io(value: SocketIO.Server) {
        this._io = value;
    }

    private _express: Express.Express;
    private _http: https.Server;
    private _io: SocketIO.Server;

    public prepareExpress = async () => {
        this.express = Express();

        this.express.disable("x-powered-by");
        this.express.use((req, res, next) => {
            res.header("X-Made-By", "Alec Dusheck, Sam Martin");
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requeted-With, Content-Type, Accept, Authorization, RBR"
            );
            if (req.headers.origin) {
                res.header("Access-Control-Allow-Origin", req.headers.origin.toString());
            }
            if (req.method === "OPTIONS") {
                res.header(
                    "Access-Control-Allow-Methods",
                    "GET, POST, PUT, PATCH, DELETE"
                );
                return res.status(200).json({});
            }
            next();
        });

        // Body Parser
        this.express.use(bodyParser.urlencoded({extended: false})); // Allow Express to handle json in bodies
        this.express.use(bodyParser.json()); //

        this.mountExpressRoutes();

        // Error handling
        this._express.use((err, req, res, next) => {
            console.log("got error");
            console.log(err);
            res.status(500).json({error: true, message: err.message});
        });
    };

    public mountExpressRoutes = () => {
        const apiRouter = Router();

        const gameController = new GameController();
        gameController.initRoutes(apiRouter);

        const gameserverController = new GameserverController();
        gameserverController.initRoutes(apiRouter);

        const nodeController = new NodeController();
        nodeController.initRoutes(apiRouter);

        const pluginController = new PluginController();
        pluginController.initRoutes(apiRouter);

        this.express.use("/api/v1/", apiRouter);
    };

    public prepareSocket = async () => {
        const console = new ServerConsole(this.io.of("/console"));
        console.init();
    };

    public loadServer = async () => {
        await this.prepareExpress();

        const certManager = new CertUtils(); // Make sure the https certificates are there and valid
        await certManager.ensureCerts();

        this._http = https.createServer(await certManager.getOptions(), this._express);
        this._io = SocketIO(this._http, {
            path: "/s/"
        });

        await this.prepareSocket();

        this._http.listen(SSManagerV3.instance.config.api.port);
    };


}
