import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1783491255329 implements MigrationInterface {
    name = 'InitialMigration1783491255329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, CONSTRAINT "UQ_32fe6bfe82d8e4959ba9d9fad42" UNIQUE ("email"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "patient_email" character varying(150) NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_98849cef3edd5a6afe5b6dc210" ON "reservations" ("provider_id", "start_time", "end_time") `);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_12e918a62aff6eb6b4aba770cdc" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_12e918a62aff6eb6b4aba770cdc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98849cef3edd5a6afe5b6dc210"`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TABLE "providers"`);
    }

}
