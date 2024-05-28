import { validExtensions } from "./index";

export const fileFilter = (request: Express.Request, file: Express.Multer.File, callBack: Function) => {
    if (!file) return callBack(new Error('File is empty'), false);

    const fileExt = file.mimetype.split('/')[1];

    if (validExtensions.includes(fileExt)) return callBack(null, true);

    callBack(null, false);
};