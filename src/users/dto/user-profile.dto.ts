import { User } from '../entity/user.entity';
import { CoreOutput } from './../../common/dtos/output.dto';


export  class UserProfileInput {
    userId:number;
}

export class UserProfileOutput extends CoreOutput{
    user?:User;
}