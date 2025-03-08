import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// eslint-disable-next-line unicorn/import-style
import { join } from 'node:path';

import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        return {
          transport: {
            host: process.env.MAIL_HOST,
            port: +process.env.MAIL_PORT,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            },
          },
          defaults: {
            from: `"No Reply" <${process.env.MAIL_FROM}>`,
          },
          template: {
            dir: join(process.cwd(), 'src', 'email', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [EmailService],
  providers: [EmailService],
})
export class EmailModule {}
