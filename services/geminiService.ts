import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskPriority, TaskStatus } from "../types";

// Initialize Gemini Client
// In a real app, never expose keys on the client. This is for the requested demo architecture.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTasksFromGoal = async (
  projectId: string,
  goal: string
): Promise<Omit<Task, 'id' | 'createdAt'>[]> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return [];
  }

  try {
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: `Break down the project management goal: "${goal}" into 4-8 actionable tasks. Return a JSON list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Concise task title" },
              description: { type: Type.STRING, description: "Short description of what needs to be done" },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
            },
            required: ["title", "priority"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const generatedItems = JSON.parse(jsonText) as any[];

    return generatedItems.map((item) => ({
      projectId,
      title: item.title,
      description: item.description || '',
      status: TaskStatus.TODO,
      priority: item.priority as TaskPriority || TaskPriority.MEDIUM,
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const summarizeProject = async (tasks: Task[]): Promise<string> => {
    if (!apiKey) return "AI Summary unavailable (No API Key).";
    
    if (tasks.length === 0) return "No tasks to summarize.";

    try {
        const taskList = tasks.map(t => `- [${t.status}] ${t.title} (${t.priority})`).join('\n');
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Summarize the current status of this project based on these tasks in 2-3 sentences. Be professional and encouraging:\n\n${taskList}`
        });
        return response.text || "Could not generate summary.";
    } catch (e) {
        console.error(e);
        return "Error generating summary.";
    }
}
