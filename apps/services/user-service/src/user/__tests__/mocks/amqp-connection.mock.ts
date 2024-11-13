export const mockAmqpConnection = {
  publish: jest.fn().mockResolvedValue(undefined),
  createChannel: jest.fn().mockResolvedValue({}),
  close: jest.fn().mockResolvedValue(undefined),
  channel: {
    assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
    assertExchange: jest.fn().mockResolvedValue(undefined),
    bindQueue: jest.fn().mockResolvedValue(undefined),
  },
}; 