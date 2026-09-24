import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Principios FIRST aplicados:
// - Fast: sin acceso a BD real ni red.
// - Isolated: cada prueba crea su propio estado.
// - Repeatable: determinista con mocks.
// - Self-validating: assert claramente sobre resultados.
// - Timely: pruebas enfocadas en la lógica de negocio.
//
// Tipo de mock:
// - Stub: valores fijados para bcrypt.hash/compare y usuariosService.findByEmailRaw.
// - Spy: comprobamos llamadas a usuariosService.create y jwtService.signAsync.

describe('AuthService', () => {
  let authService: AuthService;
  let usuariosServiceMock: jest.Mocked<Pick<UsuariosService, 'findByEmailRaw' | 'create'>>;
  let jwtServiceMock: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const usuarioFixture = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Juan Pérez',
    email: 'juan@test.com',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    usuariosServiceMock = {
      findByEmailRaw: jest.fn(),
      create: jest.fn(),
    } as any;

    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: '123456',
    };

    it('debe registrar un usuario nuevo exitosamente', async () => {
      // Arrange: Stub de datos del repositorio y hash.
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      usuariosServiceMock.create.mockResolvedValue(usuarioFixture as any);

      // Act
      const resultado = await authService.register(registerDto);

      // Assert
      expect(usuariosServiceMock.findByEmailRaw).toHaveBeenCalledWith('juan@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(usuariosServiceMock.create).toHaveBeenCalledWith({
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'hashedPassword123',
      });
      expect(resultado).toEqual({
        _id: usuarioFixture._id,
        nombre: usuarioFixture.nombre,
        email: usuarioFixture.email,
      });
      expect(resultado).not.toHaveProperty('password');
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      // Arrange: Stub que simula un usuario existente.
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(usuarioFixture as any);

      // Act + Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerDto)).rejects.toThrow('El email ya está registrado');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usuariosServiceMock.create).not.toHaveBeenCalled();
    });

    it('debe guardar la contraseña hasheada y no la original', async () => {
      // Arrange
      const hashedPassword = 'encrypted_password_xyz123';
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usuariosServiceMock.create.mockResolvedValue({ ...usuarioFixture, password: hashedPassword } as any);

      // Act
      await authService.register(registerDto);

      // Assert
      expect(usuariosServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: hashedPassword }),
      );
      expect(usuariosServiceMock.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ password: registerDto.password }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'juan@test.com',
      password: '123456',
    };

    it('debe iniciar sesión exitosamente y retornar un token', async () => {
      // Arrange: Stub de usuario y contraseña válidas.
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(usuarioFixture as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const resultado = await authService.login(loginDto);

      // Assert
      expect(usuariosServiceMock.findByEmailRaw).toHaveBeenCalledWith('juan@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword123');
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: usuarioFixture._id,
        email: usuarioFixture.email,
        id: usuarioFixture._id,
      });
      expect(resultado).toEqual({ access_token: 'mock.jwt.token' });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      // Arrange
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(null);

      // Act + Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Credenciales inválidas');

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // Arrange: Stub de contraseña inválida.
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(usuarioFixture as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act + Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Credenciales inválidas');

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('debe generar el JWT con el payload correcto', async () => {
      // Arrange
      const customToken = 'custom.jwt.token.123';
      usuariosServiceMock.findByEmailRaw.mockResolvedValue(usuarioFixture as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue(customToken);

      // Act
      const resultado = await authService.login(loginDto);

      // Assert
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: usuarioFixture._id,
          email: usuarioFixture.email,
          id: usuarioFixture._id,
        }),
      );
      expect(resultado).toEqual({ access_token: customToken });
    });
  });
});