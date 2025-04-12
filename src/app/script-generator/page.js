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
import AnalysisQuestionsSection from '@/components/script-generator/AnalysisQuestionsSection';
import AnalysisResultsView from '@/components/script-generator/AnalysisResultsView';
import { 
  Spinner, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Tabs, 
  Tab,
  Button,
  Progress
} from "@heroui/react";

// Workflow stages
const STAGES = {
  INPUT: 'input',
  ANALYZING: 'analyzing',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ANALYSIS_RESULTS: 'analysis_results',
  QUESTIONS: 'questions',
  GENERATING: 'generating',
  RESULT: 'result'
};

// Analysis duration in milliseconds (40 seconds)
const ANALYSIS_DURATION = 40000;

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
  
  // Add new state for analysis progress
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);
  
  // Replace polling effect with a simpler progress timer effect
  useEffect(() => {
    let progressInterval;
    
    // Start a timer for the progress bar only during analysis
    if (stage === STAGES.ANALYZING) {
      const analysisStartTime = Date.now();
      console.log("[Frontend] Analysis started at:", analysisStartTime);
      
      // Immediately set progress to 1% to show it's starting
      setAnalysisProgress(1);
      
      // Progress timer for the 40-second simulation - update every second
      progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - analysisStartTime;
        const calculatedProgress = Math.min(Math.floor((elapsedTime / ANALYSIS_DURATION) * 100), 99);
        
        console.log(`[Frontend] Progress update: ${calculatedProgress}% (elapsed: ${elapsedTime}ms)`);
        setAnalysisProgress(calculatedProgress);
        
        // If we've reached maximum simulated progress (99%), clear the interval 
        // The final 100% will be set when we get the actual response
        if (calculatedProgress >= 99) {
          clearInterval(progressInterval);
        }
      }, 1000); // Update every second
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [stage]);
  
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
    setAnalysisProgress(1); // Start at 1% to show something is happening immediately
    setStage(STAGES.ANALYZING);
    
    try {
      console.log("[Frontend] Sending analysis request and waiting for complete results...");
      const response = await analyzeReference(data.url, data.categoryId, data.subcategoryId);
      console.log("[Frontend] Analysis response received:", response);
      console.log("[Frontend] Response structure:", {
        hasSession: !!response?.session,
        sessionKeys: response?.session ? Object.keys(response.session) : [],
        hasSummary: !!response?.session?.summary,
        summaryType: typeof response?.session?.summary,
        hasTranscription: !!response?.session?.transcription,
        transcriptionLength: response?.session?.transcription?.length || 0
      });
      
      // Check if a valid session was returned
      if (!response || !response.session) {
        console.log("[Frontend] No valid session in analysis response");
        setError("No session returned from server");
        setStage(STAGES.INPUT);
        return;
      }
      
      const sessionData = response.session;
      console.log("[Frontend] Session stage from response:", sessionData.stage);
      
      // Analysis is complete since we're waiting for it on the server side
      setSession(sessionData);
      setStage(STAGES.ANALYSIS_COMPLETE);
      setAnalysisProgress(100); // Set to 100% since analysis is complete
      
      console.log("[Frontend] Analysis completed, ready for user to continue");
    } catch (err) {
      console.error('[Frontend] Error analyzing reference:', err);
      setError(err.message || 'Error analyzing video');
      setStage(STAGES.INPUT);
    }
  };
  
  const handleSubmitAnswers = async (answers) => {
    if (!session) {
      setError("No hay una sesión activa");
      return;
    }
    
    console.log("[Frontend] Submitting answers:", answers);
    
    try {
      // Format the answers for the API
      const formattedAnswers = {
        answers: answers
      };
      
      // Save answers to session
      await submitAnswers(formattedAnswers);
      
      console.log("[Frontend] Answers submitted successfully");
      
      // If analysis is complete, move to the analysis results view
      if (stage === STAGES.ANALYSIS_COMPLETE) {
        setStage(STAGES.ANALYSIS_RESULTS);
      } else {
        // If still analyzing, show a notification that answers were saved
        setError(null);
        
        // Use a friendlier notification instead of alert
        const savedMessage = document.getElementById('answers-saved-message');
        if (savedMessage) {
          savedMessage.classList.remove('hidden');
          setTimeout(() => {
            savedMessage.classList.add('hidden');
          }, 3000);
        } else {
          // Fallback to alert if element doesn't exist
          alert("Tus respuestas fueron guardadas. Puedes seguir esperando a que se complete el análisis.");
        }
      }
      
    } catch (err) {
      console.error('[Frontend] Error submitting answers:', err);
      setError(err.message || 'Error guardando respuestas');
    }
  };
  
  const handleViewAnalysisResults = () => {
    setStage(STAGES.ANALYSIS_RESULTS);
  };
  
  const handleGenerateScript = async () => {
    setError(null);
    
    // In the future, this will generate the actual script
    // For now, we show a message and return to the input stage
    alert("La generación de scripts estará disponible próximamente.");
    setStage(STAGES.INPUT);
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
      case STAGES.ANALYSIS_COMPLETE:
        // Simplified - just show questions regardless of analysis state
        return (
          <AnalysisQuestionsSection
            isAnalyzing={stage === STAGES.ANALYZING}
            analysisProgress={analysisProgress}
            onSubmitAnswers={handleSubmitAnswers}
            onContinue={handleViewAnalysisResults}
          />
        );
      case STAGES.ANALYSIS_RESULTS:
        // Initialize analysisData with default values
        let analysisData = {
          summary: "No hay resumen disponible",
          transcript: "No hay transcripción disponible"
        };
        
        // Access data using the simplified structure
        if (session) {
          console.log("[Frontend] Accessing session data for results:", session);
          console.log("[Frontend] Session keys:", Object.keys(session));
          console.log("[Frontend] Summary data structure:", {
            summaryExists: !!session.summary,
            summaryType: typeof session.summary,
            summaryIsObject: typeof session.summary === 'object',
            summaryContentExists: !!session.summary?.content,
            flatSummaryIsString: typeof session.summary === 'string'
          });
          
          // Get transcript from the transcript.content field OR from the flat transcription property
          if (session.transcript?.content) {
            console.log("[Frontend] Transcript found in session.transcript.content");
            analysisData.transcript = session.transcript.content;
          } else if (session.transcription) {
            console.log("[Frontend] Transcript found in session.transcription");
            analysisData.transcript = session.transcription;
          }
          
          // Get summary from the summary.content field OR from the flat summary property
          if (session.summary?.content) {
            console.log("[Frontend] Summary found in session.summary.content");
            analysisData.summary = session.summary.content;
          } else if (session.summary) {
            console.log("[Frontend] Summary found in session.summary");
            analysisData.summary = session.summary;
          }
          
          console.log("[Frontend] Final analysisData:", {
            summaryLength: analysisData.summary?.length || 0,
            transcriptLength: analysisData.transcript?.length || 0
          });
        }
        
        // Show the analysis results view
        return (
          <AnalysisResultsView
            analysisData={analysisData}
            onGenerateScript={handleGenerateScript}
            onStartOver={handleStartNew}
          />
        );
      case STAGES.QUESTIONS:
        return (
          <QuestionForm 
            questions={questions}
            isLoading={false}
            onSubmit={handleSubmitAnswers}
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
            onRegenerate={handleGenerateScript}
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
      <div className="container mx-auto p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Generador de Scripts</h1>
        
        {/* Progress bar that shows during analysis and stays visible after completion */}
        {(stage === STAGES.ANALYZING || stage === STAGES.ANALYSIS_COMPLETE || stage === STAGES.ANALYSIS_RESULTS) && (
          <div className="max-w-3xl mx-auto mb-6">
            <Progress 
              value={analysisProgress} 
              label=""
              showValueLabel={false}
              size="sm"
              className="w-full"
              aria-label="Análisis en progreso"
            />
          </div>
        )}
        
        {/* Hidden notification for answer saving - will be shown via JS */}
        <div 
          id="answers-saved-message" 
          className="hidden fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md transition-opacity duration-500 z-50"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>Respuestas guardadas correctamente</span>
          </div>
        </div>
        
        {error && (
          <Card className="mb-6 bg-red-50">
            <CardBody>
              <p className="text-red-600">{error}</p>
            </CardBody>
          </Card>
        )}
        
        {/* Main content - single column, centered layout */}
        <div className="max-w-3xl mx-auto">
          {renderStageContent()}
        </div>
      </div>
    </AuthGuard>
  );
} 