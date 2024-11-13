// TODO: Find the way how to pass .env config to the decorator
export const rabbitmqConfig = {
    exchanges: {
      notifications: 'notifications.exchange',
      deadLetter: 'notifications.dlx',
    },
    queues: {
      notifications: {
        name: 'notifications',
        routingKey: 'notification.#',
        messageTtl: 86400000, // 24 hours in milliseconds
        emailVerification: {
          routingKey: 'notification.email.verification',
        },
      },
      deadLetter: {
        name: 'notifications.dlq',
        routingKey: 'dead-letter',
        messageTtl: 604800000, // 24 hours in milliseconds
      }
    },
  };

export const notificationArguments = {
  'x-dead-letter-exchange': rabbitmqConfig.exchanges.deadLetter,
  'x-dead-letter-routing-key': rabbitmqConfig.queues.deadLetter.routingKey,
  'x-message-ttl': rabbitmqConfig.queues.notifications.messageTtl,
};

export const deadLetterArguments = {
  'x-message-ttl': rabbitmqConfig.queues.deadLetter.messageTtl,
};
