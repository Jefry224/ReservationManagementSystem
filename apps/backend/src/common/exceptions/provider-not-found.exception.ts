import { HttpException, HttpStatus } from '@nestjs/common';

export class ProviderNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Provider with ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }
}
