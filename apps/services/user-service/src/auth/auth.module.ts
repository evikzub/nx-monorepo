import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AppConfigModule, AppConfigService, SharedAuthModule } from '@microservices-app/shared/backend';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    AppConfigModule.forFeature(), // Import AppConfigModule
    SharedAuthModule.register(),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, 
    {
        provide: JwtService,
        useFactory: (configService: AppConfigService) => {
          return new JwtService({
            secret: configService.envConfig.jwt.secret,
            signOptions: { 
              expiresIn: configService.envConfig.jwt.expiresIn 
            }
          });
        },
        inject: [AppConfigService]
    }
  ],
  exports: [AuthService]
})
export class AuthModule {} 