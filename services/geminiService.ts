import { 
  GoogleGenAI, 
  Type, 
  FunctionDeclaration, 
  Tool,
  Chat
} from "@google/genai";
import { ChatMessage } from "../types";

// API Key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Image Generation (Gemini 2.5 Flash Image) ---

export const generateRoomDesign = async (
  originalImageBase64: string,
  stylePrompt: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash-image';
    
    // Clean base64 if needed
    const cleanBase64 = originalImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: `Redesign this room in the following style: ${stylePrompt}. 
                   Keep the structural layout of the room (walls, windows, ceiling) exactly the same. 
                   Replace furniture and decor to match the style. 
                   High quality, photorealistic, architectural photography.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    });

    // Extract image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating design:", error);
    throw error;
  }
};

export const editRoomDesign = async (
  currentImageBase64: string,
  editPrompt: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash-image';
    const cleanBase64 = currentImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: `Edit this image based on the following instruction: ${editPrompt}. 
                   Maintain the photorealism and perspective. 
                   Do not change parts of the image unrelated to the instruction.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
     throw new Error("No image generated from edit");
  } catch (error) {
    console.error("Error editing design:", error);
    throw error;
  }
};

// --- Chat & Reasoning (Gemini 3 Pro Preview) ---

const editImageTool: FunctionDeclaration = {
  name: 'editImage',
  description: 'Edits the current room image based on visual instructions (e.g., change rug color, move sofa). Call this when the user wants to visually modify the design.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The specific instruction for editing the image (e.g., "make the walls blue").',
      },
    },
    required: ['prompt'],
  },
};

export const createChatSession = () => {
  const tools: Tool[] = [
    { functionDeclarations: [editImageTool] },
    { googleSearch: {} }
  ];

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      tools: tools,
      systemInstruction: `You are an expert Interior Design Consultant. 
      Your goal is to help users redesign their rooms.
      
      - If the user wants to change the look of the room visually (e.g. "change color", "add furniture", "remove object"), call the 'editImage' function.
      - If the user asks for shopping advice, trends, or general questions, use Google Search to provide answers with links.
      - Be concise, helpful, and encouraging.
      - When using Search, ALWAYS list the source URLs clearly.`
    }
  });
};

export const sendMessageToChat = async (
  chatSession: Chat,
  text: string,
  currentImageContext?: string // Base64 of what user is looking at
): Promise<{ 
  text?: string; 
  editPrompt?: string; 
  groundingLinks?: {title: string, url: string}[] 
}> => {
  
  // Construct message. If we have an image context, we can send it.
  const parts: any[] = [{ text }];
  
  if (currentImageContext) {
     const cleanBase64 = currentImageContext.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
     parts.push({
       inlineData: {
         mimeType: 'image/jpeg',
         data: cleanBase64
       }
     });
  }

  try {
    const response = await chatSession.sendMessage({
      message: parts
    });
    
    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'editImage') {
        const args = call.args as any;
        return { editPrompt: args.prompt };
      }
    }

    // Check for grounding (search results)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let links: {title: string, url: string}[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          links.push({
            title: chunk.web.title || 'Source',
            url: chunk.web.uri
          });
        }
      });
    }

    return { 
      text: response.text, 
      groundingLinks: links 
    };

  } catch (error) {
    console.error("Chat error:", error);
    return { text: "Sorry, I'm having trouble connecting to the design service right now." };
  }
};

export const sendToolResponse = async (
  chatSession: Chat,
  functionName: string,
  functionId: string,
  result: any
) => {
    // Implementation placeholder
};