import { CoreOutput } from 'src/common/dtos/output.dto';

export class EmailCheckInput {
  email: string;
}

export class EmailCheckOutput extends CoreOutput {}
