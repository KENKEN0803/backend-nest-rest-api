import { CoreOutput } from './../../common/dtos/output.dto';

export class CreateShopInput {
  name: string;
  amount: string;
  itemImgName: string;
  itemImgSize: number;
  itemImgPath: string;
  content: string;
  views: number;
  rating: number;
}

export class CreateShopOutput extends CoreOutput {}
