# VocAIbulary - Conversational Vocabulary Learning

A modern, voice-first web application for learning English vocabulary through AI-powered conversations. Built with React, TypeScript, and Tailwind CSS featuring a stunning Liquid Glass design inspired by Apple's design language.

## 🚀 Features

- **Pure Voice Interaction**: Completely hands-free, conversational interface similar to Apple Siri
- **Liquid Glass Design**: Stunning translucent UI with backdrop blur effects and ethereal aesthetics
- **AI-Powered Clues**: Generate contextual vocabulary clues using OpenAI GPT
- **Text-to-Speech**: High-quality speech synthesis with ElevenLabs API and browser fallback
- **Speech Recognition**: Advanced voice input for seamless interaction
- **Oxford 3000 Database**: Complete vocabulary list organized by CEFR levels (A1-B2)
- **Progress Tracking**: Monitor learning progress and statistics
- **Responsive Design**: Seamless experience across all devices

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **APIs**: OpenAI GPT, ElevenLabs Text-to-Speech
- **Build Tool**: Vite
- **Design**: Liquid Glass aesthetic with Apple-inspired interactions

## 📋 Prerequisites

- Node.js 16+ and npm
- OpenAI API key (optional, for AI-generated clues)
- ElevenLabs API key (optional, for high-quality speech)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vocaibulary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   # ElevenLabs Configuration  
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   
   # Application Configuration
   VITE_APP_NAME=VocAIbulary
   VITE_APP_VERSION=1.0.0
   VITE_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎙️ Voice Commands

VocAIbulary responds to natural voice commands:

### Main Menu
- **"Start game"** - Begin vocabulary practice
- **"Select level A1/A2/B1/B2"** - Choose difficulty level

### During Game
- Simply speak your answer when prompted
- The app automatically listens after presenting each clue

### After Answers
- **"Next word"** - Continue to the next vocabulary word
- **"Go home"** - Return to the main menu

## 🎨 Liquid Glass Design

The application features a cutting-edge "Liquid Glass" design system:

- **Translucent Elements**: All UI components use backdrop blur and transparency
- **Ethereal Gradients**: Soft, multi-layered gradients create depth
- **Floating Animations**: Subtle animations enhance the liquid feel
- **Glowing Effects**: Interactive elements have soft, colored glows
- **Apple-Inspired**: Clean typography and spacing following Apple's design principles

## ⚙️ Configuration

### OpenAI Configuration

Edit `src/config/openai.config.js` to customize AI behavior:

```javascript
export const openAIConfig = {
  model: 'gpt-3.5-turbo',     // AI model to use
  temperature: 0.7,           // Response creativity (0-1)
  maxTokens: 150,            // Maximum response length
  rateLimits: {
    requestsPerMinute: 60,    // Rate limiting
    retryAttempts: 3          // Error retry attempts
  }
};
```

### ElevenLabs Configuration

Edit `src/config/elevenlabs.config.js` to customize speech synthesis:

```javascript
export const elevenLabsConfig = {
  defaultVoice: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Voice ID
    name: 'Rachel'                   // Voice name
  },
  voiceSettings: {
    stability: 0.5,           // Voice stability (0-1)
    similarityBoost: 0.5,     // Voice similarity (0-1)
    style: 0.0               // Style exaggeration (0-1)
  }
};
```

## 🔐 Security Best Practices

- **Environment Variables**: All API keys are stored in environment variables
- **Local Storage**: Keys are stored locally in the browser, never sent to servers
- **Rate Limiting**: Built-in rate limiting prevents API abuse
- **Error Handling**: Comprehensive error handling with fallback mechanisms
- **Validation**: Input validation and sanitization throughout

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── GameSetup.tsx   # Voice-controlled level selection
│   └── GameInterface.tsx # Main conversational game interface
├── config/             # Configuration files
│   ├── openai.config.js    # OpenAI settings
│   ├── elevenlabs.config.js # ElevenLabs settings
│   └── environment.config.js # Environment validation
├── data/               # Static data
│   └── oxford3000.ts  # Vocabulary database
├── hooks/              # Custom React hooks
│   └── useGameState.ts # Game state management
├── services/           # API services
│   ├── aiService.ts    # OpenAI integration
│   └── speechService.ts # Speech synthesis/recognition
├── utils/              # Utility functions
│   └── apiErrorHandler.js # Error handling utilities
└── styles/             # Global styles
    └── index.css       # Liquid Glass CSS + Tailwind
```

## 🔄 Fallback Mechanisms

- **OpenAI Unavailable**: Uses predefined clue templates
- **ElevenLabs Unavailable**: Falls back to browser speech synthesis
- **Speech Recognition Unavailable**: Provides clear error messaging
- **Network Issues**: Graceful degradation with user feedback

## 📊 Performance Optimization

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for expensive operations
- **Debouncing**: Input debouncing for speech recognition
- **Caching**: Local storage for user preferences and API responses
- **Bundle Optimization**: Tree shaking and minification

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Validation

The application automatically validates environment variables on startup:

```javascript
import { logEnvironmentStatus } from './config/environment.config.js';

// Logs configuration status in development
logEnvironmentStatus();
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure environment variables** in your hosting platform

3. **Deploy the `dist` folder** to your hosting service

### Recommended Hosting
- **Vercel**: Automatic deployments with environment variable support
- **Netlify**: Easy setup with form handling
- **GitHub Pages**: Free hosting for static sites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT API
- **ElevenLabs** for text-to-speech API
- **Oxford University Press** for the Oxford 3000 word list
- **Apple** for design inspiration and Liquid Glass aesthetic
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using modern web technologies and Apple-inspired Liquid Glass design principles.