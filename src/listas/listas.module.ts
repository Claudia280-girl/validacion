import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lista, ListaSchema } from './schemas/lista.schema';
import { ListasController } from './listas.controller';
import { ListasService } from './listas.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Lista.name, schema: ListaSchema }])],
  controllers: [ListasController],
  providers: [ListasService],
  exports: [ListasService],
})
export class ListasModule {}
