import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Lista } from './schemas/lista.schema';

@Injectable()
export class ListasService {
  constructor(
    @InjectModel(Lista.name) private readonly listaModel: Model<Lista>,
  ) {}


  async obtenerListasPorProyecto(proyectoId: string): Promise<Lista[]> {
   
    const id = new mongoose.Types.ObjectId(proyectoId);

    const listas = await this.listaModel.find({ proyecto: id }).exec();

    if (!listas || listas.length === 0) {
      throw new NotFoundException('No se encontraron listas para este proyecto');
    }

    return listas;
  }
}
