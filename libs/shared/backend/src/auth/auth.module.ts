import { DynamicModule, Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// @Module({
//   imports: [
//     AppConfigModule,
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.registerAsync({
//       imports: [AppConfigModule],
//       useFactory: async (configService: AppConfigService) => ({
//         secret: configService.envConfig.jwt.secret,
//         signOptions: {
//           expiresIn: configService.envConfig.jwt.expiresIn
//         },
//       }),
//       inject: [AppConfigService],
//     }),
//   ],
//   providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
//   exports: [PassportModule, JwtModule, JwtStrategy, JwtAuthGuard, RolesGuard],
// })
// export class SharedAuthModule {}

interface AuthModuleOptions {
  secret?: string;
  expiresIn?: string;
  refreshExpiresIn?: string;
}

@Module({})
export class SharedAuthModule {
  private static readonly logger = new Logger(SharedAuthModule.name);

  static register(options?: AuthModuleOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      imports: [
        AppConfigModule.forFeature(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [AppConfigModule.forFeature()],
          inject: [AppConfigService],
          useFactory: (configService: AppConfigService) => {
            const secret = options?.secret || configService.envConfig.jwt.secret;
            this.logger.debug(`Initializing JwtModule with secret: ${secret ? '[SET]' : '[MISSING]'}`);
            
            if (!secret) {
              throw new Error('JWT_SECRET is not configured');
            }

            return {
              secret,
              signOptions: {
                expiresIn:
                options?.expiresIn || configService.envConfig.jwt.expiresIn,
              }
            };
          },
        }),
      ],
      providers: [ JwtStrategy, JwtAuthGuard, RolesGuard, AppConfigService, ],
      exports: [
        PassportModule,
        JwtModule,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
        AppConfigService,
      ],
    };
  }
}
