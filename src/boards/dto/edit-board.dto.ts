import { CoreOutput } from 'src/common/dtos/output.dto';

export class EditBoardInput {
  title: string;
  content: string;
  boardImgName: string;
}

export class EditBoardOutput extends CoreOutput {}
