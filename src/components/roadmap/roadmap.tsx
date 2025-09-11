"use client";

import { getRoadmapById } from "@/actions/roadmaps";
import ExpandCollapse from "@/components/flow-components/expand-collapse";
import { Separator } from "@/components/ui/separator";
import { decodeFromURL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Home, Sparkles, Clock, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { GeneratorControls } from "@/components/flow-components/generator-controls";
import { useUIStore } from "../../lib/stores/useUI";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

interface Props {
  roadmapId?: string;
}

export default function Roadmap({ roadmapId }: Props) {
  const router = useRouter();
  const { model, query, setQuery, modelApiKey } = useUIStore(
    useShallow((state) => ({
      model: state.model,
      query: state.query,
      setQuery: state.setQuery,
      modelApiKey: state.modelApiKey,
    })),
  );

  const params = useSearchParams();
  const [timeoutError, setTimeoutError] = useState(false);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [generationError, setGenerationError] = useState<any>(null);
  
  // Handle topic query parameter from URL
  useEffect(() => {
    const topic = params.get('topic');
    console.log("🔍 URL topic:", topic);
    console.log("🔍 Current query:", query);
    if (topic && !query) {
      console.log("🔍 Setting query from URL topic:", topic);
      setQuery(topic);
    }
  }, [params, query, setQuery]);

  const { data: roadmap, isPending: isRoadmapPending } = useQuery({
    queryFn: async () => {
      if (!roadmapId) return null;
      let roadmap = await getRoadmapById(roadmapId);
      if (roadmap && roadmap.content) {
        try {
          let json = JSON.parse(roadmap.content);
          roadmap.content = json;
          return roadmap;
        } catch (error) {
          console.error("Error parsing roadmap content:", error);
          return roadmap;
        }
      }
      return roadmap;
    },
    queryKey: ["Roadmap", roadmapId],
    enabled: Boolean(roadmapId),
  });

  // Direct API call function
  const generateRoadmap = useCallback(async (topic: string) => {
    console.log("🚀 Starting direct API call for:", topic);
    setIsGenerating(true);
    setGenerationError(null);
    setTimeoutError(false);
    
    try {
      const apiKeyParam = modelApiKey && modelApiKey.trim() !== "" ? `?apiKey=${modelApiKey}` : "";
      const url = `/api/v1/${model}/roadmap${apiKeyParam}`;
      
      console.log("📡 Making API call to:", url);
      console.log("📡 Request body:", { query: topic });
      
      const response = await axios.post(url, { query: topic }, {
        timeout: 30000,
      });
      
      console.log("✅ API call successful:", response.data);
      setGeneratedData(response.data);
      setIsGenerating(false);
    } catch (error) {
      console.error("❌ API call failed:", error);
      setGenerationError(error);
      setIsGenerating(false);
      setTimeoutError(true);
    }
  }, [model, modelApiKey]);

  // Simplified auto-generation logic
  useEffect(() => {
    const topic = params.get('topic');
    console.log("🔄 Auto-generation check:");
    console.log("  - Topic from URL:", topic);
    console.log("  - Current query:", query);
    console.log("  - Is generating:", isGenerating);
    console.log("  - Has generated data:", !!generatedData);
    console.log("  - Has triggered generation:", hasTriggeredGeneration);
    console.log("  - Model:", model);
    console.log("  - Model API Key:", modelApiKey ? "SET" : "NOT SET");
    
    // If we have a topic and haven't triggered generation yet, do it now
    if (topic && !hasTriggeredGeneration && !isGenerating && !generatedData) {
      console.log("🚀 Triggering generation for topic:", topic);
      setHasTriggeredGeneration(true);
      setQuery(topic);
      
      // Make the API call directly
      const makeApiCall = async () => {
        console.log("🚀 Starting direct API call for:", topic);
        setIsGenerating(true);
        setGenerationError(null);
        setTimeoutError(false);
        
        try {
          // Always make the API call - the backend will use environment API key if no user key provided
          const url = `/api/v1/${model}/roadmap`;
          
          console.log("📡 Making API call to:", url);
          console.log("📡 Request body:", { query: topic });
          console.log("📡 Model API Key available:", modelApiKey ? "YES" : "NO");
          
          const response = await axios.post(url, { 
            query: topic,
            ...(modelApiKey && modelApiKey.trim() !== "" ? { apiKey: modelApiKey } : {})
          }, {
            timeout: 30000,
          });
          
          console.log("✅ API call successful:", response.data);
          console.log("✅ Response status:", response.data.status);
          console.log("✅ Has tree data:", !!response.data.tree);
          
          if (response.data.status && response.data.tree) {
            setGeneratedData(response.data);
            setIsGenerating(false);
          } else {
            throw new Error(response.data.message || "Failed to generate roadmap");
          }
        } catch (error) {
          console.error("❌ API call failed:", error);
          setGenerationError(error);
          setIsGenerating(false);
          setTimeoutError(true);
        }
      };
      
      // Call immediately
      makeApiCall();
    }
  }, [params, hasTriggeredGeneration, isGenerating, generatedData, model, modelApiKey, setQuery]);

  // Fallback auto-generation with timeout
  useEffect(() => {
    const topic = params.get('topic');
    if (topic && !generatedData && !isGenerating) {
      const timeoutId = setTimeout(() => {
        if (!hasTriggeredGeneration && !generatedData) {
          console.log("⏰ Fallback auto-generation triggered for:", topic);
          setHasTriggeredGeneration(true);
          setQuery(topic);
          
          const makeApiCall = async () => {
            setIsGenerating(true);
            setGenerationError(null);
            setTimeoutError(false);
            
            try {
              const apiKeyParam = modelApiKey && modelApiKey.trim() !== "" ? `?apiKey=${modelApiKey}` : "";
              const url = `/api/v1/${model}/roadmap${apiKeyParam}`;
              
              const response = await axios.post(url, { query: topic }, {
                timeout: 30000,
              });
              
              setGeneratedData(response.data);
              setIsGenerating(false);
            } catch (error) {
              setGenerationError(error);
              setIsGenerating(false);
              setTimeoutError(true);
            }
          };
          
          makeApiCall();
        }
      }, 2000); // 2 second fallback
      
      return () => clearTimeout(timeoutId);
    }
  }, [params, generatedData, isGenerating, hasTriggeredGeneration, model, modelApiKey, setQuery]);

  // Component mount test
  useEffect(() => {
    console.log("🎯 Component mounted");
    console.log("🎯 Initial params:", params.toString());
    console.log("🎯 Initial query:", query);
    console.log("🎯 Initial model:", model);
    console.log("🎯 Initial modelApiKey:", modelApiKey ? "SET" : "NOT SET");
    console.log("🎯 Initial hasTriggeredGeneration:", hasTriggeredGeneration);
    console.log("🎯 Initial generatedData:", !!generatedData);
    console.log("🎯 Initial isGenerating:", isGenerating);
  }, [params, query, model, modelApiKey, hasTriggeredGeneration, generatedData, isGenerating]);

  // Reset trigger flag when topic changes
  useEffect(() => {
    const topic = params.get('topic');
    if (topic !== query) {
      setHasTriggeredGeneration(false);
      setGeneratedData(null);
      setGenerationError(null);
      console.log("🔄 Reset generation state");
    }
  }, [params, query]);

  // Monitor state changes and force re-render when data is ready
  useEffect(() => {
    console.log("📊 State update:");
    console.log("  - isGenerating:", isGenerating);
    console.log("  - has generated data:", !!generatedData);
    console.log("  - error:", generationError);
    if (!isGenerating && generatedData && generatedData.status && generatedData.tree) {
      console.log("✅ Roadmap generation completed successfully");
    }
    
    // Force component re-render when we have data but are still generating
    if (generatedData && generatedData.status && generatedData.tree && isGenerating) {
      console.log("🔄 Forcing isGenerating to false due to received data");
      setIsGenerating(false);
    }
  }, [isGenerating, generatedData, generationError]);

  // Timeout handling - if loading for more than 30 seconds, show error
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isGenerating) {
      timeoutId = setTimeout(() => {
        console.log("⏰ Request timeout - showing error");
        setTimeoutError(true);
      }, 30000); // 30 seconds
    } else {
      setTimeoutError(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isGenerating]);

  const roadmapData = roadmap?.content || generatedData?.tree || generatedData?.text?.tree || decodeFromURL(params);
  const renderFlow = roadmapData?.[0]?.name || "";
  
  // Debug the roadmap data structure
  console.log("🔍 Roadmap data structure:", {
    roadmapContent: roadmap?.content,
    generatedDataTree: generatedData?.tree,
    generatedDataTextTree: generatedData?.text?.tree,
    finalRoadmapData: roadmapData,
    renderFlow: renderFlow,
    hasData: roadmapData && roadmapData.length > 0
  });

  // Debug logging
  console.log("🔍 Final state:");
  console.log("  - Roadmap data:", roadmapData);
  console.log("  - Generated data:", generatedData);
  console.log("  - Is generating:", isGenerating);
  console.log("  - Has roadmap data:", roadmapData && roadmapData.length > 0);
  console.log("  - Data status:", generatedData?.status);
  console.log("  - Data tree:", generatedData?.tree);
  console.log("  - Roadmap content:", roadmap?.content);
  console.log("  - Model API Key:", modelApiKey ? "SET" : "NOT SET");
  console.log("  - Model:", model);
  console.log("  - Error:", generationError);
  console.log("  - Timeout error:", timeoutError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {query || 'AI Roadmap Generator'}
                </h1>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              {isGenerating ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : roadmapData && roadmapData.length > 0 ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Waiting</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <GeneratorControls
          mutate={async ({ body }: { body: { query: string } }) => {
            console.log("🚀 Mutate function called with query:", body.query);
            setQuery(body.query);
            setHasTriggeredGeneration(false);
            setGeneratedData(null);
            setGenerationError(null);
            
            // Trigger generation
            const makeApiCall = async () => {
              console.log("🚀 Starting mutate API call for:", body.query);
              setIsGenerating(true);
              setGenerationError(null);
              setTimeoutError(false);
              
              try {
                const url = `/api/v1/${model}/roadmap`;
                console.log("📡 Making mutate API call to:", url);
                
                const response = await axios.post(url, { 
                  query: body.query,
                  ...(modelApiKey && modelApiKey.trim() !== "" ? { apiKey: modelApiKey } : {})
                }, {
                  timeout: 30000,
                });
                
                console.log("✅ Mutate API call successful:", response.data);
                
                if (response.data.status && response.data.tree) {
                  setGeneratedData(response.data);
                  setIsGenerating(false);
                  setHasTriggeredGeneration(true);
                } else {
                  throw new Error(response.data.message || "Failed to generate roadmap");
                }
              } catch (error) {
                console.error("❌ Mutate API call failed:", error);
                setGenerationError(error);
                setIsGenerating(false);
              }
            };
            
            makeApiCall();
          }}
          isPending={isGenerating}
          renderFlow={renderFlow}
          roadmapId={generatedData?.roadmapId}
          dbRoadmapId={roadmapId || ""}
          visibility={roadmap?.visibility}
          title={query}
          key={roadmap?.visibility}
        />
      </div>
      {isGenerating ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            {/* Enhanced Loading Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Creating Your Roadmap</h3>
                <p className="text-gray-600">AI is analyzing and structuring your learning path...</p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Analyzing topic requirements</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-gray-700">Structuring learning modules</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-gray-700">Generating interactive roadmap</span>
                </div>
              </div>
            </div>
            
            {timeoutError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h4 className="font-medium text-amber-800">Taking Longer Than Expected</h4>
                </div>
                <p className="text-sm text-amber-700">
                  Complex roadmaps may take a bit longer. Please wait or try refreshing the page.
                </p>
              </div>
            )}
            {generationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <h4 className="font-medium text-red-800">Generation Error</h4>
                </div>
                <p className="text-sm text-red-700">
                  {(generationError as any)?.response?.data?.message || (generationError as any)?.message || "An unexpected error occurred"}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : isRoadmapPending && roadmapId ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Roadmap</h3>
            <p className="text-gray-600">Retrieving your saved roadmap...</p>
          </div>
        </div>
      ) : (
        <>
          {roadmapData && roadmapData.length > 0 ? (
            <div className="pb-8">
              <ExpandCollapse
                key={renderFlow}
                data={roadmapData}
                isPending={false} // Force isPending to false when we have data
                roadmapId={roadmapId}
              />
            </div>
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="text-center max-w-lg mx-auto px-4">
                <div className="mb-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Ready to Generate
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Your AI-powered learning roadmap will appear here
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-gray-700 font-medium">
                        Waiting for roadmap generation to begin
                      </p>
                    </div>
                    {generatedData && !generatedData.status && (
                      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold text-sm">!</span>
                          </div>
                          <h3 className="text-lg font-semibold text-red-800">
                            Generation Failed
                          </h3>
                        </div>
                        <p className="text-red-700 mb-4">
                          {generatedData.message || "Failed to generate roadmap"}
                        </p>
                        {generatedData.message?.includes("API key") && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-800 font-medium mb-3">
                              🔧 Quick Fix Required:
                            </p>
                            <ol className="text-amber-700 space-y-2 ml-4 list-decimal">
                              <li>Get a free API key from <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-medium">Groq Console</a></li>
                              <li>Add it to your Vercel environment variables as <code className="bg-gray-100 px-2 py-1 rounded text-sm">GROQ_API_KEY</code></li>
                              <li>Redeploy your application</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                    {generationError && (
                      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-bold text-sm">✕</span>
                          </div>
                          <h3 className="text-lg font-semibold text-red-800">
                            Generation Error
                          </h3>
                        </div>
                        <p className="text-red-700">
                          {(generationError as any)?.response?.data?.message || (generationError as any)?.message || "An error occurred during generation"}
                        </p>
                      </div>
                    )}
                    {params.get('topic') && !generatedData && !isGenerating && (
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-blue-800">
                            Ready to Generate
                          </h3>
                        </div>
                        <p className="text-blue-700 mb-4">
                          Auto-generation didn&apos;t start. Click below to create your personalized roadmap.
                        </p>
                        <button
                          onClick={() => {
                            const topic = params.get('topic');
                            if (topic) {
                              console.log("🚀 Manual generation triggered for:", topic);
                              setQuery(topic);
                              setHasTriggeredGeneration(false); // Reset to allow generation
                              setGeneratedData(null); // Clear previous data
                              setGenerationError(null); // Clear previous errors
                              
                              // Trigger generation immediately
                              const makeApiCall = async () => {
                                console.log("🚀 Starting manual API call for:", topic);
                                setIsGenerating(true);
                                setGenerationError(null);
                                setTimeoutError(false);
                                
                                try {
                                  const url = `/api/v1/${model}/roadmap`;
                                  console.log("📡 Making manual API call to:", url);
                                  
                                  const response = await axios.post(url, { 
                                    query: topic,
                                    ...(modelApiKey && modelApiKey.trim() !== "" ? { apiKey: modelApiKey } : {})
                                  }, {
                                    timeout: 30000,
                                  });
                                  
                                  console.log("✅ Manual API call successful:", response.data);
                                  
                                  if (response.data.status && response.data.tree) {
                                    setGeneratedData(response.data);
                                    setIsGenerating(false);
                                    setHasTriggeredGeneration(true);
                                  } else {
                                    throw new Error(response.data.message || "Failed to generate roadmap");
                                  }
                                } catch (error) {
                                  console.error("❌ Manual API call failed:", error);
                                  setGenerationError(error);
                                  setIsGenerating(false);
                                }
                              };
                              makeApiCall();
                            }
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          🚀 Generate Roadmap for &quot;{params.get('topic')}&quot;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
