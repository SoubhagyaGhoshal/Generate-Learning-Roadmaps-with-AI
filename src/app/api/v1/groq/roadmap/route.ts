import {
  incrementRoadmapSearchCount,
  incrementUserCredits,
  saveRoadmap,
} from "@/actions/roadmaps";
import { decrementCreditsByUserId } from "@/actions/users";
import { Node } from "@/lib/shared/types/common";
import { db } from "@/lib/db";
import { JSONType } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.nextUrl.searchParams.get("apiKey");
    const body = await req.json();
    const query = body.query;

    // Debug logging
    console.log("=== GROQ API ROUTE DEBUG ===");
    console.log("API Key from params:", apiKey);
    console.log("API Key type:", typeof apiKey);
    console.log("Environment GROQ_API_KEY:", process.env.GROQ_API_KEY ? "available" : "not available");
    console.log("Query:", query);
    console.log("Request URL:", req.url);

    // Check if we have an API key (either from user or environment)
    // If apiKey is empty string or null, use environment variable
    const groqApiKey = (apiKey && apiKey.trim() !== "") ? apiKey : process.env.GROQ_API_KEY;
    
    console.log("Final API key to use:", groqApiKey ? "available" : "not available");
    
    if (!groqApiKey || groqApiKey === "your_groq_api_key_here") {
      console.error("No valid API key available - neither from params nor environment");
      return NextResponse.json(
        { 
          status: false, 
          message: "No valid API key provided. Please add your own API key using the 'Add Key' button in the interface, or get a free API key from https://console.groq.com/ and add it to your environment variables." 
        },
        { status: 400 },
      );
    }

    console.log("Using API key:", groqApiKey ? "available" : "not available");

    const openai = new OpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    if (!query) {
      return NextResponse.json(
        { status: false, message: "Please send query." },
        { status: 400 },
      );
    }

    // Use exact matching instead of substring matching to prevent "java" from matching "javascript"
    const normalizedQuery = query.trim().toLowerCase();

    let alreadyExists = null;
    try {
      alreadyExists = await db.roadmap.findFirst({
        where: {
          title: {
            mode: "insensitive",
            equals: normalizedQuery,
          },
        },
      });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      // Continue without database check if there's a connection issue
    }

    if (alreadyExists) {
      try {
        await incrementRoadmapSearchCount(alreadyExists.id);
        const tree = JSON.parse(alreadyExists.content);
        return NextResponse.json(
          { status: true, tree, roadmapId: alreadyExists.id },
          { status: 200 },
        );
      } catch (error) {
        console.error("Error processing existing roadmap:", error);
        // Continue with generation if there's an error processing existing roadmap
      }
    }

    console.log("Generating roadmap for query:", query);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      const text = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant that generates learning roadmaps. Create structured learning paths from beginner to advanced. Always provide at least 4 modules per chapter. Include Wikipedia links when possible. You must return ONLY valid JSON, no additional text or explanations. IMPORTANT: Use the exact query term provided by the user - do not substitute or interpret it differently.",
          },
          {
            role: "user",
            content: `Generate a learning roadmap for "${query}" in this exact JSON format. Return ONLY the JSON, no other text. Use "${query}" exactly as provided - do not change or interpret the query term:

{
  "query": "${query}",
  "chapters": {
    "Fundamentals": [
      {
        "moduleName": "Introduction to ${query}",
        "moduleDescription": "Basic concepts and overview",
        "link": "https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}"
      }
    ],
    "Intermediate": [
      {
        "moduleName": "Advanced ${query} Concepts",
        "moduleDescription": "Deeper understanding and practical applications",
        "link": "https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}_programming"
      }
    ]
  }
}

Generate 3-5 chapters with 4-6 modules each. Return ONLY the JSON object. Use "${query}" exactly as provided.`,
          },
        ],
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("Groq response:", text?.choices?.[0]?.message?.content);

      // Only check credits if user didn't provide their own API key
      if (!apiKey) {
        try {
          const creditsRemaining = await decrementCreditsByUserId();
          if (!creditsRemaining) {
            return NextResponse.json(
              {
                status: true,
                message: "No credits remaining",
              },
              { status: 400 },
            );
          }
        } catch (e) {
          await incrementUserCredits();
          console.log(e);
          return NextResponse.json(
            {
              status: false,
              message: "An error occurred while managing credits.",
            },
            { status: 500 },
          );
        }
      }

      let json: JSONType | null = null;

      try {
        const responseContent = text?.choices?.[0]?.message?.content;
        console.log("Response content:", responseContent);
        
        if (!responseContent) {
          return NextResponse.json(
            {
              status: false,
              message: "No response content from AI model",
            },
            { status: 500 },
          );
        }

        // Try to extract JSON from the response
        let jsonString = responseContent.trim();
        
        // If the response contains markdown code blocks, extract the JSON
        if (jsonString.includes("```json")) {
          jsonString = jsonString.split("```json")[1]?.split("```")[0] || jsonString;
        } else if (jsonString.includes("```")) {
          jsonString = jsonString.split("```")[1]?.split("```")[0] || jsonString;
        }
        
        jsonString = jsonString.trim();
        
        json = JSON.parse(jsonString);
        console.log("Parsed JSON:", json);
        
        if (!json) {
          return NextResponse.json(
            {
              status: false,
              message: "Invalid JSON response from AI model",
            },
            { status: 500 },
          );
        }
        
        // Verify that the query in the response matches the original query
        if (json.query !== query) {
          console.log(`Query mismatch: original="${query}", response="${json.query}"`);
          // Force the correct query
          json.query = query;
        }
        
        if (!json.chapters) {
          return NextResponse.json(
            {
              status: false,
              message: "Invalid response format from AI model",
            },
            { status: 500 },
          );
        }

        const tree: Node[] = [
          {
            name: capitalize(json.query),
            children: Object.keys(json.chapters).map((sectionName) => ({
              name: sectionName,
              children: json?.chapters?.[sectionName]?.map(
                ({ moduleName, link, moduleDescription }) => ({
                  name: moduleName,
                  moduleDescription,
                  link,
                }),
              ),
            })),
          },
        ];

        console.log("Generated tree:", tree);
        
        let savedRoadmap = null;
        try {
          const { data } = await saveRoadmap(query, tree);
          savedRoadmap = data;
        } catch (saveError) {
          console.error("Error saving roadmap to database:", saveError);
          // Continue without saving if database is unavailable
        }
        
        return NextResponse.json(
          { status: true, text: json, tree, roadmapId: savedRoadmap?.id },
          { status: 200 },
        );
      } catch (e) {
        console.error("Error parsing response:", e);
        return NextResponse.json(
          {
            status: false,
            message: "An unexpected error occurred while generating roadmap. Please try again or use a different keyword/query.",
            error: e instanceof Error ? e.message : "Unknown error",
          },
          { status: 500 },
        );
      }
         } catch (error) {
       clearTimeout(timeoutId);
       if (error instanceof Error && error.name === 'AbortError') {
         return NextResponse.json(
           {
             status: false,
             message: "Request timed out. Please try again.",
           },
           { status: 408 },
         );
       }
       throw error;
     }
  } catch (e) {
    console.error("Error in roadmap generation:", e);
    
    // Check if it's an API key error
    if (e instanceof Error && (e.message.includes("Invalid API Key") || e.message.includes("invalid_api_key"))) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid API key. Please add your own API key using the 'Add Key' button in the interface, or get a free API key from https://console.groq.com/",
        },
        { status: 400 },
      );
    }
    
    // Check if it's a model decommissioned error
    if (e instanceof Error && (e.message.includes("decommissioned") || e.message.includes("model_decommissioned"))) {
      return NextResponse.json(
        {
          status: false,
          message: "The AI model has been updated. Please refresh the page and try again.",
        },
        { status: 400 },
      );
    }
    
    return NextResponse.json(
      {
        status: false,
        message:
          "An unexpected error occurred while generating roadmap. Please try again or use a different keyword/query.",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 400 },
    );
  }
};
