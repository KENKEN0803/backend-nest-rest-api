import { UserService } from './users/users.service';
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './users/dto/create-account.dto';
import { LoginInput, LoginOutput } from './users/dto/login.dto';
import { EmailCheckInput, EmailCheckOutput } from './users/dto/email-check.dto';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Post('/join')
  async postJoin(
    @Body() createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.postJoin(createAccountInput);
  }

  @Post('/login')
  async postLogin(@Body() loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.postLogin(loginInput);
  }


}
