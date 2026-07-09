import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidDurationException extends HttpException {
    constructor(message = 'Only 30-minute appointments are allowed.') {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
