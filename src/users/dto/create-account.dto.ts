import { CoreOutput } from './../../common/dtos/output.dto';
export class CreateAccountInput {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmation_password: string;
  region: string;
  phoneNum: string;
}

export class CreateAccountOutput extends CoreOutput {}
