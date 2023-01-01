import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { readFile } from "fs/promises";
import { sign } from "jsonwebtoken";
import { Request } from "src/interfaces/Request";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";

@Injectable()
export class AuthService {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    async generateToken(req: Request, sessionId): Promise<string> {
        const payload = {
            session_id: sessionId,
            ip_addr: req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            user_agent: req.headers["user-agent"],
        };

        // TODO
        // try JWE fron node-jose package

        const privateKey: any = {
            key: await readFile(`./storage/private/private_key.pem`, { encoding: "utf8" }).catch((e) => ""),
            passphrase: process.env.PRIVATE_KET_PASS,
        };

        return sign(payload, privateKey, { algorithm: "RS512" });
    }

    async createSession(req: Request) {
        const session = await this.SessionModel.create({
            userAgent: req.headers["user-agent"],
            ip: req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            expireAt: new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE_TIME) * 1000),
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        });
        return session;
    }

    async getSession(req: Request) {
        const session = await this.SessionModel.findOne({
            _id: req.session.id,
            userAgent: req.headers["user-agent"],
            ip: req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
        });
        return session;
    }

    async updateSession(req: Request) {
        const session = await this.SessionModel.updateOne(
            {
                _id: req.session.id,
                userAgent: req.headers["user-agent"],
                ip: req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
            },
            { expireAt: new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE_TIME) * 1000), updatedAt: new Date(Date.now()) },
            { upsert: true },
        );

        let sessionId = session.matchedCount > 0 ? req.session.id : session.upsertedId;
        return sessionId;
    }
}
