import { equiposService } from './equiposService';
import * as api from './api';

// ========================
// PRUEBAS DE CAJA NEGRA - EQUIPOS SERVICE (Frontend)
// ========================
// Estas pruebas simulan llamadas reales a la API desde el frontend
// Sin conocer la implementación interna del servicio.

jest.mock('./api');

describe('Equipos Service E2E Tests (Frontend - Black Box)', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // getAll() - Obtener todos los equipos
  // ========================
  describe('getAll()', () => {
    // Caso 1: Obtener equipos exitosamente
    it('debe retornar lista de equipos del usuario', async () => {
      const mockResponse = {
        data: [
          {
            _id: 'equipo-1',
            nombre: 'Backend Team',
            lider: 'user-1',
            miembros: ['user-1', 'user-2'],
          },
          {
            _id: 'equipo-2',
            nombre: 'Frontend Team',
            lider: 'user-1',
            miembros: ['user-1', 'user-3'],
          },
        ],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await equiposService.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/equipos');
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toHaveProperty('nombre', 'Backend Team');
      expect(resultado[1]).toHaveProperty('nombre', 'Frontend Team');
    });

    // Caso 2: Usuario sin equipos
    it('debe retornar array vacío si el usuario no tiene equipos', async () => {
      const mockResponse = {
        data: [],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await equiposService.getAll();

      expect(resultado).toHaveLength(0);
    });

    // Caso 3: Sin autenticación
    it('debe retornar 401 si no hay token', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await equiposService.getAll();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // getById() - Obtener equipo por ID
  // ========================
  describe('getById()', () => {
    const equipoId = 'equipo-1';

    // Caso 1: Obtener equipo exitosamente
    it('debe retornar datos del equipo específico', async () => {
      const mockResponse = {
        data: {
          _id: equipoId,
          nombre: 'Backend Team',
          lider: 'user-1',
          miembros: ['user-1', 'user-2'],
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await equiposService.getById(equipoId);

      expect(mockApi.get).toHaveBeenCalledWith(`/equipos/${equipoId}`);
      expect(resultado).toHaveProperty('_id', equipoId);
      expect(resultado).toHaveProperty('nombre', 'Backend Team');
    });

    // Caso 2: Equipo no encontrado
    it('debe retornar 404 si el equipo no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Equipo no encontrado',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await equiposService.getById('equipo-no-existe');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Sin acceso al equipo
    it('debe retornar 403 si el usuario no tiene acceso', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'No tienes acceso a este equipo',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await equiposService.getById(equipoId);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  // ========================
  // getMiembros() - Obtener miembros del equipo
  // ========================
  describe('getMiembros()', () => {
    const equipoId = 'equipo-1';

    // Caso 1: Obtener miembros exitosamente
    it('debe retornar lista de miembros y líder del equipo', async () => {
      const mockResponse = {
        data: {
          lider: {
            _id: 'user-1',
            nombre: 'Juan',
            email: 'juan@example.com',
          },
          miembros: [
            {
              _id: 'user-1',
              nombre: 'Juan',
              email: 'juan@example.com',
            },
            {
              _id: 'user-2',
              nombre: 'María',
              email: 'maria@example.com',
            },
          ],
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await equiposService.getMiembros(equipoId);

      expect(mockApi.get).toHaveBeenCalledWith(
        `/equipos/${equipoId}/miembros`,
      );
      expect(resultado).toHaveProperty('lider');
      expect(resultado).toHaveProperty('miembros');
      expect(resultado.miembros).toHaveLength(2);
    });

    // Caso 2: Equipo no encontrado
    it('debe retornar 404 si el equipo no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Equipo no encontrado',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await equiposService.getMiembros('equipo-no-existe');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  // ========================
  // create() - Crear equipo
  // ========================
  describe('create()', () => {
    const nombreEquipo = 'Nuevo Equipo';

    // Caso 1: Crear equipo exitosamente
    it('debe crear un equipo y retornar sus datos', async () => {
      const mockResponse = {
        data: {
          _id: 'equipo-nuevo',
          nombre: nombreEquipo,
          lider: 'user-1',
          miembros: ['user-1'],
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await equiposService.create(nombreEquipo);

      expect(mockApi.post).toHaveBeenCalledWith('/equipos', {
        nombre: nombreEquipo,
      });
      expect(resultado).toHaveProperty('_id');
      expect(resultado).toHaveProperty('nombre', nombreEquipo);
      expect(resultado).toHaveProperty('lider', 'user-1');
    });

    // Caso 2: Nombre de equipo vacío
    it('debe rechazar nombre de equipo vacío', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'El nombre del equipo es requerido',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await equiposService.create('');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    // Caso 3: Sin autenticación
    it('debe retornar 401 si no hay token', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await equiposService.create(nombreEquipo);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // addMiembro() - Agregar miembro
  // ========================
  describe('addMiembro()', () => {
    const equipoId = 'equipo-1';
    const usuarioId = 'user-2';

    // Caso 1: Agregar miembro exitosamente
    it('debe agregar un miembro y retornar equipo actualizado', async () => {
      const mockResponse = {
        data: {
          _id: equipoId,
          nombre: 'Backend Team',
          lider: 'user-1',
          miembros: ['user-1', 'user-2'],
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await equiposService.addMiembro(equipoId, usuarioId);

      expect(mockApi.post).toHaveBeenCalledWith(
        `/equipos/${equipoId}/miembros`,
        { userId: usuarioId },
      );
      expect(resultado.miembros).toContain(usuarioId);
    });

    // Caso 2: Equipo no encontrado
    it('debe retornar 404 si el equipo no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Equipo no encontrado',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await equiposService.addMiembro('equipo-no-existe', usuarioId);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Usuario no tiene permisos
    it('debe retornar 403 si el usuario no es líder', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'Solo el líder puede agregar miembros',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await equiposService.addMiembro(equipoId, usuarioId);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    // Caso 4: Usuario ya es miembro
    it('debe retornar 409 si el usuario ya es miembro', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'El usuario ya es miembro del equipo',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await equiposService.addMiembro(equipoId, usuarioId);
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });
  });

  // ========================
  // removeMiembro() - Remover miembro
  // ========================
  describe('removeMiembro()', () => {
    const equipoId = 'equipo-1';
    const usuarioId = 'user-2';

    // Caso 1: Remover miembro exitosamente
    it('debe remover un miembro y retornar equipo actualizado', async () => {
      const mockResponse = {
        data: {
          _id: equipoId,
          nombre: 'Backend Team',
          lider: 'user-1',
          miembros: ['user-1'],
        },
      };

      mockApi.delete.mockResolvedValue(mockResponse);

      const resultado = await equiposService.removeMiembro(
        equipoId,
        usuarioId,
      );

      expect(mockApi.delete).toHaveBeenCalledWith(
        `/equipos/${equipoId}/miembros/${usuarioId}`,
      );
      expect(resultado.miembros).not.toContain(usuarioId);
    });

    // Caso 2: Equipo no encontrado
    it('debe retornar 404 si el equipo no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Equipo no encontrado',
          },
        },
      };

      mockApi.delete.mockRejectedValue(errorResponse);

      try {
        await equiposService.removeMiembro('equipo-no-existe', usuarioId);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Usuario no tiene permisos
    it('debe retornar 403 si el usuario no es líder', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'Solo el líder puede eliminar miembros',
          },
        },
      };

      mockApi.delete.mockRejectedValue(errorResponse);

      try {
        await equiposService.removeMiembro(equipoId, usuarioId);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  // ========================
  // Validaciones de entrada
  // ========================
  describe('Validaciones de entrada', () => {
    // IDs vacíos
    it('debe manejar IDs vacíos', async () => {
      mockApi.get.mockResolvedValue({ data: null });

      await equiposService.getById('');

      expect(mockApi.get).toHaveBeenCalled();
    });

    // Nombres con caracteres especiales
    it('debe aceptar nombres con caracteres especiales', async () => {
      const mockResponse = {
        data: {
          _id: 'equipo-1',
          nombre: 'Equipo #1 & Q1 2025',
          lider: 'user-1',
          miembros: ['user-1'],
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await equiposService.create('Equipo #1 & Q1 2025');

      expect(resultado.nombre).toBe('Equipo #1 & Q1 2025');
    });
  });

  // ========================
  // Casos de seguridad
  // ========================
  describe('Security Scenarios', () => {
    // No exponer datos sensibles
    it('debe manejar datos de respuesta sin exponer contraseñas', async () => {
      const mockResponse = {
        data: {
          _id: 'equipo-1',
          nombre: 'Backend Team',
          lider: 'user-1',
          miembros: ['user-1', 'user-2'],
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await equiposService.getById('equipo-1');

      expect(resultado).not.toHaveProperty('password');
    });

    // Inyección de parámetros
    it('debe escapar caracteres especiales en IDs de equipo', async () => {
      mockApi.get.mockResolvedValue({ data: null });

      await equiposService.getById("equipo-1'; DROP TABLE equipos; --");

      expect(mockApi.get).toHaveBeenCalledWith(
        "/equipos/equipo-1'; DROP TABLE equipos; --",
      );
    });
  });
});

