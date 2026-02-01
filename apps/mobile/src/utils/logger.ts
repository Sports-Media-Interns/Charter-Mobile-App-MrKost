const NOOP = () => {};

function createLogger() {
  const isDev = __DEV__;

  return {
    debug: isDev ? console.log.bind(console, '[DEBUG]') : NOOP,
    info: isDev ? console.info.bind(console, '[INFO]') : NOOP,
    warn: isDev ? console.warn.bind(console, '[WARN]') : NOOP,
    error: console.error.bind(console, '[ERROR]'), // Always log errors
  };
}

export const logger = createLogger();
