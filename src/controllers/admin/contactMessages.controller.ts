import { Body, Controller, Get, Post, Delete, Req, Res, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ContactMessageDocument } from "src/models/contactMessages.schema";

@Controller("admin/contact-messages")
export class ContactMessagesController {
    constructor(@InjectModel("ContactMessage") private readonly ContactMessageModel: Model<ContactMessageDocument>) {}

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const lastRecordID = req.query.lastRecordID;
        const search = req.query.search ? req.query.search.toString() : "";
        const type = req.query.type && ["read", "new"].includes(req.query.type.toString()) ? req.query.type.toString() : "";
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let query = {};
        if (type != "") query = { status: type, ...query };
        if (!!lastRecordID) query = { _id: { $lt: new Types.ObjectId(lastRecordID.toString()) }, ...query };

        // making the model with query
        let data = this.ContactMessageModel.aggregate();
        data.sort(sort);
        data.match(query);
        data.match({
            $or: [
                { name: { $regex: new RegExp(`.*${search}.*`, "i") } },
                { email: { $regex: new RegExp(`.*${search}.*`, "i") } },
                { message: { $regex: new RegExp(`.*${search}.*`, "i") } },
            ],
        });
        data.limit(pp);
        data.project({ _id: 1, name: 1, email: 1, message: 1, wantsToNotify: 1, status: 1, createdAt: 1 });

        // executing query and getting the results
        let error = false;
        const results: any = await data.exec().catch((e) => (error = true));
        if (error) throw new InternalServerErrorException();

        // update the status of records
        const updatingIDs = [];
        results.forEach((record) => updatingIDs.push(record._id));
        await this.ContactMessageModel.updateMany({ _id: { $in: updatingIDs } }, { status: "read" });

        const totalMessages = await this.ContactMessageModel.countDocuments({});
        const totalWaitingToNotifed = await this.ContactMessageModel.countDocuments({ didNotifiedBefore: false });

        return res.json({
            records: results,
            pp: pp,
            totalMessages: totalMessages,
            totalWaitingToNotifed: totalWaitingToNotifed,
        });
    }

    @Delete("/:id")
    async deleteSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const record = await this.ContactMessageModel.findOne({ _id: req.params.id }).exec();
        if (!record) throw new NotFoundException([{ property: "delete", errors: ["Record not found!"] }]);

        // delete the course
        await this.ContactMessageModel.deleteOne({ _id: req.params.id }).exec();

        return res.end();
    }
}
