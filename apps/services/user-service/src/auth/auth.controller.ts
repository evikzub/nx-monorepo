import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Logger,
  UseGuards,
  Get,
  Headers
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  AuthResponse,
  loginSchema,
  RefreshTokenDto,
  RegisterDto,
  registerSchema,
  refreshTokenSchema
} from '@microservices-app/shared/types';
import { JwtAuthGuard, ZodValidationPipe } from '@microservices-app/shared/backend';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(
    @Body(new ZodValidationPipe(refreshTokenSchema)) refreshTokenDto: RefreshTokenDto
  ) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.authService.validateToken(token);
  }
} 