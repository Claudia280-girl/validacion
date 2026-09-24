import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EquiposService } from './equipos.service';

// Principios FIRST aplicados:
// - Fast: pruebas unitarias sin I/O real.
// - Isolated: cada prueba monta su propio equipo.
// - Repeatable: no dependen del orden ni de estado global.
// - Self-validating: cada caso termina con asserts concretos.
// - Timely: cubren los flujos críticos del servicio.
//
// Tipo de mock:
// - Stub: equipoModel.findById devuelve datos controlados.
// - Fake: save simula persistencia en memoria.
// - Spy: comprobamos si se invoca save y con qué contenido.

describe('EquiposService - addMiembro', () => {
  let service: EquiposService;
  let equipoModelMock: { findById: jest.Mock };

  beforeEach(() => {
    equipoModelMock = {
      findById: jest.fn(),
    };

    service = new EquiposService(equipoModelMock as any);
  });

  it('debe agregar un miembro cuando el solicitante es el líder', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1'],
      save: jest.fn().mockResolvedValue({
        lider: 'user-1',
        miembros: ['user-1', 'user-2'],
      }),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act
    const resultado = await service.addMiembro('equipo-1', 'user-2', 'user-1');

    // Assert
    expect(equipoModelMock.findById).toHaveBeenCalledWith('equipo-1');
    expect(equipo.miembros).toContain('user-2');
    expect(equipo.save).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      lider: 'user-1',
      miembros: ['user-1', 'user-2'],
    });
  });

  it('debe lanzar NotFoundException si el equipo no existe', async () => {
    // Arrange
    equipoModelMock.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.addMiembro('equipo-404', 'user-2', 'user-1')).rejects.toThrow(NotFoundException);
    await expect(service.addMiembro('equipo-404', 'user-2', 'user-1')).rejects.toThrow('Equipo no encontrado');
  });

  it('debe lanzar ForbiddenException si el solicitante no es el líder', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1'],
      save: jest.fn(),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act + Assert
    await expect(service.addMiembro('equipo-1', 'user-2', 'user-3')).rejects.toThrow(ForbiddenException);
    await expect(service.addMiembro('equipo-1', 'user-2', 'user-3')).rejects.toThrow('Solo el líder puede agregar miembros');
    expect(equipo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar ForbiddenException si el usuario ya es miembro', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2'],
      save: jest.fn(),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act + Assert
    await expect(service.addMiembro('equipo-1', 'user-2', 'user-1')).rejects.toThrow(ForbiddenException);
    await expect(service.addMiembro('equipo-1', 'user-2', 'user-1')).rejects.toThrow('El usuario ya es miembro del equipo');
    expect(equipo.save).not.toHaveBeenCalled();
  });

  it('debe validar que el líder es quien autoriza la operación antes de persistir cambios', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2'],
      save: jest.fn(),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act + Assert
    await expect(service.addMiembro('equipo-1', 'user-2', 'user-3')).rejects.toThrow('Solo el líder puede agregar miembros');
    expect(equipo.save).not.toHaveBeenCalled();
  });

  it('debe permitir múltiples inserciones consecutivas en el mismo equipo', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1'],
      save: jest.fn()
        .mockResolvedValueOnce({ lider: 'user-1', miembros: ['user-1', 'user-2'] })
        .mockResolvedValueOnce({ lider: 'user-1', miembros: ['user-1', 'user-2', 'user-3'] }),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act
    await service.addMiembro('equipo-1', 'user-2', 'user-1');
    equipo.miembros = ['user-1', 'user-2'];
    await service.addMiembro('equipo-1', 'user-3', 'user-1');

    // Assert
    expect(equipo.save).toHaveBeenCalledTimes(2);
  });
});
