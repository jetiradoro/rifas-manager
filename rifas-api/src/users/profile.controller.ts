import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

/**
 * Controlador para que los usuarios gestionen su propio perfil.
 */
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   * @param user Usuario autenticado
   * @returns Datos del perfil
   */
  @Get()
  async getProfile(@CurrentUser() user: User) {
    const userProfile = await this.usersService.findOne(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profileData } = userProfile;
    return profileData;
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * @param user Usuario autenticado
   * @param updateProfileDto Datos a actualizar
   * @returns Usuario actualizado
   */
  @Patch()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profileData } = updatedUser;
    return profileData;
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * @param user Usuario autenticado
   * @param updatePasswordDto Contraseñas actual y nueva
   * @returns Usuario actualizado
   */
  @Patch('password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    // // Verificar que el usuario tenga contraseña (no es de Google)
    // if (!user.password) {
    //     throw new UnauthorizedException(
    //         'Los usuarios de Google no pueden cambiar la contraseña.',
    //     );
    // }

    const updatedUser = await this.usersService.updatePassword(
      user.id,
      updatePasswordDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profileData } = updatedUser;
    return profileData;
  }
}
