import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

/**
 * Servicio de dominio para operaciones CRUD sobre personas.
 */
@Injectable()
export class PersonsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una persona con los datos indicados.
   * @param data Datos de la persona a crear
   * @returns Persona persistida
   */
  async create(data: CreatePersonDto) {
    // Verificar email único solo si se proporciona
    if (data.email) {
      const existing = await this.prisma.person.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException('Ya existe una persona con ese email.');
      }
    }

    return this.prisma.person.create({
      data: {
        name: data.name,
        surname: data.surname,
        phone: data.phone || null,
        email: data.email || null,
      },
    });
  }

  /**
   * Obtiene todas las personas ordenadas alfabéticamente por nombre y apellido.
   * @returns Lista de personas
   */
  async findAll() {
    return this.prisma.person.findMany({
      orderBy: [{ name: 'asc' }, { surname: 'asc' }],
    });
  }

  /**
   * Obtiene una persona por su identificador con tickets y rifas asociadas.
   * @param id Identificador numérico de la persona
   * @returns Persona encontrada con relaciones o null
   */
  async findOne(id: number) {
    return this.prisma.person.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            rifa: true,
            prizes: true,
          },
        },
      },
    });
  }

  /**
   * Actualiza parcialmente una persona.
   * @param id Identificador de la persona
   * @param data Campos a modificar
   * @returns Persona actualizada
   */
  async update(id: number, data: UpdatePersonDto) {
    const existing = await this.prisma.person.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Persona no encontrada.');
    }

    // Calcular valores finales para phone y email
    const finalPhone = data.phone !== undefined ? data.phone : existing.phone;
    const finalEmail = data.email !== undefined ? data.email : existing.email;

    // Validar que al menos uno de los dos campos tenga valor
    if (!finalPhone && !finalEmail) {
      throw new BadRequestException(
        'Debes proporcionar al menos teléfono o email.',
      );
    }

    // Verificar email único solo si cambia y tiene valor
    if (finalEmail && finalEmail !== existing.email) {
      const emailExists = await this.prisma.person.findUnique({
        where: { email: finalEmail },
      });
      if (emailExists) {
        throw new ConflictException('Ya existe una persona con ese email.');
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: {
        name: data.name,
        surname: data.surname,
        phone: data.phone !== undefined ? data.phone : undefined,
        email: data.email !== undefined ? data.email : undefined,
      },
    });
  }

  /**
   * Elimina una persona (solo si no tiene tickets).
   * @param id Identificador de la persona
   * @returns Persona eliminada
   */
  async remove(id: number) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!person) {
      throw new NotFoundException('Persona no encontrada.');
    }

    if (person.tickets.length > 0) {
      throw new ConflictException(
        'No se puede eliminar una persona con tickets asociados.',
      );
    }

    return this.prisma.person.delete({ where: { id } });
  }
}
