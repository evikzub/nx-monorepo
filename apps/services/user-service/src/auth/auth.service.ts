import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { 
  AuthResponse, 
  LoginDto, 
  RegisterDto,
  JwtPayload,
  AuthErrorCode,
  UserRole,
  RefreshTokenDto
} from '@microservices-app/shared/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  private async generateTokens(payload: Omit<JwtPayload, 'type'>): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...payload, type: 'access' }),
      this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: '7d' }) // Refresh token lasts longer
    ]);

    return { accessToken, refreshToken };
  }

  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (user && await bcrypt.compare(password, user.password)) {
        return {
          sub: user.id,
          email: user.email,
          roles: user.roles,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined
        };
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.sub,
        email: user.email,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException({
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: 'Token has expired or is invalid'
      });
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(refreshTokenDto.refreshToken);

      // Verify this is actually a refresh token
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException({
          code: AuthErrorCode.INVALID_REFRESH_TOKEN,
          message: 'Invalid token type'
        });
      }

      const user = await this.userService.findUserById(decoded.sub);

      const payload: Omit<JwtPayload, 'type'> = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName
      };

      const { accessToken, refreshToken } = await this.generateTokens(payload);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
        message: 'Invalid refresh token'
      });
    }
  }

  async validateToken(token: string): Promise<{
    isValid: boolean;
    payload?: JwtPayload;
    error?: string;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return { isValid: true, payload };
    } catch (error) {
      this.logger.error(`Error validating token: ${error.message}`);
      return { 
        isValid: false, 
        error: error.message 
      };
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Create user with default PUBLIC role if none provided
      const user = await this.userService.createUser({
        ...registerDto,
        roles: registerDto.roles || [UserRole.PUBLIC]
      });

      const payload: Omit<JwtPayload, 'type'> = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined
      };

      const { accessToken, refreshToken } = await this.generateTokens(payload);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new ConflictException({
          code: AuthErrorCode.USER_ALREADY_EXISTS,
          message: 'User with this email already exists'
        });
      }
      throw error;
    }
  }
} 