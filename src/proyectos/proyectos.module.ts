import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';
import { Proyecto, ProyectoSchema } from './schemas/proyecto.schema';
import { Lista, ListaSchema } from '../listas/schemas/lista.schema';
import { Equipo, EquipoSchema } from '../equipos/schemas/equipo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Proyecto.name, schema: ProyectoSchema },
      { name: Lista.name, schema: ListaSchema },
      { name: Equipo.name, schema: EquipoSchema }, // ← IMPORTANTE
    ]),
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [ProyectosService],
})
export class ProyectosModule {}