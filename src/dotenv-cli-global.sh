# Usage:
#   source ./dotenv-cli-global.sh
# or
#   . ./dotenv-cli-global.sh
# This will load .env variables into your current shell session.

ENV_FILE="${ENV_FILE:-.env}"

if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    case "$line" in
      ''|\#*) continue ;;
    esac
    if [[ "$line" == *"="* ]]; then
      key="${line%%=*}"
      value="${line#*=}"
      key="$(echo -n "$key" | xargs)"
      value="$(echo -n "$value" | xargs)"
      # Remove surrounding quotes if present
      if [[ "$value" =~ ^\".*\"$ || "$value" =~ ^\'.*\'$ ]]; then
        value="${value:1:-1}"
      fi
      export "$key=$value"
    fi
  done < "$ENV_FILE"
fi
