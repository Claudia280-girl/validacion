import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Proyecto {
  @Prop({ required: true })
  nombre: string;

  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  equipo: Types.ObjectId;
}

export const ProyectoSchema = SchemaFactory.createForClass(Proyecto);