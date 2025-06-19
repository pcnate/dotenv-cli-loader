#!/usr/bin/env node

// Entry point for dotenv-cli-global CLI.
// Loads .env variables and either prints export statements or runs a command with those variables.

import * as path from 'node:path';
import * as dotenvCliGlobal from './dotenv-cli-global.js';

// Resolve the path to the .env file in the current working directory
const envPath = path.resolve(process.cwd(), '.env');

// Parse the .env file into an object
const envVars = dotenvCliGlobal.parseEnvFile(envPath);

// Get command-line arguments (excluding node and script name)
const [, , ...args] = process.argv;

if (args.length === 0) {
  // If no command is provided, print export statements for all env variables
  dotenvCliGlobal.printExportStatements(envVars);
  process.exit(0);
}

// Otherwise, run the provided command with the loaded env variables
const command = args[0];
const commandArgs = args.slice(1);

dotenvCliGlobal.runCommandWithEnv(command, commandArgs, envVars);
