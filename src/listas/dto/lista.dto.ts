import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListaDto {
  @IsNotEmpty()
  nombre: string;

  @IsString()
  proyectoId: string;
}