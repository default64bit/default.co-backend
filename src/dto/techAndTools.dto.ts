import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional } from "class-validator";

export class CreateNewToolDto {
    @IsString({ message: "Name value is not defined!" })
    @IsNotEmpty({ message: "Name value is not defined!" })
    readonly name: string;
    
    @IsIn(["off", "design", "develop", "deploy"], { message: "mostUsed value is not defined!" })
    @IsString({ message: "mostUsed value is not defined!" })
    @IsNotEmpty({ message: "mostUsed value is not defined!" })
    readonly mostUsed: string;
    
    @IsIn(["true", "false"], { message: "showInList value is not defined!" })
    @IsString({ message: "showInList value is not defined!" })
    @IsNotEmpty({ message: "showInList value is not defined!" })
    readonly showInList: string;
}

export class EditToolDto {
    @IsString({ message: "Name value is not defined!" })
    @IsNotEmpty({ message: "Name value is not defined!" })
    readonly name: string;
    
    @IsIn(["off", "design", "develop", "deploy"], { message: "mostUsed value is not defined!" })
    @IsString({ message: "mostUsed value is not defined!" })
    @IsNotEmpty({ message: "mostUsed value is not defined!" })
    readonly mostUsed: string;
    
    @IsIn(["true", "false"], { message: "showInList value is not defined!" })
    @IsString({ message: "showInList value is not defined!" })
    @IsNotEmpty({ message: "showInList value is not defined!" })
    readonly showInList: string;
}
