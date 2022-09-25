import { CoreOutput } from './../../common/dtos/output.dto';

export class WriteBoardInput {
  title: string;
  content: string;
  boardImgName: string;
  boardImgSize: number;
}

export class WriteBoardOutput extends CoreOutput {}
