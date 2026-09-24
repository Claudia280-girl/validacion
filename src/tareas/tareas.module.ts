import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tarea, TareaSchema } from './schemas/tarea.schema';
import { Proyecto, ProyectoSchema } from '../proyectos/schemas/proyecto.schema';
import { Equipo, EquipoSchema } from '../equipos/schemas/equipo.schema';
import { Lista, ListaSchema } from '../listas/schemas/lista.schema';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tarea.name, schema: TareaSchema },
      { name: Proyecto.name, schema: ProyectoSchema },
      { name: Equipo.name, schema: EquipoSchema },
      { name: Lista.name, schema: ListaSchema },
    ]),
  ],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}