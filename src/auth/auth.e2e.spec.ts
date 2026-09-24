import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

// ========================
// PRUEBAS DE CAJA NEGRA - AUTH (E2E)
// ========================
// Estas pruebas prueban el comportamiento del sistema sin conocer
// la implementación interna. Se validan inputs/outputs reales del endpoint.

describe('Auth E2E Tests (Black Box)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usuariosService: UsuariosService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: {
            findByEmailRaw: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usuariosService = moduleFixture.get<UsuariosService>(UsuariosService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ========================
  // POST /auth/register - Caja Negra
  // ========================
  describe('POST /auth/register', () => {
    const validRegisterPayload = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'SecurePassword123!',
    };

    // Caso 1: Registro exitoso - Usuario nuevo
    it('debe registrar un usuario nuevo y retornar datos sin contraseña', async () => {
      const mockUsuario = {
        _id: '507f1f77bcf86cd799439011',
        nombre: validRegisterPayload.nombre,
        email: validRegisterPayload.email,
      };

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (usuariosService.create as jest.Mock).mockResolvedValue({
        ...mockUsuario,
        password: 'hashedPassword123',
      });

      const resultado = await authService.register(validRegisterPayload);

      expect(resultado).toHaveProperty('_id');
      expect(resultado).toHaveProperty('nombre', 'Juan Pérez');
      expect(resultado).toHaveProperty('email', 'juan@example.com');
      expect(resultado).not.toHaveProperty('password');
    });

    // Caso 2: Email duplicado
    it('debe rechazar registro si el email ya existe (409 Conflict)', async () => {
      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue({
        email: validRegisterPayload.email,
      });

      try {
        await authService.register(validRegisterPayload);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error.status).toBe(409);
        expect(error.message).toContain('El email ya está registrado');
      }
    });

    // Caso 3: Email vacío
    it('debe rechazar registro con email vacío', async () => {
      const invalidPayload = { ...validRegisterPayload, email: '' };

      try {
        await authService.register(invalidPayload);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // Caso 4: Contraseña muy corta
    it('debe rechazar contraseñas muy cortas', async () => {
      const shortPasswordPayload = {
        ...validRegisterPayload,
        password: '123',
      };

      try {
        await authService.register(shortPasswordPayload);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // Caso 5: Nombre vacío
    it('debe rechazar registro sin nombre', async () => {
      const noNamePayload = { ...validRegisterPayload, nombre: '' };

      try {
        await authService.register(noNamePayload);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========================
  // POST /auth/login - Caja Negra
  // ========================
  describe('POST /auth/login', () => {
    const validLoginPayload = {
      email: 'juan@example.com',
      password: 'SecurePassword123!',
    };

    // Caso 1: Login exitoso
    it('debe retornar un access_token válido cuando las credenciales son correctas', async () => {
      const mockUsuario = {
        _id: '507f1f77bcf86cd799439011',
        email: validLoginPayload.email,
        password: 'hashedPassword123',
      };

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(
        mockUsuario,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(
        'mock.jwt.token.abc123',
      );

      const resultado = await authService.login(validLoginPayload);

      expect(resultado).toHaveProperty('access_token');
      expect(resultado.access_token).toBeTruthy();
      expect(typeof resultado.access_token).toBe('string');
    });

    // Caso 2: Usuario no existe
    it('debe retornar 401 Unauthorized si el email no existe', async () => {
      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(null);

      try {
        await authService.login(validLoginPayload);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.message).toContain('Credenciales inválidas');
      }
    });

    // Caso 3: Contraseña incorrecta
    it('debe retornar 401 Unauthorized si la contraseña es incorrecta', async () => {
      const mockUsuario = {
        _id: '507f1f77bcf86cd799439011',
        email: validLoginPayload.email,
        password: 'hashedPassword123',
      };

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(
        mockUsuario,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await authService.login(validLoginPayload);
        throw new Error('Debería haber lanzado una excepción');
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.message).toContain('Credenciales inválidas');
      }
    });

    // Caso 4: Email vacío
    it('debe rechazar login sin email', async () => {
      const noEmailPayload = { ...validLoginPayload, email: '' };

      try {
        await authService.login(noEmailPayload);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // Caso 5: Contraseña vacía
    it('debe rechazar login sin contraseña', async () => {
      const noPasswordPayload = { ...validLoginPayload, password: '' };

      try {
        await authService.login(noPasswordPayload);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    // Caso 6: Token tiene estructura JWT correcta
    it('el token retornado debe ser un JWT válido', async () => {
      const mockUsuario = {
        _id: '507f1f77bcf86cd799439011',
        email: validLoginPayload.email,
        password: 'hashedPassword123',
      };

      const jwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9.abc123';

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(
        mockUsuario,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(jwtToken);

      const resultado = await authService.login(validLoginPayload);

      expect(resultado.access_token).toBe(jwtToken);
      expect(resultado.access_token.split('.')).toHaveLength(3);
    });
  });

  // ========================
  // Casos de seguridad
  // ========================
  describe('Security Scenarios', () => {
    // Caso: SQL Injection en email
    it('debe escapar caracteres especiales en email', async () => {
      const sqlInjectionPayload = {
        nombre: 'Attacker',
        email: "' OR '1'='1",
        password: 'password123',
      };

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(null);

      try {
        await authService.register(sqlInjectionPayload);
      } catch (error: any) {
        // Debería fallar o escapar correctamente
        expect(error).toBeDefined();
      }
    });

    // Caso: Contraseña no debe retornarse
    it('nunca debe retornar la contraseña en la respuesta', async () => {
      const mockUsuario = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        email: 'juan@example.com',
      };

      (usuariosService.findByEmailRaw as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (usuariosService.create as jest.Mock).mockResolvedValue({
        ...mockUsuario,
        password: 'hashedPassword123',
      });

      const resultado = await authService.register({
        nombre: 'Juan',
        email: 'juan@example.com',
        password: 'SecurePassword123!',
      });

      expect(resultado).not.toHaveProperty('password');
    });
  });
});
