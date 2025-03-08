import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PasswordUtilsService {
  public passwordFormatValidation(password: string) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Za-z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, 1 digit, 1 lowercase letter, and 1 uppercase letter',
      );
    }
  }
}
