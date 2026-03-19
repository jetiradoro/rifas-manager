import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

/**
 * Controlador HTTP para gestionar las rutas CRUD de personas.
 */
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  /**
   * Crea una nueva persona.
   * @param body Datos de creación
   * @returns Persona creada
   */
  @Post()
  create(@Body() body: CreatePersonDto) {
    try {
      return this.personsService.create(body);
    } catch (error) {
      console.error('Error al crear la persona', error);
      throw new HttpException(
        `Error al crear la persona: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lista todas las personas ordenadas alfabéticamente.
   * @returns Array de personas
   */
  @Get()
  findAll() {
    try {
      return this.personsService.findAll();
    } catch (error) {
      console.error('Error al listar personas', error);
      throw new HttpException(
        `Error al listar personas: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene una persona por id con tickets y rifas asociadas.
   * @param id Identificador numérico
   * @returns Persona encontrada con relaciones
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const person = await this.personsService.findOne(Number(id));
      if (!person) {
        throw new HttpException('Persona no encontrada', HttpStatus.NOT_FOUND);
      }
      return person;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al obtener la persona', error);
      throw new HttpException(
        `Error al obtener la persona: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Actualiza parcialmente una persona.
   * @param id Identificador de la persona
   * @param body Datos a modificar
   * @returns Persona actualizada
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePersonDto) {
    try {
      const person = await this.personsService.update(Number(id), body);
      return person;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al actualizar la persona', error.message);
      throw new HttpException(
        `Error al actualizar la persona`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Elimina una persona (solo si no tiene tickets).
   * @param id Identificador de la persona
   * @returns Persona eliminada
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.personsService.remove(Number(id));
    } catch (error) {
      console.error('Error al eliminar la persona', error);
      throw new HttpException(
        `Error al eliminar la persona: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
