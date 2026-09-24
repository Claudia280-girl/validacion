import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Equipo {
  @Prop({ required: true })
  nombre: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  lider: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Usuario' }])
  miembros: Types.ObjectId[];
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);