import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional } from "class-validator";

export class UpdateStatusRequestDto {
    @IsIn(["true", "false"], { message: "state value is not defined!" })
    @IsString({ message: "state value is not defined!" })
    @IsNotEmpty({ message: "state value is not defined!" })
    readonly state: string;
}

export class UpdateSocialsRequestDto {
    @IsEmail({}, { message: "email address is invalid!" })
    @IsString({ message: "please enter your email address!" })
    readonly email: string;

    @IsOptional()
    @IsNotEmpty({ message: "telegram link must be a string!" })
    readonly telegram?: string;

    @IsOptional()
    @IsNotEmpty({ message: "linkedin link must be a string!" })
    readonly linkedin?: string;

    @IsOptional()
    @IsNotEmpty({ message: "dribbble link must be a string!" })
    readonly dribbble?: string;

    @IsOptional()
    @IsString({ message: "github link must be a string!" })
    readonly github?: string;
}
