import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { AppConfigModule, AppConfigService } from '@microservices-app/shared/backend';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AppConfigModule.forFeature(), // Import AppConfigModule
    // Register Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Register JWT module with configuration
    JwtModule.registerAsync({
      imports: [AppConfigModule.forFeature()], // Import AppConfigModule here
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.envConfig.jwt.secret,
        signOptions: { 
          expiresIn: config.envConfig.jwt.expiresIn 
        },
      }),
    }),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService],
  exports: [AuthService]
})
export class AuthModule {} 