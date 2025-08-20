#!/bin/bash

echo "Nombre d'arguments: $#"
echo "Argument 1: '$1'"
echo "Argument 2: '$2'"
echo "Tous les arguments: '$@'"

SERVER_IP=${1:-"YOUR_SERVER_IP"}
USER=${2:-"root"}

echo "SERVER_IP après assignation: '$SERVER_IP'"
echo "USER après assignation: '$USER'"
