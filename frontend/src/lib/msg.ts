const PREFIX = '[온리비 어서]';

type Level = 'info' | 'success' | 'warn' | 'error';

function format(level: Level, message: string): string {
  return `${PREFIX} ${message}`;
}

export const msg = {
  info: (message: string) => console.log(format('info', message)),
  success: (message: string) => console.log(format('success', message)),
  warn: (message: string, ...args: any[]) => console.warn(format('warn', message), ...args),
  error: (message: string, ...args: any[]) => console.error(format('error', message), ...args),
};
