'use client'
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  analyzeReference, 
  getSession, 
  getCategoryStats, 
  generateQuestions, 
  submitAnswers, 
  generateScript,
  getScripts
} from '@/services/api/scriptGenerator';
import ReferenceInput from '@/components/script-generator/ReferenceInput';
import QuestionForm from '@/components/script-generator/QuestionForm';
import GenerationProgress from '@/components/script-generator/GenerationProgress';
import ScriptResult from '@/components/script-generator/ScriptResult';
import ScriptHistory from '@/components/script-generator/ScriptHistory';
import { 
  Spinner, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Tabs, 
  Tab,
  Button
} from "@heroui/react";

// Workflow stages
const STAGES = {
  INPUT: 'input',
  ANALYZING: 'analyzing',
  ANALYSIS_COMPLETE: 'analysis_complete',
  QUESTIONS: 'questions',
  GENERATING: 'generating',
  RESULT: 'result'
};

export default function ScriptGeneratorPage() {
  // Auth context
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // State management
  const [stage, setStage] = useState(STAGES.INPUT);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [questions, setQuestions] = useState([]);
  const [script, setScript] = useState(null);
  const [scriptHistory, setScriptHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [title, setTitle] = useState('');
  
  // Polling interval for checking session status
  const [pollingActive, setPollingActive] = useState(false);
  
  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);
  
  // Poll for session updates
  useEffect(() => {
    let intervalId;
    
    if (pollingActive) {
      console.log("[Frontend] Starting polling for session updates");
      intervalId = setInterval(async () => {
        try {
          const responseData = await getSession();
          console.log("[Frontend] Session poll received data:", responseData);
          
          // Handle case where no data is returned or session is missing
          if (!responseData || !responseData.session) {
            console.log("[Frontend] No valid session data in poll response");
            return;
          }
          
          const sessionData = responseData.session;
          console.log("[Frontend] Session stage:", sessionData.stage);
          console.log("[Frontend] Session data:", sessionData.data);
          console.log("[Frontend] Session has gemini_analysis:", 
            !!sessionData.gemini_analysis || !!(sessionData.data && sessionData.data.gemini_analysis));
          
          setSession(sessionData);
          
          // Update stage based on session status
          if (sessionData.stage === 'analysis_complete') {
            console.log("[Frontend] Setting stage to ANALYSIS_COMPLETE and stopping polling");
            setStage(STAGES.ANALYSIS_COMPLETE);
            setPollingActive(false);
          } else if (sessionData.data?.gemini_analysis || sessionData.gemini_analysis) {
            // We have analysis data even if stage isn't set correctly
            console.log("[Frontend] Analysis data found even though stage isn't analysis_complete");
            setStage(STAGES.ANALYSIS_COMPLETE);
            setPollingActive(false);
          } else if (sessionData.stage === 'questions_generated') {
            console.log("[Frontend] Setting stage to QUESTIONS and stopping polling");
            setQuestions(sessionData.questions || []);
            setStage(STAGES.QUESTIONS);
            setPollingActive(false);
          } else if (sessionData.stage === 'completed') {
            console.log("[Frontend] Setting stage to RESULT and stopping polling");
            setScript(sessionData.script);
            setStage(STAGES.RESULT);
            setPollingActive(false);
            loadScriptHistory(); // Refresh history
          } else {
            console.log("[Frontend] Current stage doesn't require state change:", sessionData.stage);
          }
        } catch (err) {
          console.error('[Frontend] Error polling session:', err);
          // Don't stop polling on errors
        }
      }, 3000); // Poll every 3 seconds
    } else {
      console.log("[Frontend] Polling is not active");
    }
    
    return () => {
      if (intervalId) {
        console.log("[Frontend] Cleaning up polling interval");
        clearInterval(intervalId);
      }
    };
  }, [pollingActive]);
  
  const loadInitialData = async () => {
    try {
      console.log("[Frontend] Loading initial data");
      // Check for an existing session
      const sessionData = await getSession();
      console.log("[Frontend] Initial session data:", sessionData);
      
      // Handle case where session data is null or session field is missing
      if (!sessionData || !sessionData.session) {
        console.log("[Frontend] No session data returned, setting stage to INPUT");
        setStage(STAGES.INPUT);
        return;
      }
      
      console.log("[Frontend] Initial session stage:", sessionData.session.stage);
      
      setSession(sessionData.session);
      
      // Set stage based on session status
      if (!sessionData.session.stage || sessionData.session.stage === 'initialized' || sessionData.session.stage === 'new') {
        console.log("[Frontend] Setting initial stage to INPUT");
        setStage(STAGES.INPUT);
      } else if (sessionData.session.stage === 'analysis_complete') {
        console.log("[Frontend] Setting initial stage to ANALYSIS_COMPLETE");
        setStage(STAGES.ANALYSIS_COMPLETE);
      } else if (sessionData.session.stage === 'questions_generated') {
        console.log("[Frontend] Setting initial stage to QUESTIONS");
        setQuestions(sessionData.session.questions || []);
        setStage(STAGES.QUESTIONS);
      } else if (sessionData.session.stage === 'completed') {
        console.log("[Frontend] Setting initial stage to RESULT");
        setScript(sessionData.session.script);
        setStage(STAGES.RESULT);
      } else {
        console.log("[Frontend] Unknown session stage:", sessionData.session.stage);
      }
      
      // Load categories and stats in parallel
      const [statsData, scriptsData] = await Promise.all([
        getCategoryStats(),
        getScripts()
      ]);
      
      setCategoryStats(statsData.stats || {});
      setCategories(statsData.categories || []);
      setScriptHistory(scriptsData || []);
      
    } catch (err) {
      console.error('[Frontend] Error loading initial data:', err);
      setError('Error cargando datos iniciales');
    }
  };
  
  const loadScriptHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const scriptsData = await getScripts();
      setScriptHistory(scriptsData || []);
    } catch (err) {
      console.error('Error loading script history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const handleAnalyzeReference = async (data) => {
    console.log("[Frontend] Starting reference analysis with:", data);
    setError(null);
    setStage(STAGES.ANALYZING);
    
    try {
      const response = await analyzeReference(data.url, data.categoryId, data.subcategoryId);
      console.log("[Frontend] Analysis response received:", JSON.stringify(response));
      
      // Check if a valid session was returned
      if (!response || !response.session) {
        console.log("[Frontend] No valid session in analysis response");
        setError("No session returned from server");
        setStage(STAGES.INPUT);
        return;
      }
      
      const sessionData = response.session;
      console.log("[Frontend] Session stage from response:", sessionData.stage);
      console.log("[Frontend] Session data fields:", Object.keys(sessionData));
      console.log("[Frontend] Session has gemini_analysis:", 
                 !!sessionData.gemini_analysis || !!(sessionData.data && sessionData.data.gemini_analysis));
      
      // Check if analysis is already complete to avoid unnecessary polling
      if (sessionData.stage === 'analysis_complete') {
        console.log("[Frontend] Analysis already complete, updating state without polling");
        
        // Check that we have access to the analysis data
        if (!sessionData.gemini_analysis && !sessionData.data?.gemini_analysis) {
          console.warn("[Frontend] WARNING: Analysis completed but no gemini_analysis found in session");
          console.log("[Frontend] Session structure:", JSON.stringify(sessionData));
        }
        
        setSession(sessionData);
        setStage(STAGES.ANALYSIS_COMPLETE);
      } else if (sessionData.data?.gemini_analysis || sessionData.gemini_analysis) {
        // We have analysis data even if stage isn't set correctly
        console.log("[Frontend] Analysis data found even though stage isn't analysis_complete");
        setSession(sessionData);
        setStage(STAGES.ANALYSIS_COMPLETE);
      } else {
        console.log("[Frontend] Starting polling for analysis completion");
        setSession(sessionData);
        setPollingActive(true); // Start polling for session updates
      }
    } catch (err) {
      console.error('[Frontend] Error analyzing reference:', err);
      setError(err.message || 'Error analyzing video');
      setStage(STAGES.INPUT);
    }
  };
  
  const handleGenerateQuestions = async () => {
    setError(null);
    setQuestions([]);
    
    try {
      const result = await generateQuestions();
      setQuestions(result.questions || []);
      setStage(STAGES.QUESTIONS);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Error generating questions');
    }
  };
  
  const handleSubmitAnswers = async (data) => {
    setError(null);
    setTitle(data.title);
    setStage(STAGES.GENERATING);
    
    try {
      await submitAnswers(data.answers);
      
      // Generate the script
      const result = await generateScript();
      setScript(result);
      setStage(STAGES.RESULT);
      loadScriptHistory(); // Refresh history
    } catch (err) {
      console.error('Error generating script:', err);
      setError(err.message || 'Error generating script');
      setStage(STAGES.QUESTIONS);
    }
  };
  
  const handleRegenerate = async () => {
    setError(null);
    setStage(STAGES.GENERATING);
    
    try {
      // Generate a new script with the same answers
      const result = await generateScript();
      setScript(result);
      setStage(STAGES.RESULT);
      loadScriptHistory(); // Refresh history
    } catch (err) {
      console.error('Error regenerating script:', err);
      setError(err.message || 'Error regenerating script');
      setStage(STAGES.RESULT);
    }
  };
  
  const handleStartNew = () => {
    setStage(STAGES.INPUT);
    setScript(null);
    setSession(null);
    setQuestions([]);
    setError(null);
  };
  
  const handleSelectScript = (scriptId) => {
    // Find the script in history
    const selectedScript = scriptHistory.find(s => s.id === scriptId);
    if (selectedScript) {
      setScript(selectedScript);
      setStage(STAGES.RESULT);
    }
  };
  
  // Display appropriate component based on current stage
  const renderStageContent = () => {
    switch (stage) {
      case STAGES.INPUT:
        return (
          <ReferenceInput 
            onSubmit={handleAnalyzeReference}
            isLoading={stage === STAGES.ANALYZING}
            categories={categories}
            categoryStats={categoryStats}
          />
        );
      case STAGES.ANALYZING:
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Analizando Video</h2>
            </CardHeader>
            <CardBody className="flex flex-col items-center justify-center py-10">
              <Spinner size="xl" className="mb-4" />
              <p className="text-gray-600">
                Estamos analizando el video de referencia. Este proceso puede tomar hasta 1 minuto.
              </p>
            </CardBody>
          </Card>
        );
      case STAGES.ANALYSIS_COMPLETE:
        // Get the raw analysis data from wherever it exists
        const rawAnalysisData = 
          session?.data?.data?.gemini_analysis ||
          session?.gemini_analysis;
        
        console.log("[Frontend] Raw analysis data found:", !!rawAnalysisData);
        
        // Extract actual analysis from the nested structure
        let analysisData = null;
        if (rawAnalysisData) {
          // Create a properly structured analysis object
          try {
            // Extract from the nested structure
            const analysis = rawAnalysisData.analysis || {};
            const whisperData = session?.data?.data?.whisper_analysis;
            
            console.log("[Frontend] Extracted analysis:", analysis);
            console.log("[Frontend] Extracted whisper data:", whisperData);
            
            // Map fields to expected structure
            analysisData = {
              // Description from transcript or detailed description
              description: whisperData?.transcript || "No hay descripción disponible",
              
              // Key elements from KEY_TOPICS
              key_elements: analysis.KEY_TOPICS || [],
              
              // Use available data or default values
              audio_types: ["voice_over"], // Default assuming voice over
              text_types: ["complementary_text"], // Default assuming text overlays
              number_of_shots: Object.keys(analysis.DETAILED_DESCRIPTION || {}).length || 0,
              has_call_to_action: whisperData?.transcript?.toLowerCase().includes("don't") || false,
              
              // If available, total duration from the last segment's end time
              total_duration: whisperData?.segments ? 
                parseFloat(whisperData.segments[whisperData.segments.length - 1].endTime.split(':')[1]) : 0
            };
            
            console.log("[Frontend] Structured analysis data:", analysisData);
          } catch (err) {
            console.error("[Frontend] Error processing analysis data:", err);
            // If there's an error, we'll use null and trigger the error state
          }
        }
        
        // If no analysis data is found, show an error
        if (!analysisData) {
          return (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Error en el análisis</h2>
              </CardHeader>
              <CardBody>
                <p className="text-red-600 mb-4">
                  No se pudo obtener los resultados del análisis. Por favor intenta con otro video.
                </p>
                <Button color="primary" onClick={() => setStage(STAGES.INPUT)}>
                  Intentar con otro video
                </Button>
              </CardBody>
            </Card>
          );
        }
        
        // Display the analysis results directly
        return (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Análisis Completado</h2>
            </CardHeader>
            <CardBody>
              <h3 className="font-semibold text-lg mb-2">Resumen del análisis:</h3>
              
              <p className="mb-4 text-gray-600">
                {analysisData.description || 'No hay descripción disponible'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-1">Elementos clave:</h4>
                  <ul className="list-disc pl-5">
                    {Array.isArray(analysisData.key_elements) && analysisData.key_elements.length > 0 ? (
                      analysisData.key_elements.map((element, idx) => (
                        <li key={idx}>{element}</li>
                      ))
                    ) : (
                      <li>No se encontraron elementos clave</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Características técnicas:</h4>
                  <ul className="text-sm">
                    <li><span className="font-medium">Duración:</span> {analysisData.total_duration || 0} segundos</li>
                    <li>
                      <span className="font-medium">Tipo de audio:</span> {Array.isArray(analysisData.audio_types) ? analysisData.audio_types.join(', ') : 'Desconocido'}
                    </li>
                    <li>
                      <span className="font-medium">Tipo de texto:</span> {Array.isArray(analysisData.text_types) ? analysisData.text_types.join(', ') : 'Desconocido'}
                    </li>
                    <li>
                      <span className="font-medium">Número de escenas:</span> {analysisData.number_of_shots || 0}
                    </li>
                    <li>
                      <span className="font-medium">Llamado a la acción:</span> {analysisData.has_call_to_action ? 'Sí' : 'No'}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button color="secondary" onClick={() => setStage(STAGES.INPUT)}>
                  Analizar otro video
                </Button>
                <Button color="primary" onClick={handleGenerateQuestions}>
                  Continuar
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      case STAGES.QUESTIONS:
        return (
          <QuestionForm 
            questions={questions}
            isLoading={false}
            onSubmit={handleSubmitAnswers}
            onGenerateQuestions={handleGenerateQuestions}
          />
        );
      case STAGES.GENERATING:
        return (
          <GenerationProgress 
            title={title}
          />
        );
      case STAGES.RESULT:
        return (
          <ScriptResult 
            script={script}
            onRegenerate={handleRegenerate}
            onStartNew={handleStartNew}
          />
        );
      default:
        return <p>Estado desconocido</p>;
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Generador de Scripts</h1>
        
        {error && (
          <Card className="mb-6 bg-red-50">
            <CardBody>
              <p className="text-red-600">{error}</p>
            </CardBody>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {renderStageContent()}
          </div>
          
          <div className="lg:col-span-1">
            <ScriptHistory 
              scripts={scriptHistory}
              isLoading={isLoadingHistory}
              onSelect={handleSelectScript}
              onRefresh={loadScriptHistory}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 