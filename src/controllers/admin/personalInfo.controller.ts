import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { readFile, writeFile } from "fs/promises";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";
import { UpdateStatusRequestDto, UpdateSocialsRequestDto } from "src/dto/personalInfo.dto";

@Controller("admin/personal-info")
export class PersonalInfoController {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    @Get("")
    async readPersonalInfo(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/personal_info.json").then((data) => data);
        const personalInfo = JSON.parse(rawdata.toString());

        return res.json(personalInfo);
    }

    @Post("update-status")
    async updateStatus(@Body() input: UpdateStatusRequestDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/personal_info.json").then((data) => data);
        const personalInfo = JSON.parse(rawdata.toString());

        personalInfo.work_status = input.state == "true" ? "open" : "close";
        await writeFile("./static/personal_info.json", JSON.stringify(personalInfo));

        return res.json({});
    }

    @Post("update-socials")
    async updateSocials(@Body() input: UpdateSocialsRequestDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/personal_info.json").then((data) => data);
        const personalInfo = JSON.parse(rawdata.toString());

        personalInfo.email = input.email;
        personalInfo.socials.telegram = input.telegram ? input.telegram : "";
        personalInfo.socials.linkedin = input.linkedin ? input.linkedin : "";
        personalInfo.socials.dribbble = input.dribbble ? input.dribbble : "";
        personalInfo.socials.github = input.github ? input.github : "";
        await writeFile("./static/personal_info.json", JSON.stringify(personalInfo));

        return res.json({});
    }
}
