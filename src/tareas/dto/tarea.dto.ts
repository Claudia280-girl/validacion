import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTareaDto {
  @IsNotEmpty()
  titulo: string;

  descripcion?: string;

  @IsOptional()
  @IsString()
  proyectoId?: string;

  @IsOptional()
  @IsString()
  listaId?: string;

  @IsArray()
  @IsOptional()
  asignados?: string[];
}

export class MoverTareaDto {
  @IsString()
  nuevaListaId: string;
}


export class AsignarMiembrosDto {
  @IsArray()
  @IsString({ each: true })
  miembros: string[];
}
