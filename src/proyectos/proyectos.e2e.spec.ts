import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';

// ========================
// PRUEBAS DE CAJA NEGRA - PROYECTOS (E2E)
// ========================
// Estas pruebas validan el comportamiento de los endpoints de proyectos
// desde la perspectiva del usuario (entrada/salida visible)

describe('Proyectos E2E Tests (Black Box)', () => {
  let service: ProyectosService;
  let proyectoModel: any;
  let listaModel: any;
  let equipoModel: any;

  beforeEach(() => {
    proyectoModel = jest.fn().mockImplementation(() => ({
      save: jest.fn(),
    }));

    listaModel = {
      insertMany: jest.fn(),
    };

    equipoModel = {
      findById: jest.fn(),
      find: jest.fn(),
    };

    service = new ProyectosService(
      proyectoModel as any,
      listaModel as any,
      equipoModel as any,
    );
  });

  // ========================
  // POST /proyectos - CREATE PROYECTO
  // ========================
  describe('Crear proyecto (Caja Negra)', () => {
    // Escenario 1: Crear proyecto exitosamente
    it('debe crear un proyecto y retornarlo con ID', async () => {
      const equipo = {
        _id: 'equipo-1',
        nombre: 'Backend Team',
        lider: 'user-1',
        miembros: ['user-1', 'user-2'],
      };

      const proyectoGuardado = {
        _id: 'proyecto-1',
        nombre: 'Q1 2025 Sprint',
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      const resultado = await service.crearProyecto(
        { nombre: 'Q1 2025 Sprint', equipoId: 'equipo-1' },
        'user-2',
      );

      expect(resultado).toHaveProperty('_id', 'proyecto-1');
      expect(resultado).toHaveProperty('nombre', 'Q1 2025 Sprint');
      expect(resultado).toHaveProperty('equipo', 'equipo-1');
    });

    // Escenario 2: Crear listas default automáticamente
    it('debe crear tres listas default (Por Hacer, En Progreso, Hecho)', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      const proyectoGuardado = {
        _id: 'proyecto-1',
        nombre: 'Sprint',
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      await service.crearProyecto(
        { nombre: 'Sprint', equipoId: 'equipo-1' },
        'user-1',
      );

      expect(listaModel.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ nombre: 'Por Hacer' }),
          expect.objectContaining({ nombre: 'En Progreso' }),
          expect.objectContaining({ nombre: 'Hecho' }),
        ]),
      );
    });

    // Escenario 3: Equipo no existe (404)
    it('debe retornar 404 si el equipo no existe', async () => {
      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.crearProyecto(
          { nombre: 'Sprint', equipoId: 'equipo-no-existe' },
          'user-1',
        );
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toBe('Equipo no encontrado');
      }
    });

    // Escenario 4: Usuario no pertenece al equipo (403)
    it('debe retornar 403 si el usuario no pertenece al equipo', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1', 'user-3'],
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });

      try {
        await service.crearProyecto(
          { nombre: 'Sprint', equipoId: 'equipo-1' },
          'user-2',
        );
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof ForbiddenException).toBe(true);
        expect(error.message).toBe('No tienes acceso a este equipo');
      }
    });

    // Escenario 5: Líder del equipo puede crear proyecto
    it('el líder del equipo debe poder crear proyectos', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      const proyectoGuardado = {
        _id: 'proyecto-2',
        nombre: 'Sprint 2',
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      const resultado = await service.crearProyecto(
        { nombre: 'Sprint 2', equipoId: 'equipo-1' },
        'user-1',
      );

      expect(resultado).toHaveProperty('_id');
      expect(listaModel.insertMany).toHaveBeenCalled();
    });

    // Escenario 6: No se crean listas si hay error de acceso
    it('no debe crear listas si el usuario no tiene acceso', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });

      try {
        await service.crearProyecto(
          { nombre: 'Sprint', equipoId: 'equipo-1' },
          'user-999',
        );
      } catch (error) {
        // Expected
      }

      expect(listaModel.insertMany).not.toHaveBeenCalled();
    });

    // Escenario 7: Nombre de proyecto vacío
    it('debe manejar nombres de proyecto vacíos', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      const proyectoGuardado = {
        _id: 'proyecto-1',
        nombre: '',
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      const resultado = await service.crearProyecto(
        { nombre: '', equipoId: 'equipo-1' },
        'user-1',
      );

      expect(resultado.nombre).toBe('');
    });
  });

  // ========================
  // GET /proyectos?equipoId=X - FIND BY EQUIPO
  // ========================
  describe('Obtener proyectos de equipo (Caja Negra)', () => {
    // Escenario 1: Obtener proyectos exitosamente
    it('debe retornar lista de proyectos del equipo', async () => {
      const equipo = {
        _id: 'equipo-1',
        nombre: 'Backend Team',
        lider: 'user-1',
        miembros: ['user-1', 'user-2'],
      };

      const proyectos = [
        {
          _id: 'proyecto-1',
          nombre: 'Sprint 1',
          equipo: 'equipo-1',
        },
        {
          _id: 'proyecto-2',
          nombre: 'Sprint 2',
          equipo: 'equipo-1',
        },
      ];

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });

      // Mock find para proyectos
      const mockFindQuery = {
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(proyectos),
        }),
      };
      
      proyectoModel.find = jest.fn().mockReturnValue(mockFindQuery);

      const resultado = await service.findByEquipo('equipo-1', 'user-1');

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toHaveProperty('nombre', 'Sprint 1');
      expect(resultado[1]).toHaveProperty('nombre', 'Sprint 2');
    });

    // Escenario 2: Equipo no existe (404)
    it('debe retornar 404 si el equipo no existe', async () => {
      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.findByEquipo('equipo-no-existe', 'user-1');
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof NotFoundException).toBe(true);
      }
    });

    // Escenario 3: Usuario no tiene acceso (403)
    it('debe retornar 403 si el usuario no tiene acceso al equipo', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });

      try {
        await service.findByEquipo('equipo-1', 'user-999');
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof ForbiddenException).toBe(true);
      }
    });

    // Escenario 4: Equipo sin proyectos
    it('debe retornar array vacío si el equipo no tiene proyectos', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });

      const mockFindQuery = {
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      };
      
      proyectoModel.find = jest.fn().mockReturnValue(mockFindQuery);

      const resultado = await service.findByEquipo('equipo-1', 'user-1');

      expect(resultado).toHaveLength(0);
    });
  });

  // ========================
  // GET /proyectos/:id - GET BY ID
  // ========================
  describe('Obtener proyecto por ID (Caja Negra)', () => {
    // Escenario 1: Obtener proyecto exitosamente
    it('debe retornar datos del proyecto con acceso', async () => {
      const proyecto = {
        _id: 'proyecto-1',
        nombre: 'Sprint 1',
        equipo: {
          _id: 'equipo-1',
          nombre: 'Backend Team',
          lider: 'user-1',
          miembros: ['user-1', 'user-2'],
        },
      };

      const mockFindByIdQuery = {
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(proyecto),
        }),
      };

      proyectoModel.findById = jest.fn().mockReturnValue(mockFindByIdQuery);

      const resultado = await service.findById('proyecto-1', 'user-1');

      expect(resultado).toHaveProperty('_id', 'proyecto-1');
      expect(resultado).toHaveProperty('nombre', 'Sprint 1');
    });

    // Escenario 2: Proyecto no existe (404)
    it('debe retornar 404 si el proyecto no existe', async () => {
      const mockFindByIdQuery = {
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      };

      proyectoModel.findById = jest.fn().mockReturnValue(mockFindByIdQuery);

      try {
        await service.findById('proyecto-no-existe', 'user-1');
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof NotFoundException).toBe(true);
      }
    });

    // Escenario 3: Usuario no tiene acceso (403)
    it('debe retornar 403 si el usuario no tiene acceso al proyecto', async () => {
      const proyecto = {
        _id: 'proyecto-1',
        nombre: 'Sprint 1',
        equipo: {
          _id: 'equipo-1',
          lider: 'user-1',
          miembros: ['user-1'],
        },
      };

      const mockFindByIdQuery = {
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(proyecto),
        }),
      };

      proyectoModel.findById = jest.fn().mockReturnValue(mockFindByIdQuery);

      try {
        await service.findById('proyecto-1', 'user-999');
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error instanceof ForbiddenException).toBe(true);
      }
    });
  });

  // ========================
  // Validaciones de entrada
  // ========================
  describe('Validaciones de entrada (Caja Negra)', () => {
    // IDs vacíos
    it('debe manejar equipoId vacío en crearProyecto', async () => {
      try {
        await service.crearProyecto(
          { nombre: 'Sprint', equipoId: '' },
          'user-1',
        );
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // Nombre con caracteres especiales
    it('debe aceptar nombres con caracteres especiales', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      const proyectoGuardado = {
        _id: 'proyecto-1',
        nombre: 'Sprint #1 & Q1 2025 (Updated)',
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      const resultado = await service.crearProyecto(
        { nombre: 'Sprint #1 & Q1 2025 (Updated)', equipoId: 'equipo-1' },
        'user-1',
      );

      expect(resultado.nombre).toBe('Sprint #1 & Q1 2025 (Updated)');
    });

    // Nombre muy largo
    it('debe aceptar nombres muy largos', async () => {
      const equipo = {
        _id: 'equipo-1',
        lider: 'user-1',
        miembros: ['user-1'],
      };

      const longName = 'a'.repeat(500);
      const proyectoGuardado = {
        _id: 'proyecto-1',
        nombre: longName,
        equipo: 'equipo-1',
      };

      const proyectoInstance = {
        save: jest.fn().mockResolvedValue(proyectoGuardado),
      };

      equipoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(equipo),
      });
      proyectoModel.mockImplementation(() => proyectoInstance);
      listaModel.insertMany.mockResolvedValue([]);

      const resultado = await service.crearProyecto(
        { nombre: longName, equipoId: 'equipo-1' },
        'user-1',
      );

      expect(resultado.nombre).toBe(longName);
    });
  });
});
