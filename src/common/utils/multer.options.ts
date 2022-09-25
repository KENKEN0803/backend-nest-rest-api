import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from './file-helper';

export const boardOptions = {
  storage: diskStorage({
    destination: './files/board',
    filename: editFileName,
  }),
  fileFilter: imageFileFilter,
};

export const itemOptions = {
  storage: diskStorage({
    destination: './files/item',
    filename: editFileName,
  }),
  fileFilter: imageFileFilter,
};
