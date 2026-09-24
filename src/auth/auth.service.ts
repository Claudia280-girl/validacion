import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.usuariosService.findByEmailRaw(dto.email);
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuariosService.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
    });

    return {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmailRaw(dto.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario._id,
      email: usuario.email,
      id: usuario._id,
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}