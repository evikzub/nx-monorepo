import { Injectable, Logger, NotFoundException } from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
//import { Repository } from 'typeorm';
//import { Assessment } from './entities/assessment.entity';
import { Assessment, AssessmentDataProps, NewAssessment, parseAssessmentData, ProfileProps, UpdateAssessment, ValuesProps } from '@microservices-app/shared/types';
import { AssessmentRepository } from './assessment.repository';

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    private assessmentRepository: AssessmentRepository,
  ) {}

  async findAssessment(id: string): Promise<Assessment | null> {
    const assessment = await this.assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }
    return assessment;
  }

  // Register a new assessment or get existing one
  async register(data: NewAssessment): Promise<Assessment> {
    let [assessment] = await this.assessmentRepository.findByEmail(data.email);

    if (!assessment) {
      assessment = await this.assessmentRepository.create(data);
    }

    // Send email to user with OTP

    return assessment;
  }

  async update(id: string, data: UpdateAssessment): Promise<Assessment> {
    //const assessment = 
    //await this.findAssessment(id);
    const updatedAssessment = await this.assessmentRepository.update(id, data);
    return updatedAssessment;
  }

  async updateProfile(id: string, data: ProfileProps): Promise<Assessment> {
    const assessment = await this.findAssessment(id);
    this.logger.log("data: ", data);
    this.logger.log("assessment: ", assessment);
    //const parsedAssessment = parseAssessmentData(assessment);
    
    if (assessment.data) {
      const assessmentData = assessment.data as AssessmentDataProps;
      assessmentData.profile = {...assessmentData.profile, ...data};
    }
    else {
      assessment.data = { profile: data};
    }
    this.logger.log("Updated Assessment: ", assessment);

    const updatedAssessment = await this.assessmentRepository.update(id, assessment);
    return updatedAssessment;
    //return assessment;
  }

  async updateDataMotives(id: string, data: ValuesProps): Promise<Assessment> {
    const assessment = await this.findAssessment(id);
    const parsedAssessment = parseAssessmentData(assessment);
    if (parsedAssessment.data?.results?.motives?.values) {
      parsedAssessment.data.results.motives.values = {...parsedAssessment.data.results.motives.values, ...data};
    }
    else {
      console.log("data in motives service: ...")
      if (parsedAssessment.data?.results?.motives) {
        parsedAssessment.data = {...parsedAssessment.data, results: {...parsedAssessment.data.results, motives: {...parsedAssessment.data.results.motives, values: data}}};
      }
      else {
        parsedAssessment.data = {...parsedAssessment.data, results: {motives: {values: data}}};
      }
    }

    const updatedAssessment = await this.assessmentRepository.update(id, parsedAssessment);
    return updatedAssessment;
  }
  // async findByUserId(userId: string): Promise<Assessment[]> {
  //   return  this.assessmentRepository.findById(userId);
  // }
} 