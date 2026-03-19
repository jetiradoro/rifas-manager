/*
  Warnings:

  - You are about to drop the column `prizeName` on the `prizes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `prizes` DROP COLUMN `prizeName`;

-- AlterTable
ALTER TABLE `rifas` ADD COLUMN `prize_names` JSON NULL;
