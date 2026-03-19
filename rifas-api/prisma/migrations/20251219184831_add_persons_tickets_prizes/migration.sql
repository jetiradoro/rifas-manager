-- CreateTable
CREATE TABLE `persons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `persons_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `rifaId` INTEGER NOT NULL,
    `personId` INTEGER NULL,
    `status` ENUM('available', 'reserved', 'paid') NOT NULL DEFAULT 'available',
    `observations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tickets_rifaId_number_key`(`rifaId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prizes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rifaId` INTEGER NOT NULL,
    `ticketId` INTEGER NOT NULL,
    `personId` INTEGER NOT NULL,
    `prizeOrder` INTEGER NOT NULL,
    `drawnAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `prizes_rifaId_prizeOrder_key`(`rifaId`, `prizeOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `persons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prizes` ADD CONSTRAINT `prizes_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prizes` ADD CONSTRAINT `prizes_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prizes` ADD CONSTRAINT `prizes_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `persons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
