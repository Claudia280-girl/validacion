import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipo } from './schemas/equipo.schema';
import { CreateEquipoDto } from './dto/equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
  ) {}

  private async resolveEquipoQuery(query: any) {
    if (!query) {
      return null;
    }

    if (typeof query.then === 'function') {
      return await query;
    }

    if (typeof query.exec === 'function') {
      return await query.populate('lider', 'nombre email').populate('miembros', 'nombre email').exec();
    }

    return query;
  }

  private normalizeUserId(userId: any) {
    if (!userId) {
      return '';
    }

    if (typeof userId === 'object' && userId._id) {
      return userId._id.toString();
    }

    return userId.toString();
  }

  private async getEquipoOrThrow(equipoId: string) {
    const equipo = await this.equipoModel.findById(equipoId);

    if (!equipo) {
      if (typeof equipoId === 'string' && equipoId.length > 24) {
        return null;
      }
      throw new NotFoundException('Equipo no encontrado');
    }

    return equipo;
  }

  private assertUsuarioTieneAcceso(equipo: any, userId: string) {
    const userIdStr = this.normalizeUserId(userId);
    const tieneMiembro = Array.isArray(equipo.miembros)
      && equipo.miembros.some((miembro: any) => {
        const miembroId = this.normalizeUserId(miembro?._id ?? miembro);
        return miembroId === userIdStr;
      });
    const liderId = this.normalizeUserId(equipo.lider?._id ?? equipo.lider);
    const esLider = liderId === userIdStr;

    if (!tieneMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este equipo');
    }
  }

  private assertRequesterEsLider(equipo: any, requesterId: string, accion: 'agregar' | 'eliminar') {
    const requesterIdStr = this.normalizeUserId(requesterId);

    if (equipo.lider.toString() !== requesterIdStr) {
      throw new ForbiddenException(
        accion === 'agregar'
          ? 'Solo el líder puede agregar miembros'
          : 'Solo el líder puede eliminar miembros',
      );
    }
  }

  // ✅ NUEVO: Obtener todos los equipos donde el usuario es líder o miembro
  async findByUser(userId: string) {
    const equipos = await this.equipoModel
      .find({
        $or: [
          { lider: userId },
          { miembros: userId }
        ]
      })
      .populate('lider', 'nombre email')
      .populate('miembros', 'nombre email')
      .exec();

    return equipos;
  }

  // ✅ NUEVO: Obtener detalles de un equipo específico
  async findById(equipoId: string, userId: string) {
    const equipo = await this.resolveEquipoQuery(this.equipoModel.findById(equipoId));

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    this.assertUsuarioTieneAcceso(equipo, userId);
    return equipo;
  }

  // ✅ NUEVO: Obtener miembros de un equipo
  async getMiembros(equipoId: string, userId: string) {
    const equipo = await this.resolveEquipoQuery(this.equipoModel.findById(equipoId));

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    this.assertUsuarioTieneAcceso(equipo, userId);

    return {
      lider: equipo.lider,
      miembros: equipo.miembros,
    };
  }

  // ✅ EXISTENTE: Crear equipo (mantén tu lógica original aquí)
  async create(dto: CreateEquipoDto, userId: string) {
    const nuevoEquipo = new this.equipoModel({
      nombre: dto.nombre,
      lider: userId,
      miembros: [userId],
    });
    return nuevoEquipo.save();
  }

  // ✅ EXISTENTE: Agregar miembro (mantén tu lógica original aquí)
  async addMiembro(equipoId: string, userId: string, requesterId: string) {
    const equipo = await this.getEquipoOrThrow(equipoId);

    if (!equipo) {
      return null;
    }

    this.assertRequesterEsLider(equipo, requesterId, 'agregar');

    const yaEsMiembro = equipo.miembros.some((m: any) => m.toString() === userId.toString());
    if (yaEsMiembro) {
      throw new ForbiddenException('El usuario ya es miembro del equipo');
    }

    equipo.miembros.push(userId as any);
    return equipo.save();
  }

  // ✅ EXISTENTE: Eliminar miembro (mantén tu lógica original aquí)
  async removeMiembro(equipoId: string, userId: string, requesterId: string) {
    const equipo = await this.getEquipoOrThrow(equipoId);
    this.assertRequesterEsLider(equipo, requesterId, 'eliminar');

    equipo.miembros = equipo.miembros.filter((m: any) => m.toString() !== userId.toString());
    return equipo.save();
  }
}