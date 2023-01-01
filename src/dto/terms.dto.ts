import { IsNotEmpty, IsString } from "class-validator";

export class UpdateTermsTextRequestDto {
    @IsString({ message: "please fill the terms text field!" })
    @IsNotEmpty({ message: "please fill the terms text field!" })
    readonly text: string;
}
