import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';

// Principios FIRST aplicados:
// - Fast: no uso de BD real ni red.
// - Isolated: cada caso crea su propio estado.
// - Repeatable: datos deterministas.
// - Self-validating: cada prueba hace assert explícito.
// - Timely: cubre los comportamientos críticos de negocio.
//
// Tipo de mock:
// - Fake: proyectoInstance simula el documento a guardar.
// - Stub: equipoModel.findById devuelve valores controlados.
// - Spy: observamos que insertMany se invoca con los valores esperados.

describe('ProyectosService - crearProyecto', () => {
  let service: ProyectosService;
  let proyectoModelMock: any;
  let listaModelMock: { insertMany: jest.Mock };
  let equipoModelMock: { findById: jest.Mock };

  beforeEach(() => {
    proyectoModelMock = jest.fn().mockImplementation(() => ({
      save: jest.fn(),
    }));

    listaModelMock = {
      insertMany: jest.fn(),
    };

    equipoModelMock = {
      findById: jest.fn(),
    };

    service = new ProyectosService(
      proyectoModelMock as any,
      listaModelMock as any,
      equipoModelMock as any,
    );
  });

  it('debe crear un proyecto cuando el usuario es miembro del equipo', async () => {
    // Arrange
    const equipo = { lider: 'user-1', miembros: ['user-1', 'user-2'] };
    const proyectoGuardado = { _id: 'proyecto-1', nombre: 'Sprint 1', equipo: 'equipo-1' };
    const proyectoInstanceFake = { save: jest.fn().mockResolvedValue(proyectoGuardado) };

    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });
    proyectoModelMock.mockImplementation(() => proyectoInstanceFake);
    listaModelMock.insertMany.mockResolvedValue([]);

    // Act
    const resultado = await service.crearProyecto(
      { nombre: 'Sprint 1', equipoId: 'equipo-1' },
      'user-2',
    );

    // Assert
    expect(equipoModelMock.findById).toHaveBeenCalledWith('equipo-1');
    expect(proyectoInstanceFake.save).toHaveBeenCalledTimes(1);
    expect(listaModelMock.insertMany).toHaveBeenCalledWith([
      { nombre: 'Por Hacer', proyecto: 'proyecto-1' },
      { nombre: 'En Progreso', proyecto: 'proyecto-1' },
      { nombre: 'Hecho', proyecto: 'proyecto-1' },
    ]);
    expect(resultado).toEqual(proyectoGuardado);
  });

  it('debe crear un proyecto cuando el usuario es líder del equipo', async () => {
    // Arrange
    const equipo = { lider: 'user-1', miembros: ['user-1'] };
    const proyectoGuardado = { _id: 'proyecto-2', nombre: 'Sprint 2', equipo: 'equipo-1' };
    const proyectoInstanceFake = { save: jest.fn().mockResolvedValue(proyectoGuardado) };

    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });
    proyectoModelMock.mockImplementation(() => proyectoInstanceFake);
    listaModelMock.insertMany.mockResolvedValue([]);

    // Act
    const resultado = await service.crearProyecto(
      { nombre: 'Sprint 2', equipoId: 'equipo-1' },
      'user-1',
    );

    // Assert
    expect(proyectoInstanceFake.save).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(proyectoGuardado);
  });

  it('debe lanzar NotFoundException si el equipo no existe', async () => {
    // Arrange
    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    // Act + Assert
    await expect(
      service.crearProyecto({ nombre: 'Sprint 1', equipoId: 'equipo-404' }, 'user-2'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.crearProyecto({ nombre: 'Sprint 1', equipoId: 'equipo-404' }, 'user-2'),
    ).rejects.toThrow('Equipo no encontrado');
  });

  it('debe lanzar ForbiddenException si el usuario no pertenece al equipo', async () => {
    // Arrange
    const equipo = { lider: 'user-1', miembros: ['user-3'] };
    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });

    // Act + Assert
    await expect(
      service.crearProyecto({ nombre: 'Sprint 1', equipoId: 'equipo-1' }, 'user-2'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.crearProyecto({ nombre: 'Sprint 1', equipoId: 'equipo-1' }, 'user-2'),
    ).rejects.toThrow('No tienes acceso a este equipo');
    expect(listaModelMock.insertMany).not.toHaveBeenCalled();
  });

  it('debe crear las tres listas por defecto al guardar un proyecto', async () => {
    // Arrange
    const equipo = { lider: 'user-1', miembros: ['user-1', 'user-2'] };
    const proyectoGuardado = { _id: 'proyecto-xyz', nombre: 'Test Project', equipo: 'equipo-1' };
    const proyectoInstanceFake = { save: jest.fn().mockResolvedValue(proyectoGuardado) };

    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });
    proyectoModelMock.mockImplementation(() => proyectoInstanceFake);
    listaModelMock.insertMany.mockResolvedValue([]);

    // Act
    await service.crearProyecto({ nombre: 'Test Project', equipoId: 'equipo-1' }, 'user-2');

    // Assert
    expect(listaModelMock.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ nombre: 'Por Hacer' }),
        expect.objectContaining({ nombre: 'En Progreso' }),
        expect.objectContaining({ nombre: 'Hecho' }),
      ]),
    );
  });

  it('debe guardar el proyecto antes de insertar las listas por defecto', async () => {
    // Arrange
    const equipo = { lider: 'user-1', miembros: ['user-1'] };
    const proyectoGuardado = { _id: 'proyecto-guardado-123', nombre: 'Orden de operaciones', equipo: 'equipo-1' };
    const proyectoInstanceFake = { save: jest.fn().mockResolvedValue(proyectoGuardado) };
    let saveWasCalled = false;
    let insertManyWasCalled = false;

    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });
    proyectoModelMock.mockImplementation(() => proyectoInstanceFake);
    proyectoInstanceFake.save.mockImplementation(() => {
      saveWasCalled = true;
      expect(insertManyWasCalled).toBe(false);
      return Promise.resolve(proyectoGuardado);
    });
    listaModelMock.insertMany.mockImplementation(() => {
      insertManyWasCalled = true;
      expect(saveWasCalled).toBe(true);
      return Promise.resolve([]);
    });

    // Act
    await service.crearProyecto({ nombre: 'Orden de operaciones', equipoId: 'equipo-1' }, 'user-1');

    // Assert
    expect(saveWasCalled).toBe(true);
    expect(insertManyWasCalled).toBe(true);
  });

  it('debe manejar ObjectId como string en los miembros del equipo', async () => {
    // Arrange
    const equipo = {
      lider: new String('507f1f77bcf86cd799439011'),
      miembros: [
        new String('507f1f77bcf86cd799439011'),
        new String('507f1f77bcf86cd799439012'),
      ],
    };
    const proyectoGuardado = { _id: 'proyecto-1', nombre: 'Sprint 1', equipo: 'equipo-1' };
    const proyectoInstanceFake = { save: jest.fn().mockResolvedValue(proyectoGuardado) };

    equipoModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(equipo) });
    proyectoModelMock.mockImplementation(() => proyectoInstanceFake);
    listaModelMock.insertMany.mockResolvedValue([]);

    // Act
    const resultado = await service.crearProyecto(
      { nombre: 'Sprint 1', equipoId: 'equipo-1' },
      '507f1f77bcf86cd799439012',
    );

    // Assert
    expect(resultado).toEqual(proyectoGuardado);
  });
});
