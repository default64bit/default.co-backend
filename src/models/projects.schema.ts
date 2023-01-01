import { Document, Schema } from "mongoose";
import { Tag } from "./tags.schema";
import { TechAndTool } from "./techAndTools.schema";

export type ProjectDocument = Project & Document;

export const ProjectSchema = new Schema({
    images: [{ type: String }],
    name: { type: String, required: true },
    desc: { type: String, required: true },
    text_desc: { type: String },
    text: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    link: { type: String },
    usedTech: [{ type: Schema.Types.ObjectId, ref: "TechAndTool" }],
    workPeriod: {
        from: { type: Date },
        to: { type: Date },
    },
    views: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Project {
    _id: Schema.Types.ObjectId;
    images: String[];
    name: String;
    desc: String;
    text_desc?: String;
    text: String;
    tags?: Array<Tag | Schema.Types.ObjectId>;
    link?: String;
    usedTech: Array<TechAndTool | Schema.Types.ObjectId>;
    workPeriod?: {
        from: Date;
        to: Date;
    };
    views: Number;
    createdAt: Date;
}
