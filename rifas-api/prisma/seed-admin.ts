import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'jesus@jetiradoro.com';
const DEFAULT_PASSWORD = 'secret';

/**
 * Crea el administrador inicial si no existe. Si ya existe, no modifica nada.
 * La contraseña inicial es ADMIN_PASSWORD (si está definida) o "secret".
 * @returns Promesa sin valor.
 */
async function main(): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (existing) {
        console.log(`ℹ️ Admin ${ADMIN_EMAIL} ya existe: sin cambios.`);
        return;
    }
    const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
    await prisma.user.create({
        data: {
            email: ADMIN_EMAIL,
            name: 'Jesús',
            role: Role.admin,
            password: await bcrypt.hash(password, 10),
        },
    });
    console.log(`✅ Admin ${ADMIN_EMAIL} creado.`);
}

main()
    .catch((error: unknown) => {
        console.error('❌ Error creando el admin:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
