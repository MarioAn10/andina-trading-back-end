import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateInvestorDto {
    @IsString()
    @MinLength(1)
    address: string;

    @IsString()
    @MinLength(1)
    country: string;

    @IsString()
    @MinLength(1)
    city: string;

    @IsNumber()
    bank_account: number;
}
