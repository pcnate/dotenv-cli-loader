use std::env;
use std::fs;
use std::process::{Command, exit};

fn parse_env_file(path: &str) -> std::collections::HashMap<String, String> {
    let mut env_vars = std::collections::HashMap::new();
    if let Ok(contents) = fs::read_to_string(path) {
        for line in contents.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') { continue; }
            if let Some(eq_idx) = line.find('=') {
                let key = line[..eq_idx].trim();
                let mut value = line[eq_idx+1..].trim().to_string();
                if (value.starts_with('"') && value.ends_with('"')) ||
                   (value.starts_with('\'') && value.ends_with('\'')) {
                    value = value[1..value.len()-1].to_string();
                }
                env_vars.insert(key.to_string(), value);
            }
        }
    }
    env_vars
}

fn print_export_statements(env_vars: &std::collections::HashMap<String, String>) {
    for (key, value) in env_vars {
        let safe_value = value.replace('"', "\\\"").replace('`', "\\`").replace('$', "\\$").replace('\\', "\\\\");
        println!("export {}=\"{}\"", key, safe_value);
    }
}

fn run_command_with_env(command: &str, args: &[String], env_vars: &std::collections::HashMap<String, String>) {
    let mut cmd = Command::new(command);
    cmd.args(args);
    for (k, v) in env_vars {
        cmd.env(k, v);
    }
    let status = cmd.status().expect("failed to execute command");
    exit(status.code().unwrap_or(1));
}

fn main() {
    let env_path = ".env";
    let env_vars = parse_env_file(env_path);
    let mut args: Vec<String> = env::args().skip(1).collect();

    if args.is_empty() {
        print_export_statements(&env_vars);
        exit(0);
    }

    let command = args.remove(0);
    run_command_with_env(&command, &args, &env_vars);
}
