import { NotFoundException } from '@nestjs/common';
import { ListasService } from './listas.service';

describe('ListasService', () => {
  let service: ListasService;
  let listaModelMock: any;

  beforeEach(() => {
    listaModelMock = { find: jest.fn(), findById: jest.fn(), findOne: jest.fn() };
    service = new ListasService(listaModelMock as any);
  });

  it('obtenerListasPorProyecto debe devolver listas cuando existen', async () => {
    const listas = [{ _id: 'l1' }, { _id: 'l2' }];
    listaModelMock.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(listas) });

    const res = await service.obtenerListasPorProyecto('507f1f77bcf86cd799439011');
    expect(res).toEqual(listas);
    expect(listaModelMock.find).toHaveBeenCalled();
  });

  it('obtenerListasPorProyecto lanza NotFoundException si no hay listas', async () => {
    listaModelMock.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    await expect(service.obtenerListasPorProyecto('507f1f77bcf86cd799439012')).rejects.toThrow(NotFoundException);
  });
});
