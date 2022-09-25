import { CoreOutput } from 'src/common/dtos/output.dto';

export class LoginInput {
  email: string;
  password: string;
}

export class LoginOutput extends CoreOutput {
  token?: string;
  refreshToken?: string;
}
