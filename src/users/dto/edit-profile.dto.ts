import { CoreOutput } from 'src/common/dtos/output.dto';

export class EditProfileInput {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmation_password:string;
  region: string;
  phoneNum: string;
}

export class EditProfileOutput extends CoreOutput {}
