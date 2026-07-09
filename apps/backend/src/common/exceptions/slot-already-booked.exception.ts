import { HttpException, HttpStatus } from '@nestjs/common';

export class SlotAlreadyBookedException extends HttpException {
    constructor(message = 'This slot has already been booked.') {
        super(message, HttpStatus.CONFLICT);
    }
}
