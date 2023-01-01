import { Document, Schema } from "mongoose";

export type ContactMessageDocument = ContactMessage & Document;

export const ContactMessageSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    wantsToNotify: { type: Boolean, required: true, default: false },
    didNotifiedBefore: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, enum: ["new", "read"], default: "new" },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface ContactMessage {
    _id: Schema.Types.ObjectId;
    name: String;
    email: String;
    message: String;
    wantsToNotify: Boolean;
    didNotifiedBefore: Boolean;
    status: "new" | "read";
    createdAt: Date;
}
