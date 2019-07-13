import {SSManagerV3} from "../../../SSManagerV3";

export class SecretMiddleware {
    public static requireSecret = async (req, res, next) => {
        if (!req.headers.authorization) {
            return next(new Error("NO_TOKEN"));
        }

        if (SecretMiddleware.getTokenFromHeaders(req) !== SSManagerV3.instance.config.api.secret) {
            return next(new Error("BAD_TOKEN"));
        }

        next();
    };

    private static getTokenFromHeaders = (req) => {
        const {headers: {authorization}} = req;
        if (authorization && authorization.split(" ")[0] === "Token") {
            return authorization.split(" ")[1];
        }
        return null;
    };
}
