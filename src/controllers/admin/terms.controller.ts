import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { readFile, writeFile } from "fs/promises";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";
import { UpdateTermsTextRequestDto } from "src/dto/terms.dto";

@Controller("admin/terms")
export class TermsController {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    @Get("")
    async readPersonalInfo(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/terms_and_conditions.json").then((data) => data);
        const terms = JSON.parse(rawdata.toString());

        return res.json(terms);
    }

    @Post("update")
    async updateTermsText(@Body() input: UpdateTermsTextRequestDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const rawdata = await readFile("./static/terms_and_conditions.json").then((data) => data);
        const terms = JSON.parse(rawdata.toString());

        terms.text = input.text;
        await writeFile("./static/terms_and_conditions.json", JSON.stringify(terms));

        return res.json({});
    }
}
