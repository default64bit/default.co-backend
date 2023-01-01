import { ForbiddenException, ImATeapotException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export function serverOnly(req: Request, res: Response, next: NextFunction) {
    try {
        let diff = Date.now() - parseInt(req.headers.tt.toString());
        // if (diff > 20) console.log(`diff:${diff}`);
        // if (diff > 50) throw new ImATeapotException("TT");
    } catch (e) {
        throw new ImATeapotException("TT");
    }

    if (req.headers.serversecret !== process.env.SERVER_SECRET) throw new ForbiddenException("SS");

    next();
}
