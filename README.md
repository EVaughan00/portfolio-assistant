# AI-Powered Portfolio Assistant

An innovative portfolio website that combines traditional project showcasing with AI-powered conversational interactions. Users can explore portfolio projects through an intelligent chat interface that understands and discusses the work in detail.

## 🚀 Unique Features

### AI-Powered Portfolio Exploration
- **Conversational Interface**: Chat with an AI assistant about portfolio projects
- **Context-Aware Responses**: AI understands project details, descriptions, and technical context
- **Interactive Project Display**: Projects are presented as interactive artifacts in a slide-out panel
- **Smart Suggestions**: Get intelligent suggestions for exploring different aspects of the portfolio

### Dynamic Portfolio Management
- **Real-time Project Creation**: Add new portfolio projects with rich descriptions
- **Image Gallery Support**: Upload and manage project images with automatic optimization
- **Custom AI Context**: Add private context for the AI to better understand and discuss projects
- **Live Editing**: Edit project details and see changes reflected immediately in chat interactions

### Intelligent User Experience
- **Guest & Authenticated Modes**: Explore as a guest or sign up for full portfolio management
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Sidebar Navigation**: Quick access to chat history and portfolio management
- **Smart Scrolling**: Optimized viewing with intelligent scrolling for long project lists

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible component primitives

### AI & Data
- **AI SDK** - Streaming AI responses and conversation management
- **SWR** - Data fetching and caching
- **Custom AI Tools** - Portfolio display, document management, and suggestions

### Backend & Database
- **Drizzle ORM** - Type-safe database operations
- **NextAuth.js** - Authentication with guest and user modes
- **File Upload API** - Image handling and storage
- **API Routes** - RESTful endpoints for portfolio and chat management

### Developer Experience
- **Biome** - Fast code formatting and linting
- **Playwright** - End-to-end testing
- **TypeScript** - Full type safety across the stack

## 📁 Project Structure

```
portfolio-assistant/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Main chat interface
│   └── api/               # API endpoints
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── artifact.tsx     # Portfolio artifact display
│   ├── suggested-actions.tsx # Smart portfolio suggestions
│   └── portfolio-*.tsx   # Portfolio management components
├── lib/                   # Shared utilities
│   ├── ai/               # AI tools and prompts
│   ├── db/               # Database schema and queries
│   └── types.ts          # TypeScript definitions
├── hooks/                 # Custom React hooks
└── tests/                # E2E and integration tests
```

## 🎯 Use Cases

### For Portfolio Owners
1. **Showcase Projects Intelligently**: Let visitors explore your work through natural conversation
2. **Reduce Repetitive Questions**: AI handles common inquiries about your projects and experience
3. **Enhanced Engagement**: Visitors spend more time exploring through interactive chat
4. **Easy Management**: Add, edit, and organize projects through a clean interface

### For Portfolio Visitors
1. **Natural Exploration**: Ask questions about projects in plain language
2. **Deep Dive Capability**: Get detailed explanations of technical implementations
3. **Personalized Tour**: AI guides you through relevant projects based on your interests
4. **Interactive Learning**: Understand the thinking and process behind each project

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Package manager (npm, pnpm, or yarn)
- Database (configured via environment variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage

### Basic Portfolio Interaction
1. **Start a Conversation**: Click on any suggested portfolio project or type a question
2. **Explore Projects**: Ask about specific technologies, challenges, or implementation details
3. **View Artifacts**: Projects open in an interactive side panel for detailed viewing
4. **Navigate Easily**: Use the sidebar to access different chats and portfolio sections

### Portfolio Management (Authenticated Users)
1. **Add Projects**: Click the "+" button to create new portfolio entries
2. **Upload Images**: Add project screenshots and visuals
3. **Set AI Context**: Provide private context to help AI discuss your projects accurately
4. **Edit Anytime**: Update project details and see changes reflected immediately

### Guest Experience
- Browse and chat about existing portfolio projects
- Get intelligent responses about work and experience
- Seamless experience without requiring registration

### Environment Variables
Ensure all required environment variables are configured:
- Database connection
- Authentication providers
- AI API keys
- File storage configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, AI, and modern web technologies**
