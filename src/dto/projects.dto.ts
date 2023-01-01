import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional, IsArray } from "class-validator";

export class CreateNewProjectDto {
    @IsString({ message: "Project name is empty!" })
    @IsNotEmpty({ message: "Project name is empty!" })
    readonly name: string;

    @IsString({ message: "Project needs some kind of description!" })
    @IsNotEmpty({ message: "Project needs some kind of description!" })
    readonly desc: string;

    @IsString({ message: "You should add some text for project!" })
    @IsNotEmpty({ message: "You should add some text for project!" })
    readonly text: string;

    @IsOptional()
    @IsString({ message: "Tags must be a string!" })
    readonly tags?: string;

    @IsOptional()
    @IsString({ message: "Link must be a string!" })
    readonly link?: string;

    @IsOptional()
    @IsString({ message: "Tech must be a string!" })
    readonly tech?: string;
}

export class EditProjectDto {
    @IsString({ message: "Project name is empty!" })
    @IsNotEmpty({ message: "Project name is empty!" })
    readonly name: string;

    @IsString({ message: "Project needs some kind of description!" })
    @IsNotEmpty({ message: "Project needs some kind of description!" })
    readonly desc: string;

    @IsString({ message: "You should add some text for project!" })
    @IsNotEmpty({ message: "You should add some text for project!" })
    readonly text: string;

    @IsOptional()
    @IsString({ message: "Tags must be a string!" })
    readonly tags?: string;

    @IsOptional()
    @IsString({ message: "Link must be a string!" })
    readonly link?: string;

    @IsOptional()
    @IsString({ message: "Tech must be a string!" })
    readonly tech?: string;

    @IsString({ message: "A list of images must be provided!" })
    @IsNotEmpty({ message: "Images list should not be empty!" })
    readonly imagesList: string;
}
