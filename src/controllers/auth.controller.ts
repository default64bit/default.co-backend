import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnauthorizedException, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { AuthService } from "src/services/auth.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService, @InjectModel("Session") private readonly UserModel: Model<SessionDocument>) {}

    @Post("login")
    async login(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        throw new ForbiddenException([{ property: "", errors: ["Can't Login Mate!"] }]);
        // create a session
        const sessionId = await this.authService.getSession(req);
        // generate token
        const token = this.authService.generateToken(req, sessionId);
        return res.json({ token });
    }

    @Post("continue-with-google")
    async continueWithGoogle(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        if (!req.body.profile) throw new ForbiddenException();
        const profile = req.body.profile;
        const email = req.body.email;

        if (email !== process.env.MY_EMAIL) throw new ForbiddenException();

        // generate token and session
        const session = await this.authService.createSession(req);
        const token = await this.authService.generateToken(req, session.id);
        if (!token) throw new ForbiddenException();

        return res.json({ token });
    }

    @Post("refresh")
    async refresh(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // update the session and generate new token
        console.log({ step: 1 });
        const sessionId = await this.authService.updateSession(req);
        console.log({ step: 2, sessionId });
        const token = await this.authService.generateToken(req, sessionId);
        console.log({ step: 3, token });
        if (!token) throw new ForbiddenException();

        return res.json({ token });
    }
}
