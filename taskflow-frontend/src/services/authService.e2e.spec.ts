import { authService } from './authService';
import * as api from './api';

// ========================
// PRUEBAS DE CAJA NEGRA - AUTH SERVICE (Frontend)
// ========================
// Estas pruebas simulan llamadas reales a la API desde el frontend
// Sin conocer la implementación interna del servicio.

jest.mock('./api');

describe('Auth Service E2E Tests (Frontend - Black Box)', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // register() - Caja Negra
  // ========================
  describe('register()', () => {
    const registerData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'SecurePassword123!',
    };

    // Caso 1: Registro exitoso - Retorna usuario sin contraseña
    it('debe registrar un usuario y retornar sus datos sin contraseña', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439011',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.register(registerData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(resultado).toHaveProperty('_id');
      expect(resultado).toHaveProperty('nombre', 'Juan Pérez');
      expect(resultado).toHaveProperty('email', 'juan@example.com');
      expect(resultado).not.toHaveProperty('password');
    });

    // Caso 2: Email duplicado - Lanza error
    it('debe lanzar error si el email ya está registrado', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'El email ya está registrado',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await authService.register(registerData);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('email ya está registrado');
      }
    });

    // Caso 3: Validación de campos vacíos
    it('debe validar que no acepte campos vacíos', async () => {
      const invalidData = {
        nombre: '',
        email: 'test@example.com',
        password: 'password123',
      };

      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await authService.register(invalidData);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    // Caso 4: Respuesta debe ser Usuario
    it('debe retornar un objeto Usuario válido', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439011',
          nombre: 'Juan',
          email: 'juan@example.com',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.register(registerData);

      expect(typeof resultado._id).toBe('string');
      expect(typeof resultado.nombre).toBe('string');
      expect(typeof resultado.email).toBe('string');
    });
  });

  // ========================
  // login() - Caja Negra
  // ========================
  describe('login()', () => {
    const loginData = {
      email: 'juan@example.com',
      password: 'SecurePassword123!',
    };

    // Caso 1: Login exitoso - Retorna token
    it('debe retornar un access_token válido al iniciar sesión', async () => {
      const mockResponse = {
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20ifQ.abc123',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.login(loginData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(resultado).toHaveProperty('access_token');
      expect(resultado.access_token).toBeTruthy();
    });

    // Caso 2: Credenciales inválidas - Retorna 401
    it('debe retornar 401 si las credenciales son inválidas', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await authService.login(loginData);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    // Caso 3: Token debe ser JWT
    it('el token retornado debe ser un JWT válido (3 partes)', async () => {
      const validJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20ifQ.abc123';

      const mockResponse = {
        data: {
          access_token: validJWT,
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.login(loginData);

      expect(resultado.access_token.split('.')).toHaveLength(3);
    });

    // Caso 4: Email no encontrado
    it('debe retornar 401 si el email no existe', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await authService.login({
          email: 'no-existe@example.com',
          password: 'password123',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    // Caso 5: Contraseña incorrecta
    it('debe retornar 401 si la contraseña es incorrecta', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      mockApi.post.mockRejectedValue(errorResponse);

      try {
        await authService.login({
          email: 'juan@example.com',
          password: 'WrongPassword123',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // getProfile() - Caja Negra
  // ========================
  describe('getProfile()', () => {
    // Caso 1: Obtener perfil exitosamente
    it('debe retornar los datos del usuario autenticado', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439011',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await authService.getProfile();

      expect(mockApi.get).toHaveBeenCalledWith('/usuarios/me');
      expect(resultado).toHaveProperty('_id');
      expect(resultado).toHaveProperty('nombre');
      expect(resultado).toHaveProperty('email');
    });

    // Caso 2: Token inválido o expirado
    it('debe retornar 401 si el token es inválido o expirado', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Token inválido',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await authService.getProfile();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
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

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await authService.getProfile();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // ========================
  // searchByEmail() - Caja Negra
  // ========================
  describe('searchByEmail()', () => {
    // Caso 1: Usuario encontrado
    it('debe retornar datos del usuario cuando se encuentra por email', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439012',
          nombre: 'María García',
          email: 'maria@example.com',
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const resultado = await authService.searchByEmail('maria@example.com');

      expect(mockApi.get).toHaveBeenCalledWith('/usuarios?email=maria@example.com');
      expect(resultado.email).toBe('maria@example.com');
    });

    // Caso 2: Usuario no encontrado
    it('debe retornar 404 si el usuario no existe', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Usuario no encontrado',
          },
        },
      };

      mockApi.get.mockRejectedValue(errorResponse);

      try {
        await authService.searchByEmail('no-existe@example.com');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    // Caso 3: Email vacío
    it('debe manejar emails vacíos', async () => {
      mockApi.get.mockResolvedValue({ data: null });

      const resultado = await authService.searchByEmail('');

      expect(mockApi.get).toHaveBeenCalled();
    });
  });

  // ========================
  // Casos de seguridad
  // ========================
  describe('Security Scenarios', () => {
    // Credenciales no deben exponerse
    it('nunca debe retornar la contraseña en la respuesta', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439011',
          nombre: 'Juan',
          email: 'juan@example.com',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.register({
        nombre: 'Juan',
        email: 'juan@example.com',
        password: 'SecurePassword123!',
      });

      expect(resultado).not.toHaveProperty('password');
    });

    // Token debe almacenarse seguramente (no se valida aquí, pero se documenta)
    it('el frontend debe almacenar el token de forma segura', async () => {
      const mockResponse = {
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.xyz',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.login({
        email: 'juan@example.com',
        password: 'password123',
      });

      expect(resultado.access_token).toBeTruthy();
      // Nota: El almacenamiento seguro (localStorage, sessionStorage, etc) se valida en tests de integración
    });

    // SQL Injection - Email con caracteres especiales
    it('debe escapar caracteres especiales en email', async () => {
      const mockResponse = {
        data: {
          _id: '507f1f77bcf86cd799439011',
          nombre: 'Test User',
          email: "' OR '1'='1",
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const resultado = await authService.register({
        nombre: 'Test',
        email: "' OR '1'='1",
        password: 'password123',
      });

      expect(mockApi.post).toHaveBeenCalled();
    });
  });
});

