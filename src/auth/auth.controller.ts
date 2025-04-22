import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, UpdatePasswordDto } from './dto';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';
import { public_users as User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtGuard)
  @Post('update-password')
  async updatePassword(@GetUser() user: User, @Body() dto: UpdatePasswordDto) {
    await this.authService.updatePassword(user, dto.password);
    return { message: 'Contraseña actualizada' };
  }

  @UseGuards(JwtGuard)
  @Get('me')
  whoAmI(@GetUser() user: User) {
    return user;
  }
}
