import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';

import { join } from 'path';


@Injectable()
export class FilesService {
    getStaticFile(fileName: string) {
        const path = join(__dirname, '../../static/uploads', fileName);

        if (!existsSync(path)) throw new NotFoundException(`File with name ${fileName} not found`);
        return path;
    }
}
