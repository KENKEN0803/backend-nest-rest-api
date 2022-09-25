import {
  CertificatePhoneInput,
  CertificatePhoneOutput,
} from './dto/certificate-phone.dto';
import { EmailCheckInput, EmailCheckOutput } from './dto/email-check.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { User } from './entity/user.entity';
import { Body, Controller, Post, Get, Req, Res, Put } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserService } from './users.service';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/owner')
  async getFindById(@AuthUser() authUser: User) {
    return this.userService.findById(authUser.id);
  }

  @Post('/emailCheck')
  async postEmailCheck(
    @Body() emailCheckInput: EmailCheckInput,
  ): Promise<EmailCheckOutput> {
    return this.userService.postEmailCheck(emailCheckInput);
  }

  @Post('/certifications')
  async postCertification(
    @Body() certificatePhoneInput: CertificatePhoneInput,
  ): Promise<CertificatePhoneOutput> {
    return this.userService.postCertification(certificatePhoneInput);
  }

  @Put('/edit')
  async postEditProfile(
    @AuthUser() authUser: User,
    @Body() editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.userService.putEditProfile(authUser.id, editProfileInput);
  }

  @Get('/naverCallback')
  async getNaverSocialCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    return this.userService.getNaverSocialCallback(request, response);
  }

  @Get('/kakaoCallback')
  async getKakaoSocialCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    return this.userService.getKakaoSocialCallback(request, response);
  }

  @Get('/googleCallback')
  async getGoogleSocialCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    return this.userService.getGoogleSocialCallback(request, response);
  }
}
