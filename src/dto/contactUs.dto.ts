import { IsEmail, IsNotEmpty, Length, IsString, IsIn } from "class-validator";

export class SendContactRequestDto {
    @Length(1, 100, { message: "name must be at max 100 characters!" })
    @IsString({ message: "please enter your full name!" })
    @IsNotEmpty({ message: "please enter your full name!" })
    readonly name: string;

    @IsEmail({ message: "email address is invalid!" })
    @IsNotEmpty({ message: "please enter your email address!" })
    readonly email: string;

    @Length(1, 1000, { message: "message must be at max 1000 characters!" })
    @IsString({ message: "please enter your message!" })
    @IsNotEmpty({ message: "please enter your message!" })
    readonly message: string;

    @IsIn(["true", "false"], { message: "do you want to be notified?" })
    @IsString({ message: "do you want to be notified?" })
    @IsNotEmpty({ message: "do you want to be notified?" })
    readonly notify: string;
}
