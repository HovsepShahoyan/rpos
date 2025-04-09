#!/bin/bash

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --ip)
      NEW_IP="$2"
      shift 2
      ;;
    --user)
      NEW_USERNAME="$2"
      shift 2
      ;;
    --pass)
      NEW_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "[ERROR] Unknown argument: $1"
      echo "Usage: $0 [--ip NEW_IP] [--user USERNAME] [--pass PASSWORD]"
      exit 1
      ;;
  esac
done

CONFIG_FILE="/home/jetson/rpos/rposConfig.json"

# Update RPOS configuration
if [ ! -z "$NEW_IP" ]; then
  sed -i "s/\(\"IpAddress\" *: *\)\".*\"/\1\"$NEW_IP\"/" "$CONFIG_FILE"
fi

if [ ! -z "$NEW_USERNAME" ]; then
  sed -i "s/\(\"Username\" *: *\)\".*\"/\1\"$NEW_USERNAME\"/" "$CONFIG_FILE"
fi

if [ ! -z "$NEW_PASSWORD" ]; then
  sed -i "s/\(\"Password\" *: *\)\".*\"/\1\"$NEW_PASSWORD\"/" "$CONFIG_FILE"
fi

# Apply changes to Jetson device network interface if IP is provided
if [ ! -z "$NEW_IP" ]; then
  echo "[INFO] Updating Jetson IP address on interface enP8p1s0 to $NEW_IP"

  # Apply IP to Jetson Ethernet interface (enP8p1s0)
  sudo ip addr flush dev enP8p1s0
  sudo ip addr add "$NEW_IP"/24 dev enP8p1s0
  sudo ip link set dev enP8p1s0 up

  echo "[INFO] IP address updated to $NEW_IP on interface enP8p1s0"
fi

# Log changes
if [ ! -z "$NEW_USERNAME" ] || [ ! -z "$NEW_PASSWORD" ]; then
  echo "[INFO] Username/Password updated in RPOS configuration."
fi

exit 0
