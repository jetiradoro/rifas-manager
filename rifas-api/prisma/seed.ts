import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const { fakerES: faker } = require('@faker-js/faker');

const prisma = new PrismaClient();
const PERSONS_TO_CREATE = 30;

/**
 * Normaliza texto para construir correos limpios sin espacios ni acentos.
 * @param value Texto a normalizar.
 * @returns Texto normalizado en minúsculas y sin diacríticos.
 */
function normalizeForEmail(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.')
        .toLowerCase();
}

/**
 * Crea una persona de prueba con datos aleatorios en castellano.
 * @param index Índice incremental para garantizar unicidad en el email.
 * @returns Objeto compatible con `PersonCreateManyInput`.
 */
function buildRandomPerson(index: number) {
    const firstName = `participante_${(index + 1).toString()}` ;
    const lastName = "faker";
    const normalizedFirstName = normalizeForEmail(firstName);
    const normalizedLastName = normalizeForEmail(lastName);
    const domain = faker.helpers.arrayElement(['gmail.com', 'outlook.es', 'hotmail.com', 'yahoo.es']);

    return {
        name: firstName,
        surname: lastName,
        phone: "+34 555 123 45",
        email: `${normalizedFirstName}.${normalizedLastName}.${index + 1}@${domain}`,
    };
}

/**
 * Ejecuta el proceso de seeding creando 30 personas.
 * @returns Resultado de creación por lotes de Prisma.
 */
async function seedPersons() {
    const personsData = Array.from({ length: PERSONS_TO_CREATE }, (_, index) =>
        buildRandomPerson(index),
    );

    return prisma.person.createMany({
        data: personsData,
        skipDuplicates: true,
    });
}

/**
 * Crea (o actualiza) el usuario administrador inicial a partir de variables de entorno.
 * Requiere ADMIN_EMAIL y ADMIN_PASSWORD; si faltan, se omite.
 * @returns Promesa sin valor.
 */
async function seedAdmin(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.log('⚠️ ADMIN_EMAIL/ADMIN_PASSWORD no definidos: se omite el admin.');
        return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
        where: { email },
        update: { role: Role.admin, password: hashed },
        create: { email, password: hashed, name: 'Admin', role: Role.admin },
    });
    console.log(`✅ Admin listo: ${email}`);
}

/**
 * Punto de entrada del seeder.
 * @returns Promesa sin valor.
 */
async function main(): Promise<void> {
    await seedAdmin();
    const result = await seedPersons();
    console.log(`✅ Seeder completado. Registros creados: ${result.count}`);
}

main()
    .catch((error: unknown) => {
        console.error('❌ Error ejecutando el seeder de persons:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
