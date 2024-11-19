import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Param, 
  Body, 
  HttpStatus,
  ParseUUIDPipe,
  HttpException
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentDto, NewAssessment, ProfileProps, ProfileSchema, registerAssessmentSchema, ValuesProps, ValuesSchema } from '@microservices-app/shared/types';
import { ZodValidationPipe } from '@microservices-app/shared/backend';
// import { 
//   CreateAssessment, 
//   UpdatePersonalInfoDto,
//   UpdatePreferencesDto,
//   UpdateQuizAnswersDto
// } from './dto';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  async register(
    @Body(new ZodValidationPipe(registerAssessmentSchema)) createDto: AssessmentDto
  ) {
    return this.assessmentService.register(createDto as NewAssessment);
  }

  @Get(':id')
  async findAssessment(@Param('id', ParseUUIDPipe) id: string) {
    return await this.assessmentService.findAssessment(id);
  }

  @Patch(':id/profile')
  async updatePersonalInfo(
    @Param('id', ParseUUIDPipe) id: string,
    //@Body() profile: ProfileProps
    @Body(new ZodValidationPipe(ProfileSchema)) profile: ProfileProps
  ) {
    console.log("profile: ", profile);
    return this.assessmentService.updateProfile(id, profile);
  }

  @Patch(':id/motives')
  async updatePersonalMotives(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ValuesSchema)) values: ValuesProps
  ) {
    return this.assessmentService.updateProfile(id, values);
  }

  // @Put(':id/preferences')
  // async updatePreferences(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateDto: UpdatePreferencesDto
  // ) {
  //   return this.assessmentService.updatePreferences(id, updateDto);
  // }

  // @Put(':id/quiz')
  // async updateQuizAnswers(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateDto: UpdateQuizAnswersDto
  // ) {
  //   return this.assessmentService.updateQuizAnswers(id, updateDto);
  // }

  // @Get('email/:email')
  // async findByEmail(@Param('email') email: string) {
  //   return this.assessmentService.findByEmail(email);
  // }

  // @Get('incomplete/:email')
  // async findIncomplete(@Param('email') email: string) {
  //   const assessment = await this.assessmentService.findIncomplete(email);
  //   if (!assessment) {
  //     throw new HttpException('No incomplete assessment found', HttpStatus.NOT_FOUND);
  //   }
  //   return assessment;
  // }
} 