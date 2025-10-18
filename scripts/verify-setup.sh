#!/bin/bash

# FHE Data Storage - Setup Verification Script
# This script helps verify that everything is configured correctly

echo "🔍 FHE Data Storage - Setup Verification"
echo "========================================"
echo ""

# Check if .env.local exists
if [ -f "packages/nextjs/.env.local" ]; then
    echo "✅ .env.local file found"
    
    # Check if Pinata keys are set
    if grep -q "NEXT_PUBLIC_PINATA_API_KEY=" packages/nextjs/.env.local && \
       grep -q "NEXT_PUBLIC_PINATA_SECRET_KEY=" packages/nextjs/.env.local; then
        
        # Check if they have values (not empty)
        if grep -q 'NEXT_PUBLIC_PINATA_API_KEY=""' packages/nextjs/.env.local || \
           grep -q "NEXT_PUBLIC_PINATA_API_KEY=''" packages/nextjs/.env.local; then
            echo "⚠️  Pinata API key is empty"
            echo "   Please add your Pinata API key to .env.local"
        else
            echo "✅ Pinata API key is configured"
        fi
        
        if grep -q 'NEXT_PUBLIC_PINATA_SECRET_KEY=""' packages/nextjs/.env.local || \
           grep -q "NEXT_PUBLIC_PINATA_SECRET_KEY=''" packages/nextjs/.env.local; then
            echo "⚠️  Pinata secret key is empty"
            echo "   Please add your Pinata secret key to .env.local"
        else
            echo "✅ Pinata secret key is configured"
        fi
    else
        echo "⚠️  Pinata keys not found in .env.local"
        echo "   Add the following lines to packages/nextjs/.env.local:"
        echo "   NEXT_PUBLIC_PINATA_API_KEY=\"your_api_key\""
        echo "   NEXT_PUBLIC_PINATA_SECRET_KEY=\"your_secret_key\""
    fi
else
    echo "❌ .env.local file not found"
    echo "   Run: cp packages/nextjs/.env.example packages/nextjs/.env.local"
    echo "   Then add your Pinata API keys"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Get Pinata API keys from https://app.pinata.cloud/developers/api-keys"
echo "   2. Add them to packages/nextjs/.env.local"
echo "   3. Restart your development server"
echo "   4. Connect your wallet to Sepolia testnet"
echo "   5. Get test ETH from https://sepoliafaucet.com/"
echo ""
echo "📚 For detailed instructions, see: FHE_DATA_STORAGE_GUIDE.md"
echo ""
