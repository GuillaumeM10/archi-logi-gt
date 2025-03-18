import { SetMetadata } from '@nestjs/common';

export const IS_TWO_FA = 'isTwoFa';
export const TwoFA = () => SetMetadata(IS_TWO_FA, true);
