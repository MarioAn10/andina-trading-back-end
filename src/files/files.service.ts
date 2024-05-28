import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';

import { join } from 'path';


@Injectable()
export class FilesService {
    constructor(
        private readonly configService: ConfigService,
    ) { }
    getStaticFile(fileName: string) {
        const path = join(__dirname, '../../static/', this.configService.get('API_FILES_DIR'), fileName);

        if (!existsSync(path)) throw new NotFoundException(`File with name ${fileName} not found`);
        return path;
    }
}
