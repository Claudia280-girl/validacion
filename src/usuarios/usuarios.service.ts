import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>
  ) {}

  async create(dto: Partial<Usuario>) {
    const user = new this.usuarioModel(dto);
    return user.save();
  }

  async findById(id: string) {
    const usuario = await this.usuarioModel
      .findById(id)
      .select('-password') // NUNCA devolver la contraseña
      .exec();
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  // Devuelve el usuario con contraseña (para login)
  async findByEmailRaw(email: string) {
    return this.usuarioModel.findOne({ email }).exec();
  }

  async findByEmail(email: string) {
    const usuario = await this.usuarioModel
      .findOne({ email })
      .select('-password') // NUNCA devolver la contraseña
      .exec();
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }
}