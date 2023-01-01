import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";

@Controller("admin")
export class AdminController {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    @Get("check")
    async check(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // this route is protected by auth middleware
        // we don't need to do anything here really
        return res.json({});
    }
}
