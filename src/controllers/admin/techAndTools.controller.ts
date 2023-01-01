import { Body, Controller, Get, Post, Put, Delete, Req, Res, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common";
import { ForbiddenException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as sharp from "sharp";
import { randomUUID } from "crypto";
import { TechAndToolDocument } from "src/models/techAndTools.schema";
import { CreateNewToolDto, EditToolDto } from "src/dto/techAndTools.dto";
import { unlink } from "fs/promises";

@Controller("admin/tech-and-tools")
export class TechAndToolsController {
    constructor(@InjectModel("TechAndTool") private readonly TechAndToolModel: Model<TechAndToolDocument>) {}

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const lastRecordID = req.query.lastRecordID;
        const search = req.query.search ? req.query.search.toString() : "";
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let query = {};
        if (!!lastRecordID) query = { _id: { $lt: new Types.ObjectId(lastRecordID.toString()) }, ...query };

        // making the model with query
        let data = this.TechAndToolModel.aggregate();
        data.sort(sort);
        data.match(query);
        data.match({
            $or: [{ name: { $regex: new RegExp(`.*${search}.*`, "i") } }],
        });
        data.limit(pp);
        data.project({ _id: 1, image: 1, name: 1, mostUsed: 1, showInList: 1 });

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
        const record = await this.TechAndToolModel.findOne({ _id: req.params.id }).select("_id image name mostUsed showInList").exec();
        if (!record) throw new NotFoundException([{ property: "delete", errors: ["Record not found!"] }]);

        return res.json({ record });
    }

    @Post("/")
    @UseInterceptors(FileInterceptor("file"))
    async addRecord(
        @UploadedFile() file: Express.Multer.File,
        @Body() input: CreateNewToolDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        if (!file) throw new UnprocessableEntityException([{ property: "image", errors: ["Select an image file!"] }]);

        const ogName = file.originalname;
        const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

        // check file size : less than 1MB
        if (file.size > 1_048_576) throw new UnprocessableEntityException([{ property: "image", errors: ["Image must be less than 1MB"] }]);
        // check file format
        const isMimeOk = extension == "png" || extension == "jpeg" || extension == "jpg";
        if (!isMimeOk) throw new UnprocessableEntityException([{ property: "image", errors: ["Image format is not supported!"] }]);

        const randName = randomUUID();
        const img = sharp(file.buffer);

        img.resize(60);
        const url = `storage/public/tech_and_tools_images/${randName}.${extension}`;
        await img.toFile(url).catch((e) => console.log(e));
        const imageLink = url.replace("storage/public/", "/file/");

        const record = await this.TechAndToolModel.create({
            image: imageLink,
            name: input.name,
            mostUsed: input.mostUsed,
            showInList: input.showInList == "true" ? true : false,
            createdAt: new Date(Date.now()),
        });

        return res.json({ record });
    }

    @Put("/:id")
    @UseInterceptors(FileInterceptor("file"))
    async editRecord(@UploadedFile() file: Express.Multer.File, @Body() input: EditToolDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const record = await this.TechAndToolModel.findOne({ _id: req.params.id }).exec();
        if (!record) throw new NotFoundException([{ property: "id", errors: ["Record not found!"] }]);

        let imageLink = record.image;
        if (!!file) {
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            // check file size : less than 1MB
            if (file.size > 1_048_576) throw new UnprocessableEntityException([{ property: "image", errors: ["Image must be less than 1MB"] }]);
            // check file format
            const isMimeOk = extension == "png" || extension == "jpeg" || extension == "jpg";
            if (!isMimeOk) throw new UnprocessableEntityException([{ property: "image", errors: ["Image format is not supported!"] }]);

            const randName = randomUUID();
            const img = sharp(file.buffer);

            img.resize(60);
            const url = `storage/public/tech_and_tools_images/${randName}.${extension}`;
            await img.toFile(url).catch((e) => console.log(e));
            imageLink = url.replace("storage/public/", "/file/");

            await unlink(record.image.replace("/file/", "storage/public/")).catch((e) => {});
        }

        await this.TechAndToolModel.updateOne(
            { _id: req.params.id },
            {
                image: imageLink,
                name: input.name,
                mostUsed: input.mostUsed,
                showInList: input.showInList == "true" ? true : false,
            },
        );

        const editedRecord = await this.TechAndToolModel.findOne({ _id: req.params.id }).select("_id image name mostUsed showInList").exec();

        return res.json({ record: editedRecord });
    }

    @Delete("/:id")
    async deleteSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const record = await this.TechAndToolModel.findOne({ _id: req.params.id }).exec();
        if (!record) throw new NotFoundException([{ property: "delete", errors: ["Record not found!"] }]);

        // delete record's image from disk
        await unlink(record.image.replace("/file/", "storage/public/")).catch((e) => {});

        // delete the course
        await this.TechAndToolModel.deleteOne({ _id: req.params.id }).exec();

        return res.end();
    }
}
