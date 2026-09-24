import { Controller, Get, Post, Param, Body, Req, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddMiembroDto, CreateEquipoDto } from './dto/equipo.dto';

@Controller('equipos')
@UseGuards(JwtAuthGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  // GET /equipos - Obtener todos los equipos del usuario
  @Get()
  getMyEquipos(@Req() req) {
    return this.equiposService.findByUser(req.user.id);
  }

  // GET /equipos/:id - Obtener detalles de un equipo específico
  @Get(':id')
  getEquipo(@Param('id') id: string, @Req() req) {
    return this.equiposService.findById(id, req.user.id);
  }

  // GET /equipos/:id/miembros - Obtener miembros de un equipo
  @Get(':id/miembros')
  getMiembros(@Param('id') id: string, @Req() req) {
    return this.equiposService.getMiembros(id, req.user.id);
  }

  // POST /equipos - Crear equipo (ya existe)
  @Post()
  create(@Body() dto: CreateEquipoDto, @Req() req) {
    return this.equiposService.create(dto, req.user.id);
  }

  // POST /equipos/:id/miembros - Agregar miembro (ya existe)
  @Post(':id/miembros')
  addMiembro(@Param('id') id: string, @Body() dto: AddMiembroDto, @Req() req) {
    const userId = dto.userId ?? dto.usuarioId;
    if (!userId) {
      throw new BadRequestException('Debe enviar userId o usuarioId');
    }
    return this.equiposService.addMiembro(id, userId, req.user.id);
  }
  
  // DELETE /equipos/:id/miembros/:userId - Eliminar miembro (ya existe)
  @Delete(':id/miembros/:userId')
  removeMiembro(
    @Param('id') equipoId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.equiposService.removeMiembro(equipoId, userId, req.user.id);
  }
}