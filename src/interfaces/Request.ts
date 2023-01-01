import { Request as Req } from "express";
import { JwtPayload } from "jsonwebtoken";

interface session {
    payload: string | JwtPayload;
    id: any;
}

export interface Request extends Req {
    session?: session;
}
