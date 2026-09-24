import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EquiposService } from './equipos.service';

// Principios FIRST aplicados:
// - Fast: no hay acceso externo ni persistencia real.
// - Isolated: cada caso trabaja con un equipo independiente.
// - Repeatable: no depende del orden de ejecución.
// - Self-validating: cada prueba tiene expectativas directas.
// - Timely: cubre las reglas de negocio esenciales del servicio.
//
// Tipo de mock:
// - Stub: equipoModel.findById devuelve un equipo o null.
// - Fake: save simula la persistencia en memoria.
// - Spy: valida que save fue llamado y cuántas veces.

describe('EquiposService - removeMiembro', () => {
  let service: EquiposService;
  let equipoModelMock: { findById: jest.Mock };

  beforeEach(() => {
    equipoModelMock = {
      findById: jest.fn(),
    };

    service = new EquiposService(equipoModelMock as any);
  });

  it('debe eliminar un miembro cuando el solicitante es el líder', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2', 'user-3'],
      save: jest.fn().mockResolvedValue({
        lider: 'user-1',
        miembros: ['user-1', 'user-3'],
      }),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act
    const resultado = await service.removeMiembro('equipo-1', 'user-2', 'user-1');

    // Assert
    expect(equipoModelMock.findById).toHaveBeenCalledWith('equipo-1');
    expect(equipo.miembros).toEqual(['user-1', 'user-3']);
    expect(equipo.save).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      lider: 'user-1',
      miembros: ['user-1', 'user-3'],
    });
  });

  it('debe lanzar NotFoundException si el equipo no existe', async () => {
    // Arrange
    equipoModelMock.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.removeMiembro('equipo-404', 'user-2', 'user-1')).rejects.toThrow(NotFoundException);
    await expect(service.removeMiembro('equipo-404', 'user-2', 'user-1')).rejects.toThrow('Equipo no encontrado');
  });

  it('debe lanzar ForbiddenException si el solicitante no es el líder', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2'],
      save: jest.fn(),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act + Assert
    await expect(service.removeMiembro('equipo-1', 'user-2', 'user-3')).rejects.toThrow(ForbiddenException);
    await expect(service.removeMiembro('equipo-1', 'user-2', 'user-3')).rejects.toThrow('Solo el líder puede eliminar miembros');
    expect(equipo.save).not.toHaveBeenCalled();
  });

  it('debe manejar correctamente la eliminación de un usuario que no es miembro', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2'],
      save: jest.fn().mockResolvedValue({
        lider: 'user-1',
        miembros: ['user-1', 'user-2'],
      }),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act
    const resultado = await service.removeMiembro('equipo-1', 'user-999', 'user-1');

    // Assert
    expect(equipo.save).toHaveBeenCalledTimes(1);
    expect(resultado.miembros).toEqual(['user-1', 'user-2']);
  });

  it('debe permitir múltiples eliminaciones consecutivas del mismo equipo', async () => {
    // Arrange
    const equipo = {
      lider: 'user-1',
      miembros: ['user-1', 'user-2', 'user-3', 'user-4'],
      save: jest.fn()
        .mockResolvedValueOnce({ lider: 'user-1', miembros: ['user-1', 'user-3', 'user-4'] })
        .mockResolvedValueOnce({ lider: 'user-1', miembros: ['user-1', 'user-4'] }),
    };
    equipoModelMock.findById.mockResolvedValue(equipo);

    // Act
    await service.removeMiembro('equipo-1', 'user-2', 'user-1');
    equipo.miembros = ['user-1', 'user-3', 'user-4'];
    await service.removeMiembro('equipo-1', 'user-3', 'user-1');

    // Assert
    expect(equipo.save).toHaveBeenCalledTimes(2);
  });
});
