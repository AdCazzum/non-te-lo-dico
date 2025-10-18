#!/bin/bash

# Script di verifica configurazione Vercel CI/CD

echo "🔍 Verifica Configurazione Vercel CI/CD"
echo "========================================"
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione di check
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1"
  fi
}

# 1. Check GitHub Workflow
echo "📋 File Configurazione:"
echo "----------------------"
if [ -f ".github/workflows/vercel-deploy.yml" ]; then
  echo -e "${GREEN}✓${NC} GitHub Action workflow presente"
else
  echo -e "${RED}✗${NC} GitHub Action workflow MANCANTE"
fi

# 2. Check vercel.json
if [ -f "packages/nextjs/vercel.json" ]; then
  echo -e "${GREEN}✓${NC} vercel.json presente"
  
  # Verifica installCommand
  if grep -q "Skipping install" packages/nextjs/vercel.json; then
    echo -e "${GREEN}✓${NC} installCommand configurato correttamente (skip)"
  else
    echo -e "${YELLOW}⚠${NC} installCommand potrebbe causare problemi"
  fi
  
  # Verifica buildCommand
  if grep -q "pnpm build" packages/nextjs/vercel.json; then
    echo -e "${GREEN}✓${NC} buildCommand configurato correttamente"
  fi
else
  echo -e "${RED}✗${NC} vercel.json MANCANTE"
fi

# 3. Check .vercel/project.json
if [ -f "packages/nextjs/.vercel/project.json" ]; then
  echo -e "${GREEN}✓${NC} Progetto Vercel collegato"
  PROJECT_ID=$(grep -o 'prj_[^"]*' packages/nextjs/.vercel/project.json)
  ORG_ID=$(grep -o 'team_[^"]*' packages/nextjs/.vercel/project.json)
  echo "  Project ID: $PROJECT_ID"
  echo "  Org ID: $ORG_ID"
else
  echo -e "${YELLOW}⚠${NC} .vercel/project.json non presente (verrà creato dal CI)"
fi

echo ""
echo "🔐 GitHub Secrets da Configurare:"
echo "--------------------------------"
echo -e "${YELLOW}!${NC} Verifica su: https://github.com/AdCazzum/non-te-lo-dico/settings/secrets/actions"
echo ""
echo "  VERCEL_TOKEN          → Da https://vercel.com/account/tokens"
echo "  VERCEL_ORG_ID         → team_KHXwAzbLIIexpQ0EnIbd6e96"
echo "  VERCEL_PROJECT_ID     → prj_ORPs1PDlfUEBTPU7RSFna8QcUwEs"

echo ""
echo "⚙️  Impostazioni Vercel Dashboard:"
echo "--------------------------------"
echo -e "${YELLOW}!${NC} Verifica su: https://vercel.com/mramundos-projects/non-te-lo-dico/settings"
echo ""
echo "  Root Directory: packages/nextjs"

echo ""
echo "🧪 Test Locale:"
echo "-------------"
echo "cd packages/nextjs && pnpm build"

echo ""
echo "🚀 Deploy:"
echo "---------"
echo "git add ."
echo "git commit -m '🚀 Fix Vercel CI/CD'"
echo "git push origin master"

echo ""
echo "📊 Monitor:"
echo "---------"
echo "GitHub Actions: https://github.com/AdCazzum/non-te-lo-dico/actions"
echo "Vercel Dashboard: https://vercel.com/mramundos-projects/non-te-lo-dico"
echo ""
