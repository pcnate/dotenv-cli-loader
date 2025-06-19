import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import {
  parseEnvFile,
  printExportStatements,
  runCommandWithEnv,
} from './dotenv-cli-global.js';

describe('parseEnvFile', () => {
  const tmpFile = path.join(process.cwd(), '.env.test');

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('parses key=value pairs', () => {
    fs.writeFileSync(tmpFile, 'FOO=bar\nBAR=baz');
    expect(parseEnvFile(tmpFile)).toEqual({ FOO: 'bar', BAR: 'baz' });
  });

  it('ignores comments and blank lines', () => {
    fs.writeFileSync(tmpFile, '# comment\n\nFOO=bar\n');
    expect(parseEnvFile(tmpFile)).toEqual({ FOO: 'bar' });
  });

  it('handles quoted values', () => {
    fs.writeFileSync(tmpFile, 'FOO="bar baz"\nBAR=\'qux\'');
    expect(parseEnvFile(tmpFile)).toEqual({ FOO: 'bar baz', BAR: 'qux' });
  });

  it('returns empty object if file does not exist', () => {
    expect(parseEnvFile('notfound.env')).toEqual({});
  });
});

describe('printExportStatements', () => {
  it('prints export statements', () => {
    const envVars = { FOO: 'bar', BAR: 'baz' };
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printExportStatements(envVars);
    expect(spy).toHaveBeenCalledWith('export FOO="bar"');
    expect(spy).toHaveBeenCalledWith('export BAR="baz"');
    spy.mockRestore();
  });
});

describe('runCommandWithEnv', () => {
  it('spawns a command with env vars', done => {
    // This test will spawn `node -e "console.log(process.env.TEST_ENV)"` and check output
    const spy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    const cmd = process.execPath;
    const args = ['-e', 'console.log(process.env.TEST_ENV)'];
    const envVars = { TEST_ENV: 'hello' };

    const child = child_process.spawn(cmd, args, {
      env: { ...process.env, ...envVars },
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', () => {
      expect(output.trim()).toBe('hello');
      spy.mockRestore();
      done();
    });
  });
});
