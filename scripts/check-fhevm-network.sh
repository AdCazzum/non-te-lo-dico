#!/bin/bash

# Check FHEVM Network Setup

echo "🔍 Checking FHEVM Network Configuration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Hardhat node is running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Hardhat node is running on port 8545${NC}"
    HARDHAT_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Hardhat node is NOT running on port 8545${NC}"
    HARDHAT_RUNNING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check scaffold.config.ts
CONFIG_FILE="packages/nextjs/scaffold.config.ts"
if [ -f "$CONFIG_FILE" ]; then
    if grep -q "chains.hardhat" "$CONFIG_FILE"; then
        echo -e "${GREEN}✅ Frontend configured for Hardhat local network${NC}"
        USING_HARDHAT=true
    elif grep -q "chains.sepolia" "$CONFIG_FILE"; then
        echo -e "${YELLOW}⚠️  Frontend configured for Sepolia testnet${NC}"
        USING_HARDHAT=false
    else
        echo -e "${YELLOW}⚠️  Could not determine network configuration${NC}"
        USING_HARDHAT=unknown
    fi
else
    echo -e "${RED}❌ scaffold.config.ts not found${NC}"
    USING_HARDHAT=unknown
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Recommendations
if [ "$USING_HARDHAT" = true ] && [ "$HARDHAT_RUNNING" = true ]; then
    echo -e "${GREEN}✨ Perfect! Your setup is ready for FHEVM decryption!${NC}"
    echo ""
    echo "You can now:"
    echo "  1. Upload files (encryption works on any network)"
    echo "  2. Retrieve and decrypt files (decryption works on Hardhat)"
    echo ""
    echo -e "${BLUE}📍 Make sure MetaMask is connected to:${NC}"
    echo "  • Network: Hardhat Local"
    echo "  • RPC URL: http://localhost:8545"
    echo "  • Chain ID: 31337"

elif [ "$USING_HARDHAT" = true ] && [ "$HARDHAT_RUNNING" = false ]; then
    echo -e "${YELLOW}⚠️  Frontend is configured for Hardhat, but node is not running${NC}"
    echo ""
    echo "To start Hardhat node with FHEVM:"
    echo ""
    echo -e "${BLUE}cd packages/hardhat${NC}"
    echo -e "${BLUE}pnpm run node:fhevm${NC}"
    echo ""
    echo "Then in another terminal:"
    echo -e "${BLUE}cd packages/hardhat${NC}"
    echo -e "${BLUE}pnpm run deploy:local${NC}"

elif [ "$USING_HARDHAT" = false ]; then
    echo -e "${RED}❌ Current setup will NOT work for decryption!${NC}"
    echo ""
    echo -e "${YELLOW}Sepolia testnet does not have an FHEVM relayer gateway.${NC}"
    echo "Decryption will fail with 'Relayer didn't respond' error."
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}Solution: Switch to Hardhat Local Network${NC}"
    echo ""
    echo "1. Update scaffold.config.ts:"
    echo ""
    echo -e "${BLUE}   targetNetworks: [chains.hardhat],${NC}"
    echo ""
    echo "2. Start Hardhat node (Terminal 1):"
    echo ""
    echo -e "${BLUE}   cd packages/hardhat${NC}"
    echo -e "${BLUE}   pnpm run node:fhevm${NC}"
    echo ""
    echo "3. Deploy contracts (Terminal 2):"
    echo ""
    echo -e "${BLUE}   cd packages/hardhat${NC}"
    echo -e "${BLUE}   pnpm run deploy:local${NC}"
    echo ""
    echo "4. Connect MetaMask to Hardhat:"
    echo "   • Network: Hardhat Local"
    echo "   • RPC URL: http://localhost:8545"
    echo "   • Chain ID: 31337"
    echo ""
    echo "5. Import test account from Hardhat logs"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo -e "${BLUE}📖 For detailed instructions, see:${NC}"
    echo "   FIX_RELAYER_ERROR.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Network comparison
echo -e "${BLUE}📊 FHEVM Network Comparison:${NC}"
echo ""
echo "┌─────────────────────┬──────────────┬──────────────┐"
echo "│ Feature             │ Hardhat      │ Sepolia      │"
echo "├─────────────────────┼──────────────┼──────────────┤"
echo "│ File Upload         │ ✅ Works     │ ✅ Works     │"
echo "│ File Encryption     │ ✅ Works     │ ✅ Works     │"
echo "│ IPFS Storage        │ ✅ Works     │ ✅ Works     │"
echo "│ Smart Contract      │ ✅ Works     │ ✅ Works     │"
echo "│ FHEVM Relayer       │ ✅ Included  │ ❌ Missing   │"
echo "│ File Decryption     │ ✅ Works     │ ❌ Fails     │"
echo "└─────────────────────┴──────────────┴──────────────┘"
echo ""

# Exit code based on setup
if [ "$USING_HARDHAT" = true ] && [ "$HARDHAT_RUNNING" = true ]; then
    exit 0
else
    exit 1
fi
