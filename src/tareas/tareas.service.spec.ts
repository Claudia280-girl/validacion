import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TareasService } from './tareas.service';

describe('TareasService', () => {
  let service: TareasService;
  let tareaModel: any;
  let listaModel: any;
  let proyectoModel: any;
  let equipoModel: any;

  beforeEach(() => {
    tareaModel = { findById: jest.fn(), find: jest.fn() };
    listaModel = { find: jest.fn(), findById: jest.fn(), findOne: jest.fn() };
    proyectoModel = { findById: jest.fn() };
    equipoModel = { findById: jest.fn() };

    service = new TareasService(tareaModel as any, listaModel as any, proyectoModel as any, equipoModel as any);
  });

  it('findByProyecto debe lanzar NotFoundException si proyecto no existe', async () => {
    proyectoModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.findByProyecto('p1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('findByProyecto debe lanzar ForbiddenException si usuario no es miembro', async () => {
    const proyecto = { equipo: 'e1' };
    proyectoModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(proyecto) });
    equipoModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ lider: 'x', miembros: ['y'] }) });
    await expect(service.findByProyecto('p1', 'u1')).rejects.toThrow(ForbiddenException);
  });

  it('create debe lanzar NotFoundException si no envia proyectoId y lista no tiene proyecto', async () => {
    listaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.create({ titulo: 't', listaId: 'l1' } as any, 'u1')).rejects.toThrow(NotFoundException);
  });

  it('moverTarea lanza NotFoundException si tarea no existe', async () => {
    tareaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.moverTarea('t1', 'l2', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('asignarMiembros lanza NotFoundException si tarea no existe', async () => {
    tareaModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.asignarMiembros('t1', ['u2'], 'u1')).rejects.toThrow(NotFoundException);
  });
});
