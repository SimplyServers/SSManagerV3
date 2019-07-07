import * as express from "express";
import * as bodyParser from "body-parser";
import * as https from "https";
import * as SocketIO from "socket.io";
import {CertUtils} from "../utils/CertUtils";
import {SSManagerV3} from "../SSManagerV3";

export class APIManager {
    get express() {
        return this._express;
    }

    set express(value) {
        this._express = value;
    }

    get http() {
        return this._http;
    }

    set http(value) {
        this._http = value;
    }

    get io() {
        return this._io;
    }

    set io(value) {
        this._io = value;
    }

    private _express;
    private _http;
    private _io;

    public prepareExpress = async () => {

    };

    public mountExpressRoutes = async () => {

    };

    public prepareSocket = async () => {

    }

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
