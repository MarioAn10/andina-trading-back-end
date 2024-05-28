import { v4 as uuid } from "uuid";

export const fileNamer = (request: Express.Request, file: Express.Multer.File, callBack: Function) => {
    const fileExt = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExt}`;
    callBack(null, fileName);
};