import * as os from 'os';

export const newLine = (num: number = 1) => {
  const newLineOp = os.platform() === 'win32' ? '\r\n' : '\n';

  return Array(num)
    .fill(0)
    .map(() => newLineOp)
    .join('');
};
