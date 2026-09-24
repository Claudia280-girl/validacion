import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Tarea {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: Types.ObjectId, ref: 'Lista', required: true })
  lista: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Usuario' }])
  asignados: Types.ObjectId[];
}

export const TareaSchema = SchemaFactory.createForClass(Tarea);