import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

/**
 * Controlador de autenticación.
 */
@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registro de nuevo usuario.
   * @param registerDto Datos de registro
   * @returns Token JWT y datos del usuario
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login con email y password.
   * @param loginDto Credenciales
   * @returns Token JWT y datos del usuario
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Inicia el flujo de autenticación con Google.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirige a Google
  }

  /**
   * Callback de Google OAuth.
   * @param req Request con datos de usuario de Google
   * @param res Response para redirección
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirigir al frontend con el token en la URL
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://app.rifas.loc',
    );
    res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }

  /**
   * Obtiene el usuario actual autenticado.
   * @param user Usuario del JWT
   * @returns Datos del usuario actual
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
