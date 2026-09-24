import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListasService } from './listas.service';

@Controller('listas')
@UseGuards(JwtAuthGuard)
export class ListasController {
  constructor(private readonly listasService: ListasService) {}

  
  @Get('proyecto/:id')
  obtenerListasPorProyecto(@Param('id') id: string) {
    return this.listasService.obtenerListasPorProyecto(id);
  }
}
