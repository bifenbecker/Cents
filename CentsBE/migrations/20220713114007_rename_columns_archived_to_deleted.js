exports.up = (knex) => {
    return knex.schema.raw(`
        UPDATE public."servicesMaster"
        SET "archivedAt"="deletedAt", "isArchived"=true
        WHERE "deletedAt" IS NOT NULL;
    `).raw(`
        ALTER TABLE "servicesMaster" DROP COLUMN "deletedAt";
        ALTER TABLE "servicesMaster" RENAME COLUMN "isArchived" TO "isDeleted";
        ALTER TABLE "servicesMaster" RENAME COLUMN "archivedAt" TO "deletedAt";
        ALTER TABLE "promotionProgramItems" RENAME COLUMN "isArchived" TO "isDeleted";
    `);
};

exports.down = (knex) => {
    return knex.schema.raw(`
        ALTER TABLE "promotionProgramItems" RENAME COLUMN "isDeleted" TO "isArchived";
        ALTER TABLE "servicesMaster" RENAME COLUMN "deletedAt" TO "archivedAt";
        ALTER TABLE "servicesMaster" RENAME COLUMN "isDeleted" TO "isArchived";
        ALTER TABLE "servicesMaster" ADD "deletedAt" timestamp with time zone;
    `).raw(`
        UPDATE public."servicesMaster"
        SET "deletedAt"="archivedAt", "isArchived"=true
        WHERE "archivedAt" IS NOT NULL;
    `);
};
