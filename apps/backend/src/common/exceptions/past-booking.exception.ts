import { HttpException, HttpStatus } from '@nestjs/common';

export class PastBookingException extends HttpException {
  constructor(message = 'You cannot book an appointment in the past.') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
