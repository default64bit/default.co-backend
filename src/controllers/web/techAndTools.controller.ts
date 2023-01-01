import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TechAndToolDocument } from "src/models/techAndTools.schema";

@Controller("tech-and-tools")
export class TechAndToolsController {
    constructor(@InjectModel("TechAndTool") private readonly TechAndToolModel: Model<TechAndToolDocument>) {}

    @Get("")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const response = {
            mostUsed: { design: [], develop: [], deploy: [] },
            other: [],
        };
        let list = await this.TechAndToolModel.find({ showInList: true }).exec();
        list.forEach((tool) => {
            const data = { img: tool.image, name: tool.name };
            if (tool.mostUsed != "off") response.mostUsed[tool.mostUsed.toString()].push(data);
            else response.other.push(data);
        });

        return res.json(response);
    }
}
