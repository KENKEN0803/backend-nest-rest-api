import { Response } from 'express';
import { CoreOutput } from './../../common/dtos/output.dto';

export class CertificatePhoneInput {
  imp_uid: string;
}

export class CertificatePhoneOutput extends CoreOutput {
  status?: string;
}
