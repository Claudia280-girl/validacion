import { Controller, Get, Req, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios/me - Obtener perfil del usuario autenticado
  @Get('me')
  getProfile(@Req() req) {
    if (!req?.user?.id) {
      throw new BadRequestException('Usuario no autenticado');
    }
    return this.usuariosService.findById(req.user.id);
  }

  // GET /usuarios?email=juan@example.com - Buscar usuario por email
  @Get()
  findByEmail(@Query('email') email: string) {
    if (!email) {
      return { message: 'Debes proporcionar un email' };
    }
    return this.usuariosService.findByEmail(email);
  }
}