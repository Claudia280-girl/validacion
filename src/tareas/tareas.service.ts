import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Tarea } from './schemas/tarea.schema';
import { Lista } from '../listas/schemas/lista.schema';
import { Proyecto } from '../proyectos/schemas/proyecto.schema';
import { Equipo } from '../equipos/schemas/equipo.schema';
import { CreateTareaDto } from './dto/tarea.dto';

@Injectable()
export class TareasService {
  constructor(
    @InjectModel(Tarea.name) private tareaModel: Model<Tarea>,
    @InjectModel(Lista.name) private listaModel: Model<Lista>,
    @InjectModel(Proyecto.name) private proyectoModel: Model<Proyecto>,
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>
  ) {}

  // Nuevo: Obtener todas las tareas de un proyecto
  async findByProyecto(proyectoId: string, userId: string) {
    const proyecto = await this.proyectoModel.findById(proyectoId).exec();
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const equipo = await this.equipoModel.findById(proyecto.equipo).exec();
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const proyectoObjectId = new mongoose.Types.ObjectId(proyectoId);
    const listas = await this.listaModel.find({ proyecto: proyectoObjectId }).exec();
    const listaIds = listas.map((lista: any) => lista._id);

    const tareas = await this.tareaModel
      .find({ lista: { $in: listaIds } })
      .populate('lista', 'nombre')
      .populate('asignados', 'nombre email')
      .exec();

    return tareas;
  }

  async create(dto: CreateTareaDto, userId: string) {
    const proyectoId = dto.proyectoId || (await this.listaModel.findById(dto.listaId).exec())?.proyecto?.toString();
    if (!proyectoId) {
      throw new NotFoundException('Debes enviar proyectoId o listaId');
    }

    const proyecto = await this.proyectoModel.findById(proyectoId).exec();
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const equipo = await this.equipoModel.findById(proyecto.equipo).exec();
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const proyectoObjectId = new mongoose.Types.ObjectId(proyectoId);
    const lista = dto.listaId
      ? await this.listaModel.findById(dto.listaId).exec()
      : await this.listaModel.findOne({ proyecto: proyectoObjectId }).sort({ _id: 1 }).exec();

    if (!lista) {
      throw new NotFoundException('No hay listas creadas para este proyecto');
    }

    const tarea = new this.tareaModel({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      lista: lista._id,
      asignados: dto.asignados || [],
    });

    return tarea.save();
  }

  async moverTarea(tareaId: string, nuevaListaId: string, userId: string) {
    const tarea = await this.tareaModel.findById(tareaId).exec();
    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const listaDestino = await this.listaModel.findById(nuevaListaId).exec();
    if (!listaDestino) {
      throw new NotFoundException('Lista destino no encontrada');
    }

    const proyecto = await this.proyectoModel.findById(listaDestino.proyecto).exec();
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const equipo = await this.equipoModel.findById(proyecto.equipo).exec();
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a esta tarea');
    }

    tarea.lista = nuevaListaId as any;
    return tarea.save();
  }

  async asignarMiembros(tareaId: string, miembros: string[], userId: string) {
    const tarea = await this.tareaModel.findById(tareaId).exec();
    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const lista = await this.listaModel.findById(tarea.lista).exec();
    if (!lista) {
      throw new NotFoundException('Lista no encontrada');
    }

    const proyecto = await this.proyectoModel.findById(lista.proyecto).exec();
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const equipo = await this.equipoModel.findById(proyecto.equipo).exec();
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const userIdStr = userId.toString();
    const esMiembro = equipo.miembros.some((miembro: any) => miembro.toString() === userIdStr);
    const esLider = equipo.lider.toString() === userIdStr;

    if (!esMiembro && !esLider) {
      throw new ForbiddenException('No tienes acceso a esta tarea');
    }

    tarea.asignados = miembros as any;
    return tarea.save();
  }
}