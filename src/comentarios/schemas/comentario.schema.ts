import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Comentario {
  @Prop({ required: true })
  contenido: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tarea: Types.ObjectId;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);