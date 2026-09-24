import { NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioModelMock: any;

  beforeEach(() => {
    usuarioModelMock = jest.fn().mockImplementation(() => ({ save: jest.fn() }));
    usuarioModelMock.findById = jest.fn();
    usuarioModelMock.findOne = jest.fn();

    service = new UsuariosService(usuarioModelMock as any);
  });

  it('create debe guardar y devolver el usuario', async () => {
    const usuarioGuardado = { _id: 'u1', nombre: 'A', email: 'a@a.com' };
    const instance = { save: jest.fn().mockResolvedValue(usuarioGuardado) };
    usuarioModelMock.mockImplementation(() => instance);

    const res = await service.create({ nombre: 'A', email: 'a@a.com', password: 'x' });
    expect(instance.save).toHaveBeenCalled();
    expect(res).toEqual(usuarioGuardado);
  });

  it('findById lanza NotFoundException si no existe', async () => {
    usuarioModelMock.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findById('no-existe')).rejects.toThrow(NotFoundException);
  });

  it('findByEmail devuelve usuario sin contraseña', async () => {
    const usuario = { _id: 'u2', nombre: 'B', email: 'b@b.com' };
    usuarioModelMock.findOne.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(usuario) }) });
    const res = await service.findByEmail('b@b.com');
    expect(res).toEqual(usuario);
  });
});
