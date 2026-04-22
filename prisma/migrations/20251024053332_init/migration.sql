/*
  Warnings:

  - You are about to drop the column `estimationRows` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `jobName` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "estimationRows",
DROP COLUMN "jobName";
