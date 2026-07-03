#!/bin/bash

# Change directory to the folder containing this script (so it works when double-clicked from Finder)
cd "$(dirname "$0")"

# Define paths
FRONTEND_DIR="frontend"
BACKEND_DIR="backend/IHCAE.Api"

# Terminal formatting colors
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

# Header
clear
echo -e "${CYAN}${BOLD}"
echo "  ██╗██╗  ██╗ ██████╗ █████╗ ███████╗     █████╗ ██╗     ██╗   ██╗███╗   ███╗███╗   ██╗██╗"
echo "  ██║██║  ██║██╔════╝██╔══██╗██╔════╝    ██╔══██╗██║     ██║   ██║████╗ ████║████╗  ██║██║"
echo "  ██║███████║██║     ███████║█████╗      ███████║██║     ██║   ██║██╔████╔██║██╔██╗ ██║██║"
echo "  ██║██╔══██║██║     ██╔══██║██╔══╝      ██╔══██║██║     ██║   ██║██║╚██╔╝██║██║╚██╗██║██║"
echo "  ██║██║  ██║╚██████╗██║  ██║███████╗    ██║  ██║███████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║"
echo "  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝"
echo "                               ⚡ DEV LAUNCHER ⚡"
echo -e "=====================================================================================${RESET}"
echo ""

# Check if frontend and backend directories exist
if [ ! -d "$FRONTEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}Error: Project directories not found.${RESET}"
  echo "Make sure this script is located in the root of the ihcae-alumni-app repository."
  echo "Expected directories:"
  echo "  - $FRONTEND_DIR (found: $([ -d "$FRONTEND_DIR" ] && echo "yes" || echo "no"))"
  echo "  - $BACKEND_DIR (found: $([ -d "$BACKEND_DIR" ] && echo "yes" || echo "no"))"
  read -p "Press Enter to exit..."
  exit 1
fi

# Check if node_modules exists in frontend
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}Warning: node_modules not found in $FRONTEND_DIR.${RESET}"
  read -p "Would you like to run 'npm install' first? (y/n): " install_answer
  if [[ "$install_answer" =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Running npm install in $FRONTEND_DIR...${RESET}"
    (cd "$FRONTEND_DIR" && npm install)
  fi
fi

# Present options
echo -e "${BOLD}Select how you want to run the dev servers:${RESET}"
echo -e "  [1] ${GREEN}Single Terminal (Concurrently)${RESET}  — Combines Angular and .NET logs with color-prefixes"
echo -e "  [2] ${BLUE}Separate Windows (macOS Tabs/Windows)${RESET} — Opens Angular and .NET in separate Terminal windows"
echo -e "  [3] ${YELLOW}Clean Cache + Run (Single Terminal)${RESET} — Cleans build/dev caches first, then runs concurrently"
echo -e "  [4] Exit"
echo ""
read -p "Enter choice [1-4]: " choice

run_concurrently() {
  echo -e "\n${GREEN}Starting Angular Frontend and .NET Backend concurrently...${RESET}"
  echo -e "${YELLOW}Press Ctrl+C to stop both servers at any time.${RESET}\n"
  
  # Ensure concurrently is run via npx
  npx concurrently \
    --names "Frontend,Backend" \
    --prefix-colors "cyan,magenta" \
    "npm --prefix $FRONTEND_DIR start" \
    "dotnet watch --project $BACKEND_DIR"
}

run_tabs() {
  echo -e "\n${BLUE}Launching servers in separate Terminal windows...${RESET}"
  
  # Absolute paths
  FULL_FRONTEND_PATH="$(pwd)/$FRONTEND_DIR"
  FULL_BACKEND_PATH="$(pwd)/$BACKEND_DIR"
  
  # Run Angular Dev Server in a new window
  osascript -e "tell application \"Terminal\" to activate" \
            -e "tell application \"Terminal\" to do script \"cd '$FULL_FRONTEND_PATH' && npm start\""
            
  # Run .NET Dev Server in a new window
  osascript -e "tell application \"Terminal\" to activate" \
            -e "tell application \"Terminal\" to do script \"cd '$FULL_BACKEND_PATH' && dotnet watch\""
            
  echo -e "\n${GREEN}✔ Windows opened successfully!${RESET}"
  echo -e "You can now close this main window. The servers will keep running in their own windows."
  echo ""
  read -p "Press Enter to exit..."
  exit 0
}

clean_caches() {
  echo -e "\n${YELLOW}Cleaning frontend and backend caches...${RESET}"
  
  # Frontend cleaning
  echo -e "${BLUE}Cleaning frontend build & angular cache...${RESET}"
  rm -rf "$FRONTEND_DIR/.angular" "$FRONTEND_DIR/dist"
  
  # Backend cleaning
  echo -e "${BLUE}Cleaning backend build artifacts (dotnet clean)...${RESET}"
  dotnet clean "$BACKEND_DIR"
  
  echo -e "${BLUE}Removing bin/ and obj/ folders in backend...${RESET}"
  rm -rf "$BACKEND_DIR/bin" "$BACKEND_DIR/obj"
  
  echo -e "${GREEN}✔ Cleaning completed successfully!${RESET}"
}

case $choice in
  1)
    run_concurrently
    ;;
  2)
    run_tabs
    ;;
  3)
    clean_caches
    run_concurrently
    ;;
  4|*)
    echo -e "\nExiting..."
    exit 0
    ;;
esac
