import os
import sys

def parse_env_file(filepath):
    env = {}
    if not os.path.exists(filepath):
        return env
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            value = value.strip().strip('"').strip("'")
            env[key.strip()] = value
    return env

def print_export_statements(env_vars):
    for key, value in env_vars.items():
        safe_value = value.replace('"', '\\"').replace('`', '\\`').replace('$', '\\$').replace('\\', '\\\\')
        print(f'export {key}="{safe_value}"')

def main():
    env_path = os.path.join(os.getcwd(), '.env')
    env_vars = parse_env_file(env_path)
    if len(sys.argv) == 1:
        print_export_statements(env_vars)
        sys.exit(0)
    # Run a command with env vars loaded
    command = sys.argv[1]
    args = sys.argv[2:]
    os.execvpe(command, [command] + args, {**os.environ, **env_vars})

if __name__ == "__main__":
    main()
