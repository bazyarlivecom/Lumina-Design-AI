import React, { useState, useEffect, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { ChatInterface } from './components/ChatInterface';
import { Button } from './components/Button';
import { AppState, ChatMessage, StyleOption, STYLES } from './types';
import { generateRoomDesign, editRoomDesign, createChatSession, sendMessageToChat } from './services/geminiService';
import { Wand2, RotateCcw, AlertCircle } from 'lucide-react';

// Initialize chat session outside component to persist across renders if needed, 
// but inside is safer for resets. Let's use a ref or state inside.

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<any>(null);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  // Initialize Chat Session on load
  useEffect(() => {
    const session = createChatSession();
    setChatSession(session);
  }, []);

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    setAppState(AppState.EDITOR);
    setGeneratedImage(null); // Reset prev generations
    setSelectedStyle(null);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setAppState(AppState.UPLOAD);
    setChatMessages([]);
    setChatSession(createChatSession()); // New session
  };

  const handleStyleSelect = async (style: StyleOption) => {
    if (!originalImage || isGenerating) return;
    
    setSelectedStyle(style.id);
    setIsGenerating(true);
    
    try {
      const result = await generateRoomDesign(originalImage, style.prompt);
      setGeneratedImage(result);
      
      // Add a system message to chat to indicate style change
      const sysMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: `I've reimagined your room in the ${style.name} style. How do you like it? You can ask me to change specific details or find items to buy.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, sysMsg]);
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSession) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatProcessing(true);

    try {
      // Determine which image is the current context
      const contextImage = generatedImage || originalImage;
      if (!contextImage) return;

      const response = await sendMessageToChat(chatSession, text, contextImage);
      
      if (response.editPrompt) {
        // The model decided we need to edit the image visually
        const loadingMsg: ChatMessage = {
          id: Date.now().toString() + '_loading',
          role: 'model',
          text: "Applying your changes...",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, loadingMsg]);

        try {
            // EDIT FLOW: Use gemini-2.5-flash-image
            const editedImage = await editRoomDesign(contextImage, response.editPrompt);
            setGeneratedImage(editedImage);
            
            // Remove loading msg and add success
            setChatMessages(prev => prev.filter(m => !m.id.endsWith('_loading')));
            
            const successMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'model',
              text: `I've updated the design to: "${response.editPrompt}". Let me know if you want more changes!`,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, successMsg]);
            
        } catch (editErr) {
            setChatMessages(prev => prev.filter(m => !m.id.endsWith('_loading')));
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'model',
                text: "I tried to edit the image but encountered an error. Please try a different instruction.",
                timestamp: new Date(),
                isError: true
            };
            setChatMessages(prev => [...prev, errorMsg]);
        }

      } else {
        // Standard Text/Search Response
        const modelMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          text: response.text || "I didn't quite get that.",
          groundingLinks: response.groundingLinks,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, modelMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wand2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Lumina Design AI</h1>
          </div>
          {appState === AppState.EDITOR && (
             <Button variant="ghost" onClick={handleReset} size="sm" icon={<RotateCcw size={16} />}>
               New Project
             </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)]">
        
        {appState === AppState.UPLOAD && (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in-up">
             <div className="max-w-2xl w-full">
               <div className="text-center mb-10">
                 <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Reimagine your space instantly.</h2>
                 <p className="text-lg text-gray-600">
                   Upload a photo of your room and let our AI create stunning interior design variations in seconds.
                 </p>
               </div>
               <ImageUpload onImageSelected={handleImageSelected} />
             </div>
          </div>
        )}

        {appState === AppState.EDITOR && originalImage && (
          <div className="flex flex-col lg:flex-row h-full gap-6">
            {/* Left Column: Visualizer */}
            <div className="flex-1 flex flex-col min-h-0">
               {/* Main Canvas */}
               <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 min-h-[400px]">
                 <CompareSlider 
                   original={originalImage} 
                   generated={generatedImage} 
                 />
                 
                 {isGenerating && (
                   <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                     <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                     <p className="font-medium animate-pulse">Generating your new design...</p>
                   </div>
                 )}
               </div>

               {/* Style Controls */}
               <div className="mt-6">
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Choose a Style</h3>
                 <StyleCarousel 
                   onSelect={handleStyleSelect} 
                   selectedId={selectedStyle} 
                   disabled={isGenerating} 
                 />
               </div>
            </div>

            {/* Right Column: Chat Assistant */}
            <div className="w-full lg:w-[400px] flex flex-col h-[500px] lg:h-auto">
               <ChatInterface 
                 messages={chatMessages} 
                 onSendMessage={handleSendMessage} 
                 isProcessing={isChatProcessing}
               />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;