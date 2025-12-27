#!/bin/bash

# Ins Skript-Verzeichnis wechseln (funktioniert mit WSL-Pfaden)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || {
    echo "Failed to change to script directory"
    exit 1
}

echo "Working directory: $(pwd)"

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║            🚀 WhatsApp API Auto Deploy Script 🚀              ║${RESET}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Fehlerbehandlung aktivieren
set -e

# Trap für saubere Fehlerausgabe
trap 'echo -e "\n${RED}❌ Script failed at line $LINENO${RESET}"; exit 1' ERR

# Schritt 1: NPM Build
echo -e "${BLUE}[1/5] 📦 Building project...${RESET}"
npm run build
echo -e "${GREEN}✅ Build successful!${RESET}"
echo ""

# Schritt 2: Git Status prüfen
echo -e "${BLUE}[2/5] 📋 Checking Git status...${RESET}"
git status --short
echo ""

# Schritt 3: Commit Message eingeben
read -p "$(echo -e ${YELLOW}💬 Enter commit message \(or press Enter for default\): ${RESET})" commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update wa-api with new features"
fi
echo ""

# Schritt 4: Git Add, Commit, Push
echo -e "${BLUE}[3/5] 📤 Committing and pushing to Git...${RESET}"
git add .

if git commit -m "$commit_msg"; then
    echo -e "${GREEN}✅ Committed successfully!${RESET}"
else
    echo -e "${YELLOW}⚠️  Nothing to commit or commit failed${RESET}"
fi

if git push; then
    echo -e "${GREEN}✅ Pushed to Git successfully!${RESET}"
else
    echo -e "${RED}❌ Git push failed!${RESET}"
    exit 1
fi
echo ""

# Schritt 5: NPM Publish (optional)
echo -e "${BLUE}[4/5] 📢 NPM Publish${RESET}"
read -p "$(echo -e ${YELLOW}Do you want to publish to NPM? \(y/N\): ${RESET})" do_publish
if [[ "$do_publish" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Publishing to NPM...${RESET}"
    if npm publish --access public; then
        echo -e "${GREEN}✅ Published to NPM successfully!${RESET}"
        published=true
    else
        echo -e "${RED}❌ NPM publish failed!${RESET}"
        echo -e "${YELLOW}💡 Tip: Make sure you're logged in with 'npm login'${RESET}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping NPM publish${RESET}"
    published=false
fi
echo ""

# Fertig
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║                    ✨ Deployment Complete! ✨                 ║${RESET}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BLUE}Summary:${RESET}"
echo -e "  • Build: ${GREEN}✓${RESET}"
echo -e "  • Git Push: ${GREEN}✓${RESET}"
if [ "$published" = true ]; then
    echo -e "  • NPM Publish: ${GREEN}✓${RESET}"
else
    echo -e "  • NPM Publish: ${YELLOW}Skipped${RESET}"
fi
echo ""
