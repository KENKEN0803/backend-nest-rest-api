import { User } from 'src/users/entity/user.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

export class UserEmailInput {
    email:string;
}


export class UserEmailOutput extends CoreOutput {
    user?:User;
}