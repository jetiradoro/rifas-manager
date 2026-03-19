import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para actualizar un usuario.
 * Todos los campos son opcionales.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
