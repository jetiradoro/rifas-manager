import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Controlador para la gestión de usuarios.
 * Solo accesible por administradores.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /**
     * Crea un nuevo usuario.
     * @param createUserDto Datos del usuario
     * @returns Usuario creado
     */
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * Obtiene todos los usuarios.
     * @returns Lista de usuarios
     */
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    /**
     * Obtiene un usuario por su id.
     * @param id ID del usuario
     * @returns Usuario encontrado
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    /**
     * Actualiza un usuario existente.
     * @param id ID del usuario
     * @param updateUserDto Datos a actualizar
     * @returns Usuario actualizado
     */
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Elimina un usuario.
     * @param id ID del usuario
     * @returns Usuario eliminado
     */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
