import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SendContactRequestDto } from "src/dto/contactUs.dto";
import { ContactMessageDocument } from "src/models/contactMessages.schema";

@Controller("contact-us")
export class ContactUsController {
    constructor(@InjectModel("ContactMessage") private readonly ContactMessageModel: Model<ContactMessageDocument>) {}

    @Post("send-message")
    async sendMessage(@Body() input: SendContactRequestDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        await this.ContactMessageModel.create({
            name: input.name,
            email: input.email,
            message: input.message,
            wantsToNotify: input.notify == "true" ? true : false,
            didNotifiedBefore: false,
            status: "new",
            createdAt: new Date(Date.now()),
        });
        return res.json({});
    }
}
