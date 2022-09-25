import { CoreOutput } from './../../common/dtos/output.dto';
export class SuccessShopInput {
  imp_uid: string;
  merchant_uid: string;
  id: string;
  status?: string;
  message?: string;
  vbank_num?: number;
  vbank_date?: Date;
  vbank_name?: string;
}

export class SuccessShopOutput extends CoreOutput {
  status?: string;
  message?: string;
  vbank_num?: number;
  vbank_date?: Date;
  vbank_name?: string;
}
