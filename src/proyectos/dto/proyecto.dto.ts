import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProyectoDto {
  @IsNotEmpty()
  nombre: string;

  @IsString()
  equipoId: string;
}