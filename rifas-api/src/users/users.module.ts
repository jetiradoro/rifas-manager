import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de gestión de usuarios.
 */
@Module({
    imports: [PrismaModule],
    controllers: [UsersController, ProfileController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
