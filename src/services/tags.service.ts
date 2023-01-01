import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Schema } from "mongoose";
import { TagDocument } from "src/models/tags.schema";

@Injectable()
export class TagsService {
    constructor(@InjectModel("Tag") private readonly TagModel: Model<TagDocument>) {}

    async getTagIds(tags?: String[]): Promise<Schema.Types.ObjectId[]> {
        if (!tags || tags.length == 0) return [];

        const tagIds = [];
        // get tags that already exists
        const foundTags = await this.TagModel.find({ name: { $in: tags } }).exec();

        // remove existing tags from the list and push their ids to returning list
        foundTags.forEach((tag) => {
            let index;
            if (-1 !== (index = tags.indexOf(tag.name))) {
                tags.splice(index, 1);
                tagIds.push(tag._id);
            }
        });

        // add non-exsiting tags to DB and add their ids to list
        const insertList = [];
        tags.forEach((tag) => insertList.push({ name: tag }));
        const newTags = await this.TagModel.insertMany(insertList);
        newTags.forEach((newTag) => tagIds.push(newTag._id));

        return tagIds;
    }
}
