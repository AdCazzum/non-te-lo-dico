#!/bin/bash

# 🚀 Start FHEVM Development Environment
# This script starts all necessary services for FHEVM decryption to work

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "════════════════════════════════════════════════════════"
echo "   🔐 FHEVM Development Environment Launcher"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

# Check if Hardhat node is already running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Hardhat node is already running on port 8545${NC}"
    echo ""
    read -p "Do you want to kill it and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Killing existing process...${NC}"
        lsof -ti:8545 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo -e "${GREEN}Using existing Hardhat node...${NC}"
        SKIP_NODE=true
    fi
fi

echo ""
echo -e "${BLUE}📦 Checking dependencies...${NC}"

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running pnpm install...${NC}"
    pnpm install
fi

echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

echo -e "${MAGENTA}"
echo "════════════════════════════════════════════════════════"
echo "   Step 1: Starting Hardhat FHEVM Node"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

if [ "$SKIP_NODE" != "true" ]; then
    cd packages/hardhat
    
    echo -e "${BLUE}Starting Hardhat node...${NC}"
    echo -e "${YELLOW}This will take a few seconds...${NC}"
    echo ""
    
    # Start Hardhat node in background
    pnpm run node:fhevm > ../../hardhat-node.log 2>&1 &
    HARDHAT_PID=$!
    
    # Wait for node to start
    echo -n "Waiting for node to start"
    for i in {1..30}; do
        if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo ""
            echo -e "${GREEN}✅ Hardhat node started (PID: $HARDHAT_PID)${NC}"
            echo -e "${CYAN}📝 Logs: hardhat-node.log${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo ""
        echo -e "${RED}❌ Failed to start Hardhat node${NC}"
        echo -e "${YELLOW}Check hardhat-node.log for errors${NC}"
        exit 1
    fi
    
    cd ../..
else
    cd packages/hardhat
fi

echo ""
echo -e "${MAGENTA}"
echo "════════════════════════════════════════════════════════"
echo "   Step 2: Deploying Smart Contracts"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${BLUE}Deploying contracts to localhost...${NC}"
sleep 2  # Give node time to fully initialize

if pnpm run deploy:local; then
    echo ""
    echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed to deploy contracts${NC}"
    cleanup
    exit 1
fi

cd ../..

echo ""
echo -e "${MAGENTA}"
echo "════════════════════════════════════════════════════════"
echo "   Step 3: Starting Frontend"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

cd packages/nextjs

echo -e "${BLUE}Starting Next.js development server...${NC}"
echo ""

# Start frontend in background
pnpm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -n "Waiting for frontend to start"
for i in {1..60}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
        echo -e "${CYAN}📝 Logs: frontend.log${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

cd ../..

echo ""
echo -e "${GREEN}"
echo "════════════════════════════════════════════════════════"
echo "   ✨ All Services Running Successfully!"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"
echo ""

echo -e "${CYAN}📊 Service Status:${NC}"
echo ""
echo -e "  ${GREEN}✅${NC} Hardhat FHEVM Node    → ${CYAN}http://localhost:8545${NC}"
echo -e "  ${GREEN}✅${NC} Smart Contracts       → ${CYAN}Deployed on localhost${NC}"
echo -e "  ${GREEN}✅${NC} Frontend              → ${CYAN}http://localhost:3000${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${MAGENTA}🔧 Next Steps - Configure MetaMask:${NC}"
echo ""
echo "  1. Add Network:"
echo -e "     ${CYAN}• Name:${NC}      Hardhat Local"
echo -e "     ${CYAN}• RPC URL:${NC}   http://localhost:8545"
echo -e "     ${CYAN}• Chain ID:${NC}  31337"
echo -e "     ${CYAN}• Symbol:${NC}    ETH"
echo ""
echo "  2. Import Test Account:"
echo -e "     ${CYAN}• Check hardhat-node.log for private keys${NC}"
echo -e "     ${CYAN}• MetaMask → Import Account → Paste private key${NC}"
echo ""
echo "  3. Open Application:"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "  ${CYAN}• Hardhat:${NC}  tail -f hardhat-node.log"
echo -e "  ${CYAN}• Frontend:${NC} tail -f frontend.log"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${RED}🛑 To stop all services: Press Ctrl+C${NC}"
echo ""

# Wait for user interrupt
wait
