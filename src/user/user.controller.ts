import {
  Body,
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {
  // if u don't provide anything inside @Get() then it will catch all get request
  // eg `/users/hey` `/users/*` `/users`
  @Get('me')
  // only catch /users/me
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request | any) {
    return req.user;
  }
}
