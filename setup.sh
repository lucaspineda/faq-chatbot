#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FAQ Chatbot - Quick Setup Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running!${NC}"
  echo -e "${YELLOW}   Please start Docker Desktop and run this script again.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if .env exists
if [ ! -f .env ]; then
  echo ""
  echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
  cp .env.example .env
  
  # Auto-generate NEXTAUTH_SECRET
  echo ""
  echo -e "${YELLOW}🔐 Generating NEXTAUTH_SECRET...${NC}"
  GENERATED_SECRET=$(openssl rand -base64 32)
  
  # Replace placeholder in .env
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXTAUTH_SECRET=your-nextauth-secret-here-generate-with-openssl|NEXTAUTH_SECRET=$GENERATED_SECRET|g" .env
  else
    # Linux
    sed -i "s|NEXTAUTH_SECRET=your-nextauth-secret-here-generate-with-openssl|NEXTAUTH_SECRET=$GENERATED_SECRET|g" .env
  fi
  
  echo -e "${GREEN}✅ NEXTAUTH_SECRET generated and added to .env${NC}"
  
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════${NC}"
  echo -e "${YELLOW}⚠️  ACTION REQUIRED: Add your OpenAI API key${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════${NC}"
  echo ""
  echo "1. Open .env file and add your OPENAI_API_KEY"
  echo "   Get one at: https://platform.openai.com/api-keys"
  echo ""
  echo "2. (Optional) Add Pinecone credentials for RAG features"
  echo ""
  echo -e "${YELLOW}Press Enter after you've updated the .env file...${NC}"
  read -r
else
  echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Validate required environment variables
echo ""
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

# Source .env file
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your-nextauth-secret-here-generate-with-openssl" ]; then
  echo -e "${RED}❌ NEXTAUTH_SECRET not set!${NC}"
  echo -e "${YELLOW}   Generate one with: openssl rand -base64 32${NC}"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "sk-your-openai-api-key-here" ]; then
  echo -e "${RED}❌ OPENAI_API_KEY not set!${NC}"
  echo -e "${YELLOW}   Get one at: https://platform.openai.com/api-keys${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Start services with Docker Compose
echo ""
echo -e "${YELLOW}� Starting services with Docker Compose...${NC}"
echo -e "${BLUE}   This may take a few minutes on first run...${NC}"
echo ""

docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
POSTGRES_STATUS=$(docker-compose ps postgres | grep -c "healthy")
BACKEND_STATUS=$(docker-compose ps backend | grep -c "Up")
FRONTEND_STATUS=$(docker-compose ps frontend | grep -c "Up")

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   Service Status${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

if [ "$POSTGRES_STATUS" -eq 1 ]; then
  echo -e "   PostgreSQL:  ${GREEN}✅ Running${NC}"
else
  echo -e "   PostgreSQL:  ${RED}❌ Not ready${NC}"
fi

if [ "$BACKEND_STATUS" -eq 1 ]; then
  echo -e "   Backend:     ${GREEN}✅ Running${NC}"
else
  echo -e "   Backend:     ${RED}❌ Not ready${NC}"
fi

if [ "$FRONTEND_STATUS" -eq 1 ]; then
  echo -e "   Frontend:    ${GREEN}✅ Running${NC}"
else
  echo -e "   Frontend:    ${RED}❌ Not ready${NC}"
fi

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Success message
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   Access Your Application${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "   Frontend:      ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend API:   ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   Useful Commands${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   View database:       cd faq-chatbot-frontend && npx prisma studio"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Run 'docker-compose logs -f' to monitor real-time logs${NC}"
echo ""

