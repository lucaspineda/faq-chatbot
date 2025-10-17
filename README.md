# Techinical decisions and approach

I started by designing the problem and thinking about the key decisions for the architecture. Once I began implementing, I realized some choices could be improved, so I iterated on the architecture as I went.

In order to achieve server-side authentication and keep the architecture simple, I chose Next.js with SSR for the frontend. This setup makes it easy to check user authentication on the server using NextAuth, and is straightforward to deploy to Amazon ECS Fargate.

For authentication, I used JWT with help from NextAuth, that simplified the setup. On the backend, validation of the user's JWT is happening to make sure only authenticated users are making requests. JWT tokens are also created for anonymous users for the logged off chat interaction.

For simplicity and speed, all database access (PostgreSQL) is handled on the Next.js side. Ideally, all backend operations would go through FastAPI, but for this project, FastAPI is focused on the agent ecosystem and Pinecone integration (RAG, semantic search, OpenAI calls). Next.js manages chat history, sessions, and user management directly.

On the frontend, I used Vercel's AI SDK to simplify building the chat UI and streaming agent responses.

A cursor-based pagination was added to the chat history. I set the message limit to 10 for demo purposes, but ideally it should be 20 or more so the system has time to load messages before the user scrolls too quickly and hits bugs.


# FAQ Chatbot - AI-Powered Chat Application

A full-stack chatbot application with anonymous and authenticated chat sessions, powered by OpenAI GPT-4o.


## Data Source

The project includes a `fintech_faqs.json` file containing all the FAQ questions and answers. This file is used to populate the Pinecone vector database for semantic search and retrieval-augmented generation (RAG).

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
- Vector database for semantic FAQ search (populated from `fintech_faqs.json`)
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
