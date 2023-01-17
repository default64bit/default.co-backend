import { ForbiddenException, Injectable, NestMiddleware, Req, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { readFile } from "fs/promises";
import { Response, NextFunction } from "express";
import { Request } from "src/interfaces/Request";
import { verify } from "jsonwebtoken";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";

/*
    Making sure the user is logged in
*/
@Injectable()
export class AuthCheckMiddleware implements NestMiddleware {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    async use(req: Request, res: Response, next: NextFunction) {
        let token = "";
        if (req.headers["authtoken"]) token = req.headers["authtoken"].toString();
        if (req.cookies["AuthToken"]) token = req.cookies["AuthToken"].toString();

        if (!token || token === null || token === "") throw new UnauthorizedException(-1);

        const publicKey = await readFile(`./storage/private/public_key.pem`, { encoding: "utf8" }).catch((e) => "");
        const payload = verify(token, publicKey, { algorithms: ["RS512"] });

        if (typeof payload["session_id"] === "undefined") throw new UnauthorizedException(-2);
        // get the session
        const session = await this.SessionModel.findOne({ _id: payload["session_id"] });
        if (!session) throw new UnauthorizedException(-3);

        // TODO
        // check the request user-agent and ip with the session record and payload

        // check if session is expired
        if (payload["iat"] * 1000 < Date.now() - parseInt(process.env.SESSION_EXPIRE_TIME) * 1000) throw new UnauthorizedException(-4);

        req.session = { payload, id: session.id };

        return next();

        throw new UnauthorizedException(-5);
    }
}

/*
    Making sure no user is logged in
*/
@Injectable()
export class GuestMiddleware implements NestMiddleware {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    async use(req: Request, res: Response, next: NextFunction) {
        let token = "";
        if (req.headers["authtoken"]) token = req.headers["authtoken"].toString();
        if (req.cookies["AuthToken"]) token = req.cookies["AuthToken"].toString();

        if (token === null || token === "") return next();

        const publicKey = await readFile(`./storage/private/public_key.pem`, { encoding: "utf8" }).catch((e) => "");
        const payload = verify(token, publicKey, { algorithms: ["RS512"] });

        if (typeof payload["session_id"] === "undefined") return next();

        // get the session
        const session = await this.SessionModel.findOne({ _id: payload["session_id"] });
        if (!session) return next();

        // check if session is expired
        if (payload["iat"] * 1000 < Date.now() - parseInt(process.env.SESSION_EXPIRE_TIME) * 1000) return next();

        throw new ForbiddenException();
    }
}
