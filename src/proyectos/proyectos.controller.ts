import { Body, Controller, Post, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/proyecto.dto';

@Controller('proyectos')
@UseGuards(JwtAuthGuard)
export class ProyectosController {
  constructor(private proyectosService: ProyectosService) {}

  // GET /proyectos?equipoId=X - Obtener proyectos de un equipo
  @Get()
  getByEquipo(@Query('equipoId') equipoId: string, @Req() req) {
    if (!equipoId) {
      return { message: 'Debes proporcionar equipoId' };
    }
    return this.proyectosService.findByEquipo(equipoId, req.user.id);
  }

  // GET /proyectos/:id - Obtener un proyecto específico
  @Get(':id')
  getById(@Param('id') id: string, @Req() req) {
    return this.proyectosService.findById(id, req.user.id);
  }

  // POST /proyectos - Crear proyecto (ya existe)
  @Post()
  create(@Body() dto: CreateProyectoDto, @Req() req) {
    return this.proyectosService.crearProyecto(dto, req.user.id);
  }
}