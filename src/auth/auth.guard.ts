import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();
    const token =
      this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'Token Not Found',
      );
    }
    try {
      const payload =
        await this.jwtService.verifyAsync(token, {
          secret: this.config.get('JWT_SECRET'),
        });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const user =
        await this.prisma.user.findUnique({
          where: {
            id: payload.sub,
          },
        });
      // Remove the user PW  hash
      delete user.hash;
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ??
      [];
    return type === 'Bearer' ? token : undefined;
  }
}
