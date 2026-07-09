import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                ...dataSourceOptions,
                autoLoadEntities: true, // Load entities automatically when they are imported in their feature modules
                // synchronize: true, // ddl-auto=update, disabled because migrations are used instead
            }),
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
