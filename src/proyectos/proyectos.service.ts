import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proyecto } from './schemas/proyecto.schema';
import { Lista } from '../listas/schemas/lista.schema';
import { Equipo } from '../equipos/schemas/equipo.schema';
import { CreateProyectoDto } from './dto/proyecto.dto';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectModel(Proyecto.name) private proyectoModel: Model<Proyecto>,
    @InjectModel(Lista.name) private listaModel: Model<Lista>,
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
  ) {}

  // ✅ NUEVO: Obtener proyectos de un equipo
  async findByEquipo(equipoId: string, userId: string) {
    const equipo = await this.equipoModel.findById(equipoId).exec();

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este equipo');
    }

    const proyectos = await this.proyectoModel
      .find({ equipo: equipoId })
      .populate('equipo', 'nombre')
      .exec();

    return proyectos;
  }

  async findById(proyectoId: string, userId: string) {
    const proyecto = await this.proyectoModel
      .findById(proyectoId)
      .populate({
        path: 'equipo',
        select: 'nombre lider miembros',
        populate: [
          { path: 'lider', select: 'nombre email' },
          { path: 'miembros', select: 'nombre email' },
        ],
      })
      .exec();

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const equipo = proyecto.equipo as any;
    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some(
      (miembro: any) => miembro.toString() === userIdStr,
    );
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return proyecto;
  }

  // ✅ EXISTENTE: Crear proyecto (mantén tu lógica original aquí)
  async crearProyecto(dto: CreateProyectoDto, userId: string) {
    const equipo = await this.equipoModel.findById(dto.equipoId).exec();

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este equipo');
    }

    const nuevoProyecto = new this.proyectoModel({
      nombre: dto.nombre,
      equipo: dto.equipoId,
    });
    const proyectoGuardado = await nuevoProyecto.save();

    const listasDefault = [
      { nombre: 'Por Hacer', proyecto: proyectoGuardado._id },
      { nombre: 'En Progreso', proyecto: proyectoGuardado._id },
      { nombre: 'Hecho', proyecto: proyectoGuardado._id },
    ];

    await this.listaModel.insertMany(listasDefault);

    return proyectoGuardado;
  }
}