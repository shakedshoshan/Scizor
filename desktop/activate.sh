#!/bin/bash
# Virtual Environment Activation Script for Bash
export PATH="$(pwd)/venv/Scripts:$PATH"
export VIRTUAL_ENV="$(pwd)/venv"
echo "Virtual environment activated!"
echo "Python location: ./venv/Scripts/python.exe"

