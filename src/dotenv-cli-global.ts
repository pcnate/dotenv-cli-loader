#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';


/**
 * Parses a .env file and returns an object of key-value pairs.
 * Ignores comments and blank lines.
 *
 * @param filePath - The path to the .env file.
 * @returns An object containing environment variables.
 */
export function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}


/**
 * Prints export statements for each environment variable.
 * Useful for sourcing in a shell.
 *
 * @param envVars - The environment variables to print.
 */
export function printExportStatements(envVars: Record<string, string>): void {
  // Add a flag variable to indicate the script was run
  console.log('export DOTENV_CLI_GLOBAL_LOADED=1');
  Object.entries(envVars).forEach(([key, value]) => {
    const safeValue = value.replace(/(["$`\\])/g, '\\$1');
    console.log(`export ${key}="${safeValue}"`);
  });
}


/**
 * Spawns a command with the provided environment variables.
 *
 * @param command - The command to run.
 * @param commandArgs - Arguments to pass to the command.
 * @param envVars - Environment variables to set for the command.
 */
export function runCommandWithEnv(command: string, commandArgs: string[], envVars: Record<string, string>): void {
  const child = child_process.spawn(command, commandArgs, {
    stdio: 'inherit',
    env: { ...process.env, ...envVars }
  });

  child.on('exit', (code: number | null) => {
    process.exit(code ?? 0);
  });
}


/**
 * Main CLI logic for dotenv-cli-global.
 * Loads .env, parses args, and runs the appropriate action.
 *
 * Note: To load variables into the current shell session, you must use:
 *   source dotenv-cli-global --source
 * or
 *   eval "$(dotenv-cli-global --source)"
 *
 * If --source is not provided, the script assumes it was not sourced and will print a warning.
 */
export function main(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  const envVars = parseEnvFile(envPath);

  const [, , ...args] = process.argv;

  const isSourceMode = args.includes('--source');
  const filteredArgs = args.filter(arg => arg !== '--source');

  if (filteredArgs.length === 0) {
    if (!isSourceMode) {
      console.warn(
        '[dotenv-cli-global] WARNING: To load variables into your current shell session, run:\n' +
        '  source dotenv-cli-global --source\n' +
        'or\n' +
        '  eval "$(dotenv-cli-global --source)"\n'
      );
    }
    printExportStatements(envVars);
    process.exit(0);
  }

  // Run a command with env vars loaded
  const command = filteredArgs[0];
  const commandArgs = filteredArgs.slice(1);
  runCommandWithEnv(command, commandArgs, envVars);
}
