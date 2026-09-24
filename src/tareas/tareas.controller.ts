import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TareasService } from './tareas.service';
import { AsignarMiembrosDto, CreateTareaDto, MoverTareaDto } from './dto/tarea.dto';

@Controller('tareas')
@UseGuards(JwtAuthGuard)
export class TareasController {
  constructor(private tareasService: TareasService) {}

  // GET /tareas?proyectoId=X - Obtener todas las tareas de un proyecto
  @Get()
  getByProyecto(@Query('proyectoId') proyectoId: string, @Req() req) {
    if (!proyectoId) {
      return { message: 'Debes proporcionar proyectoId' };
    }
    return this.tareasService.findByProyecto(proyectoId, req.user.id);
  }

  // POST /tareas - Crear tarea (ya existe)
  @Post()
  create(@Body() dto: CreateTareaDto, @Req() req) {
    return this.tareasService.create(dto, req.user.id);
  }

  // PATCH /tareas/:id/mover - Mover tarea (ya existe)
  @Patch(':id/mover')
  mover(@Param('id') id: string, @Body() dto: MoverTareaDto, @Req() req) {
    return this.tareasService.moverTarea(id, dto.nuevaListaId, req.user.id);
  }

  // PATCH /tareas/:id/asignar - Asignar miembros (ya existe)
  @Patch(':id/asignar')
  asignarMiembros(@Param('id') id: string, @Body() dto: AsignarMiembrosDto, @Req() req) {
    return this.tareasService.asignarMiembros(id, dto.miembros, req.user.id);
  }
}