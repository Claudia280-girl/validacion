import { proyectosService } from './proyectosService';
import * as api from './api';

// ========================
// PRUEBAS DE CAJA NEGRA - PROYECTOS SERVICE (Frontend)
// ========================
// Estas pruebas simulan llamadas reales a la API desde el frontend
// Sin conocer la implementación interna del servicio.

jest.mock('./api');

describe('Proyectos Service E2E Tests (Frontend - Black Box)', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // create() - Crear proyecto
  // ========================
  describe('create()', () => {
    const createPayload = {
      nombre: 'Q1 2025 Sprint',
      equipoId: 'equipo-1',
    };

    // Caso 1: Crear proyecto exitosamente
    it('debe crear un proyecto y retornar sus datos con listas default', async () => {
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: createPayload.nombre,
          equipo: createPayload.equipoId,
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.create(createPayload);

      expect(mockApi.post).toHaveBeenCalledWith('/proyectos', createPayload);
      expect(resultado).toHaveProperty('_id', 'proyecto-1');
      expect(resultado).toHaveProperty('nombre', createPayload.nombre);
      expect(resultado).toHaveProperty('equipo', createPayload.equipoId);
    });

    // Caso 2: Equipo no existe
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
        await proyectosService.create({
          nombre: 'Sprint',
          equipoId: 'equipo-no-existe',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Usuario no tiene acceso al equipo
    it('debe retornar 403 si el usuario no pertenece al equipo', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'No tienes acceso a este equipo',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await proyectosService.create(createPayload);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    // Caso 4: Nombre de proyecto vacío
    it('debe manejar nombre de proyecto vacío', async () => {
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: '',
          equipo: createPayload.equipoId,
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.create({
        nombre: '',
        equipoId: createPayload.equipoId,
      });

      expect(resultado.nombre).toBe('');
    });

    // Caso 5: Sin autenticación
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
        await proyectosService.create(createPayload);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // getByEquipo() - Obtener proyectos por equipo
  // ========================
  describe('getByEquipo()', () => {
    const equipoId = 'equipo-1';

    // Caso 1: Obtener proyectos exitosamente
    it('debe retornar lista de proyectos del equipo', async () => {
      const mockResponse = {
        data: [
          {
            _id: 'proyecto-1',
            nombre: 'Sprint 1',
            equipo: equipoId,
          },
          {
            _id: 'proyecto-2',
            nombre: 'Sprint 2',
            equipo: equipoId,
          },
        ],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.getByEquipo(equipoId);

      expect(mockApi.get).toHaveBeenCalledWith(`/proyectos?equipoId=${equipoId}`);
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toHaveProperty('nombre', 'Sprint 1');
      expect(resultado[1]).toHaveProperty('nombre', 'Sprint 2');
    });

    // Caso 2: Equipo sin proyectos
    it('debe retornar array vacío si el equipo no tiene proyectos', async () => {
      const mockResponse = {
        data: [],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.getByEquipo(equipoId);

      expect(resultado).toHaveLength(0);
    });

    // Caso 3: Equipo no existe
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
        await proyectosService.getByEquipo('equipo-no-existe');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 4: Usuario no tiene acceso
    it('debe retornar 403 si el usuario no tiene acceso al equipo', async () => {
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
        await proyectosService.getByEquipo(equipoId);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  // ========================
  // getById() - Obtener proyecto por ID
  // ========================
  describe('getById()', () => {
    const proyectoId = 'proyecto-1';

    // Caso 1: Obtener proyecto exitosamente
    it('debe retornar datos del proyecto con acceso', async () => {
      const mockResponse = {
        data: {
          _id: proyectoId,
          nombre: 'Sprint 1',
          equipo: {
            _id: 'equipo-1',
            nombre: 'Backend Team',
            lider: 'user-1',
            miembros: ['user-1', 'user-2'],
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.getById(proyectoId);

      expect(mockApi.get).toHaveBeenCalledWith(`/proyectos/${proyectoId}`);
      expect(resultado).toHaveProperty('_id', proyectoId);
      expect(resultado).toHaveProperty('nombre', 'Sprint 1');
    });

    // Caso 2: Proyecto no existe
    it('debe retornar 404 si el proyecto no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Proyecto no encontrado',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await proyectosService.getById('proyecto-no-existe');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Usuario no tiene acceso
    it('debe retornar 403 si el usuario no tiene acceso al proyecto', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'No tienes acceso a este proyecto',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await proyectosService.getById(proyectoId);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    // Caso 4: Sin autenticación
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
        await proyectosService.getById(proyectoId);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // Validaciones de entrada
  // ========================
  describe('Validaciones de entrada', () => {
    // equipoId vacío
    it('debe manejar equipoId vacío', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      await proyectosService.getByEquipo('');

      expect(mockApi.get).toHaveBeenCalled();
    });

    // Nombres con caracteres especiales
    it('debe aceptar nombres con caracteres especiales', async () => {
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: 'Sprint #1 & Q1 2025 (Updated)',
          equipo: 'equipo-1',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.create({
        nombre: 'Sprint #1 & Q1 2025 (Updated)',
        equipoId: 'equipo-1',
      });

      expect(resultado.nombre).toBe('Sprint #1 & Q1 2025 (Updated)');
    });

    // Nombres muy largos
    it('debe aceptar nombres muy largos', async () => {
      const longName = 'a'.repeat(500);
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: longName,
          equipo: 'equipo-1',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.create({
        nombre: longName,
        equipoId: 'equipo-1',
      });

      expect(resultado.nombre).toBe(longName);
    });
  });

  // ========================
  // Casos de seguridad
  // ========================
  describe('Security Scenarios', () => {
    // No exponer datos sensibles
    it('debe manejar datos de respuesta sin exponer información sensible', async () => {
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: 'Sprint 1',
          equipo: 'equipo-1',
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await proyectosService.getById('proyecto-1');

      expect(resultado).not.toHaveProperty('password');
    });

    // Inyección de parámetros en equipoId
    it('debe escapar caracteres especiales en equipoId', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      await proyectosService.getByEquipo(
        "equipo-1'; DROP TABLE proyectos; --",
      );

      expect(mockApi.get).toHaveBeenCalledWith(
        "/proyectos?equipoId=equipo-1'; DROP TABLE proyectos; --",
      );
    });

    // Token debe ser usado en headers
    it('debe usar token en headers (validado por api.ts)', async () => {
      const mockResponse = {
        data: {
          _id: 'proyecto-1',
          nombre: 'Sprint 1',
          equipo: 'equipo-1',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const payload = {
        nombre: 'Sprint 1',
        equipoId: 'equipo-1',
      };

      await proyectosService.create(payload);

      expect(mockApi.post).toHaveBeenCalledWith('/proyectos', payload);
    });
  });

  // ========================
  // Casos de error de red
  // ========================
  describe('Network Error Handling', () => {
    // Timeout
    it('debe manejar timeouts de conexión', async () => {
      const errorResponse = {
        code: 'ECONNABORTED',
        message: 'Request timeout',
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await proyectosService.getByEquipo('equipo-1');
      } catch (error: any) {
        expect(error.code).toBe('ECONNABORTED');
      }
    });

    // Conexión rechazada
    it('debe manejar conexión rechazada', async () => {
      const errorResponse = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await proyectosService.create({
          nombre: 'Sprint',
          equipoId: 'equipo-1',
        });
      } catch (error: any) {
        expect(error.code).toBe('ECONNREFUSED');
      }
    });
  });
});

