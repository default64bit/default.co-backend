import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { readFile } from "fs/promises";

@Controller("info")
export class InfoController {
    constructor() {}

    @Get("")
    async getInfo(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/personal_info.json").then((data) => data);
        const personalInfo = JSON.parse(rawdata.toString());
        return res.json(personalInfo);
    }
}
