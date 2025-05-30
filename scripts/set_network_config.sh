#!/bin/bash

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root."
   exit 1
fi

# Arguments
INTERFACE=$1
IP_ADDR=$2
SUBNET_MASK=$3
GATEWAY=$4
DNS1=$5
DNS2=$6

# Usage
if [[ $# -ne 6 ]]; then
    echo "Usage: $0 <interface> <ip-address> <subnet-mask> <gateway> <dns1> <dns2>"
    echo "Example: $0 eth0 192.168.1.100 255.255.255.0 192.168.1.1 8.8.8.8 8.8.4.4"
    exit 1
fi

echo "🔧 Configuring network interface $INTERFACE..."
echo "➡️ IP Address: $IP_ADDR"
echo "➡️ Subnet Mask: $SUBNET_MASK"
echo "➡️ Gateway: $GATEWAY"
echo "➡️ Primary DNS: $DNS1"
echo "➡️ Secondary DNS: $DNS2"

# Configure IP address and subnet mask
ip addr flush dev "$INTERFACE"
ip addr add "$IP_ADDR/$SUBNET_MASK" dev "$INTERFACE"

# Configure gateway
ip route del default 2>/dev/null
ip route add default via "$GATEWAY" dev "$INTERFACE"

# Configure DNS
echo "nameserver $DNS1" > /etc/resolv.conf
echo "nameserver $DNS2" >> /etc/resolv.conf

# Bring interface up
ip link set dev "$INTERFACE" up

echo "✅ Network configuration updated successfully."
