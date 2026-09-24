import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Lista extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ type: Types.ObjectId, ref: 'Proyecto', required: true })
  proyecto: Types.ObjectId;
}

export const ListaSchema = SchemaFactory.createForClass(Lista);
