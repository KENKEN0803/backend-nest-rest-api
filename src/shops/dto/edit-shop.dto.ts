import { CoreOutput } from '../../common/dtos/output.dto';
export class EditShopInput {
  name: string;
  amount: number | string;
  itemImgName: string;
  itemImgPath: string;
  content: string;
  views: number;
  rating: number;
}

export class EditShopOutput extends CoreOutput {}
