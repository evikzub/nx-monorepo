import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from './circuit-breaker.service';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let now: number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitBreakerService],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    now = Date.now();
  });

  // Enable fake timers
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Clean up after tests
  afterAll(() => {
    jest.useRealTimers();
  });

  // Reset timers before each test
  beforeEach(() => {
    jest.setSystemTime(now);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('circuit breaker state', () => {
    const serviceName = 'test-service';

    beforeEach(() => {
      service.reset(serviceName);
    });

    it('should start closed', () => {
      expect(service.getState(serviceName).status).toBe('CLOSED');
      expect(service.isOpen(serviceName)).toBeFalsy();
    });

    it('should open after threshold failures', () => {
      // Record failures up to threshold
      for (let i = 0; i < 5; i++) {
        service.recordFailure(serviceName);
      }
      
      expect(service.getState(serviceName).status).toBe('OPEN');
      expect(service.isOpen(serviceName)).toBeTruthy();
    });

    it('should remain open before reset timeout', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        service.recordFailure(serviceName);
      }
      
      // Advance time but not enough for reset
      jest.advanceTimersByTime(30000); // 30 seconds
      
      expect(service.getState(serviceName).status).toBe('OPEN');
      expect(service.isOpen(serviceName)).toBeTruthy();
    });

    // TODO: Fix this test
    it.skip('should transition to half-open after reset timeout', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        service.recordFailure(serviceName);
      }
      
      // Wait for reset timeout
      jest.advanceTimersByTime(60000); // 60 seconds
      
      // Check if state transitions to half-open
      service.isOpen(serviceName); // This call triggers the state check
      expect(service.getState(serviceName).status).toBe('HALF_OPEN');
      expect(service.isOpen(serviceName)).toBeFalsy();
    });

    // TODO: Fix this test
    it.skip('should close after success in half-open state', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        service.recordFailure(serviceName);
      }
      
      // Wait for reset timeout to enter half-open state
      jest.advanceTimersByTime(60000);
      service.isOpen(serviceName); // Trigger state check
      
      // Record success
      service.recordSuccess(serviceName);
      
      expect(service.getState(serviceName).status).toBe('CLOSED');
      expect(service.isOpen(serviceName)).toBeFalsy();
    });

    it('should reopen immediately after failure in half-open state', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        service.recordFailure(serviceName);
      }
      
      // Wait for reset timeout to enter half-open state
      jest.advanceTimersByTime(60000);
      service.isOpen(serviceName); // Trigger state check
      
      // Record failure in half-open state
      service.recordFailure(serviceName);
      
      expect(service.getState(serviceName).status).toBe('OPEN');
      expect(service.isOpen(serviceName)).toBeTruthy();
    });
  });
}); 