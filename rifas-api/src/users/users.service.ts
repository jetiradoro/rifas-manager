import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para la gestión de usuarios del sistema.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario.
   * @param createUserDto Datos del usuario
   * @returns Usuario creado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, personId, ...rest } = createUserDto;

    // Verificar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${email}.`,
      );
    }

    // Verificar personId único si se proporciona
    if (personId) {
      const existingPersonUser = await this.prisma.user.findUnique({
        where: { personId },
      });
      if (existingPersonUser) {
        throw new ConflictException(
          `Ya existe un usuario asociado a esta persona.`,
        );
      }

      // Verificar que la persona exista
      const person = await this.prisma.person.findUnique({
        where: { id: personId },
      });
      if (!person) {
        throw new NotFoundException(
          `No se encontró la persona con id ${personId}.`,
        );
      }
    }

    // Hashear password si existe
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        personId,
        ...rest,
      },
    });
  }

  /**
   * Obtiene todos los usuarios.
   * @returns Lista de usuarios
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        person: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca un usuario por su id.
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        person: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }

    return user;
  }

  /**
   * Busca un usuario por su email.
   * @param email Email del usuario
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        person: true,
      },
    });
  }

  /**
   * Busca un usuario por su Google ID.
   * @param googleId Google ID del usuario
   * @returns Usuario encontrado o null
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: {
        person: true,
      },
    });
  }

  /**
   * Actualiza un usuario existente.
   * @param id ID del usuario
   * @param updateUserDto Datos a actualizar
   * @returns Usuario actualizado
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que existe
    await this.findOne(id);

    const { email, password, personId, ...rest } = updateUserDto;

    // Verificar email único si se está cambiando
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `Ya existe otro usuario con el email ${email}.`,
        );
      }
    }

    // Verificar personId único si se está cambiando
    if (personId !== undefined) {
      if (personId !== null) {
        const existingPersonUser = await this.prisma.user.findUnique({
          where: { personId },
        });
        if (existingPersonUser && existingPersonUser.id !== id) {
          throw new ConflictException(
            `Ya existe otro usuario asociado a esta persona.`,
          );
        }

        // Verificar que la persona existe
        const person = await this.prisma.person.findUnique({
          where: { id: personId },
        });
        if (!person) {
          throw new NotFoundException(
            `No se encontró la persona con id ${personId}.`,
          );
        }
      }
    }

    // Hashear nueva password si existe
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email,
        password: hashedPassword,
        personId,
        ...rest,
      },
    });
  }

  /**
   * Elimina un usuario.
   * @param id ID del usuario
   * @returns Usuario eliminado
   */
  async remove(id: number): Promise<User> {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Valida las credenciales de un usuario.
   * @param email Email del usuario
   * @param password Password sin hashear
   * @returns Usuario si las credenciales son válidas, null en caso contrario
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * @param id ID del usuario
   * @param updateProfileDto Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    await this.findOne(id);

    const { email, name } = updateProfileDto;
    console.log(updateProfileDto);
    // Verificar email único si se está cambiando
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `Ya existe otro usuario con el email ${email}.`,
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email,
        name,
      },
      include: {
        person: true,
      },
    });
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * @param id ID del usuario
   * @param updatePasswordDto Contraseñas actual y nueva
   * @returns Usuario actualizado
   */
  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Verificar que el usuario tenga contraseña
    // if (!user.password) {
    //     throw new UnauthorizedException(
    //         'Los usuarios de Google no pueden cambiar la contraseña.',
    //     );
    // }

    // Verificar que la contraseña actual sea correcta
    // const isPasswordValid = await bcrypt.compare(
    //     updatePasswordDto.currentPassword,
    //     user.password,
    // );

    // if (!isPasswordValid) {
    //     throw new UnauthorizedException('La contraseña actual es incorrecta.');
    // }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
      include: {
        person: true,
      },
    });
  }
}
