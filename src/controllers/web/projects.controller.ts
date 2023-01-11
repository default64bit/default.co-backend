import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProjectDocument } from "src/models/projects.schema";

@Controller("projects")
export class ProjectsController {
    constructor(@InjectModel("Project") private readonly ProjectModel: Model<ProjectDocument>) {}

    @Get("")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const response = [];
        let list = await this.ProjectModel.find({}).populate("tags", "name").populate("usedTech", "_id image name").exec();

        let first = true;
        list.forEach((project) => {
            response.push({
                id: project.id,
                name: project.name,
                desc: project.desc,
                text: project.text.slice(0, 60),
                tags: project.tags.map((tag) => tag["name"]),
                link: project.link || "",
                images: project.images,
                tech: project.usedTech.map((tech) => ({ img: tech["image"], name: tech["name"] })),
                active: first ? true : false,
            });
            first = false;
        });

        return res.json(response);
    }
}
