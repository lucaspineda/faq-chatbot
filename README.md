# FAQ Chatbot - AI-Powered Chat Application

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** - [Install Docker](https://docs.docker.com/get-docker/)
  - macOS/Windows: Docker Desktop
  - Linux: Docker Engine + Docker Compose plugin
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Setup (5 minutes)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd faq_chatbot
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Follow the prompts**
   - The script will auto-generate `NEXTAUTH_SECRET` ✅
   - When prompted, add your **OpenAI API key** to the `.env` file
   - Press Enter to continue

4. **Wait for services to start** (~3-5 minutes)
   - Docker will build and start all services
   - PostgreSQL database
   - FastAPI backend
   - Next.js frontend

5. **Access the application**
   - **Frontend:** http://localhost:3000

---

### Missing OpenAI API key
```bash
# Edit .env file and add your key
OPENAI_API_KEY=sk-your-key-here
```


