-- Prisma initial migration for rifas schema
CREATE TABLE `rifas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `n_tickets` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `n_prizes` INTEGER NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `rifas_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;
