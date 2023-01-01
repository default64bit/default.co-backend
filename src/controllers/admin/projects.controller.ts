import { Body, Controller, Get, Post, Put, Delete, Req, Res, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { ForbiddenException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as sharp from "sharp";
import { randomUUID } from "crypto";
import { ProjectDocument } from "src/models/Projects.schema";
import { CreateNewProjectDto, EditProjectDto } from "src/dto/projects.dto";
import { unlink } from "fs/promises";
import { TagsService } from "src/services/tags.service";
import { TagDocument } from "src/models/tags.schema";

@Controller("admin/projects")
export class ProjectsController {
    constructor(
        private readonly TagsService: TagsService,
        @InjectModel("Project") private readonly ProjectModel: Model<ProjectDocument>,
        @InjectModel("Tag") private readonly TagModel: Model<TagDocument>,
    ) {}

    @Get("/views-list")
    async getViewsList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const records = await this.ProjectModel.find({}, { images: 1, name: 1, desc: 1, views: 1 }).exec();
        return res.json({ records });
    }

    // =====================================================

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const lastRecordID = req.query.lastRecordID;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let query = {};
        if (!!lastRecordID) query = { _id: { $lt: new Types.ObjectId(lastRecordID.toString()) }, ...query };

        // making the model with query
        let data = this.ProjectModel.aggregate();
        data.sort(sort);
        data.match(query);
        data.limit(pp);
        data.lookup({ from: "tags", localField: "tags", foreignField: "_id", as: "tags" });
        data.project({ _id: 1, images: 1, name: 1, desc: 1, "tags.name": 1 });

        // executing query and getting the results
        let error = false;
        const results: any = await data.exec().catch((e) => (error = true));
        if (error) throw new InternalServerErrorException();

        return res.json({
            records: results,
            pp: pp,
        });
    }

    @Get("/:id")
    async getSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const record = await this.ProjectModel.findOne({ _id: req.params.id }).populate("tags", "name").populate("usedTech", "_id image name").exec();
        if (!record) throw new NotFoundException([{ property: "id", errors: ["Record not found!"] }]);

        return res.json({ record });
    }

    @Post("/")
    @UseInterceptors(FilesInterceptor("images"))
    async addRecord(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() input: CreateNewProjectDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        if (!files[0]) throw new UnprocessableEntityException([{ property: "images", errors: ["Select at least one image!"] }]);

        files.forEach((file) => {
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            // check file size : less than 2MB
            if (file.size > 2_097_152) throw new UnprocessableEntityException([{ property: "images", errors: ["Images must be less than 2MB"] }]);
            // check file format
            const isMimeOk = extension == "png" || extension == "jpeg" || extension == "jpg" || extension == "webp";
            if (!isMimeOk) throw new UnprocessableEntityException([{ property: "images", errors: ["Image format is not supported!"] }]);
        });

        const imageLinks = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            const randName = randomUUID();
            const img = sharp(file.buffer);
            img.resize(1024);
            const url = `storage/public/project_images/${randName}.${extension}`;
            await img.toFile(url).catch((e) => console.log(e));
            imageLinks.push(url.replace("storage/public/", "/file/"));
        }

        const record = await this.ProjectModel.create({
            images: imageLinks,
            name: input.name,
            desc: input.desc,
            text: input.text,
            tags: await this.TagsService.getTagIds(JSON.parse(input.tags)),
            link: input.link || null,
            usedTech: JSON.parse(input.tech) || [],
            views: 0,
            createdAt: new Date(Date.now()),
        });

        return res.json({ id: record.id });
    }

    @Put("/:id")
    @UseInterceptors(FilesInterceptor("images"))
    async editRecord(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() input: EditProjectDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const record = await this.ProjectModel.findOne({ _id: req.params.id }).exec();
        if (!record) throw new NotFoundException([{ property: "id", errors: ["Record not found!"] }]);

        const newImageList = JSON.parse(input.imagesList);
        if (newImageList.length == 0) throw new UnprocessableEntityException([{ property: "images", errors: ["Select at least one image!"] }]);

        files.forEach((file) => {
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            // check file size : less than 2MB
            if (file.size > 2_097_152) throw new UnprocessableEntityException([{ property: "images", errors: ["Images must be less than 2MB"] }]);
            // check file format
            const isMimeOk = extension == "png" || extension == "jpeg" || extension == "jpg" || extension == "webp";
            if (!isMimeOk) throw new UnprocessableEntityException([{ property: "images", errors: ["Image format is not supported!"] }]);
        });

        const oldImageList = record.images;
        const imageLinks = [];
        for (let i = 0; i < newImageList.length; i++) {
            const item = newImageList[i];
            if (item.file == -1) {
                let index = -1;
                if (-1 !== (index = oldImageList.indexOf(item.blob))) oldImageList.splice(index, 1);
                // keep untouched images
                imageLinks.push(item.blob);
            } else {
                // upload newly added images
                const file = files[item.file];
                const ogName = file.originalname;
                const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
                const randName = randomUUID();
                const img = sharp(file.buffer);
                img.resize(1024);
                const url = `storage/public/project_images/${randName}.${extension}`;
                await img.toFile(url).catch((e) => console.log(e));
                imageLinks.push(url.replace("storage/public/", "/file/"));
            }
        }

        // delete unwanted images
        for (let i = 0; i < oldImageList.length; i++) {
            const link = oldImageList[i];
            await unlink(link.replace("/file/", "storage/public/")).catch((e) => {});
        }

        await this.ProjectModel.updateOne(
            { _id: req.params.id },
            {
                images: imageLinks,
                name: input.name,
                desc: input.desc,
                text: input.text,
                tags: await this.TagsService.getTagIds(JSON.parse(input.tags)),
                link: input.link || null,
                usedTech: JSON.parse(input.tech) || [],
            },
        );

        return res.end();
    }

    @Delete("/:id")
    async deleteSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const record = await this.ProjectModel.findOne({ _id: req.params.id }).exec();
        if (!record) throw new NotFoundException([{ property: "delete", errors: ["Record not found!"] }]);

        // delete record's image from disk
        record.images.forEach(async (image) => await unlink(image.replace("/file/", "storage/public/")).catch((e) => {}));
        // delete the course
        await this.ProjectModel.deleteOne({ _id: req.params.id }).exec();

        return res.end();
    }
}
