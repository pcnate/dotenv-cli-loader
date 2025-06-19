using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

class DotenvCliGlobal
{
    static Dictionary<string, string> ParseEnvFile(string filePath)
    {
        var env = new Dictionary<string, string>();
        if (!File.Exists(filePath)) return env;
        foreach (var line in File.ReadAllLines(filePath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
            var eqIdx = trimmed.IndexOf('=');
            if (eqIdx == -1) continue;
            var key = trimmed.Substring(0, eqIdx).Trim();
            var value = trimmed.Substring(eqIdx + 1).Trim();
            if ((value.StartsWith("\"") && value.EndsWith("\"")) ||
                (value.StartsWith("'") && value.EndsWith("'")))
            {
                value = value.Substring(1, value.Length - 2);
            }
            env[key] = value;
        }
        return env;
    }

    static void PrintExportStatements(Dictionary<string, string> envVars)
    {
        foreach (var kv in envVars)
        {
            var safeValue = kv.Value.Replace("\"", "\\\"").Replace("`", "\\`").Replace("$", "\\$").Replace("\\", "\\\\");
            Console.WriteLine($"export {kv.Key}=\"{safeValue}\"");
        }
    }

    static void RunCommandWithEnv(string command, string[] commandArgs, Dictionary<string, string> envVars)
    {
        var psi = new ProcessStartInfo(command);
        foreach (var arg in commandArgs)
            psi.ArgumentList.Add(arg);
        foreach (var kv in envVars)
            psi.Environment[kv.Key] = kv.Value;
        psi.UseShellExecute = false;
        psi.RedirectStandardOutput = false;
        psi.RedirectStandardError = false;
        psi.RedirectStandardInput = false;
        var proc = Process.Start(psi);
        proc.WaitForExit();
        Environment.Exit(proc.ExitCode);
    }

    static void Main(string[] args)
    {
        var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
        var envVars = ParseEnvFile(envPath);

        if (args.Length == 0)
        {
            // Print export statements for shell usage.
            // To load into your shell: eval "$(dotnet run --project dotenv-cli-global.csproj)"
            PrintExportStatements(envVars);
            Environment.Exit(0);
        }

        var command = args[0];
        var commandArgs = new string[args.Length - 1];
        Array.Copy(args, 1, commandArgs, 0, args.Length - 1);
        RunCommandWithEnv(command, commandArgs, envVars);
    }
}
