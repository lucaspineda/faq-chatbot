# FAQ Chatbot - AI-Powered Chat Application

A full-stack chatbot application with anonymous and authenticated chat sessions, powered by OpenAI GPT-4o.

## 🚀 One-Command Setup

### Prerequisites

- **Docker Desktop** running on your machine - [Install Docker](https://docs.docker.com/get-docker/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Setup & Run (One Command!)

1. **Clone and run**
   ```bash
   git clone <your-repo-url>
   cd faq_chatbot
   ./setup.sh
   ```

2. **That's it!** The script will:
   - ✅ Check if Docker is running
   - ✅ Create `.env` file (or use existing)
   - ✅ Auto-generate security keys
   - ✅ Prompt for your OpenAI API key
   - ✅ Build and start all services
   - ✅ Open the app at **http://localhost:3000**

3. **First-time setup?** 
   - When prompted, edit `.env` and add your OpenAI API key
   - Press Enter to continue
   - Wait 15-30 seconds for services to start

4. **Already configured?**
   - The script will skip configuration and start immediately
   - Uses your existing `.env` file

---

## 🎯 Features

### Anonymous Users
- Chat with AI without authentication
- Clean, simple interface
- No data persistence
- Mobile-responsive design

### Authenticated Users  
- Full chat history with multiple sessions
- Vector database for semantic FAQ search
- Create and manage multiple chats
- AI-generated chat titles
- Cursor-Based Chat History Pagination (Limits customizables)
- Agent memory (Sending last 10 messages for context)
- Message persistence across sessions
- Sidebar with chat list


## 📋 Useful Commands

### View Logs
```bash
docker-compose logs -f
```

### Stop Application
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Clean Restart (Reset Everything)
```bash
docker-compose down -v
./setup.sh
```
