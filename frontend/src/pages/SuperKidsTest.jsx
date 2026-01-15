import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle,  
  XCircle, 
  Trophy,
  Star,
  Sparkles,
  Home,
  RotateCcw,
  Mic,
  Atom,
  Calculator,
  Monitor,
  Globe,
  Megaphone,
  Medal,
  PartyPopper,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/axios';

const categoryConfig = {
  'spoken-english': {
    title: 'Spoken English',
    icon: Mic,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    emoji: '🎤',
  },
  'physics': {
    title: 'Physics',
    icon: Atom,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    emoji: '⚛️',
  },
  'general-maths': {
    title: 'General Maths',
    icon: Calculator,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    emoji: '🧮',
  },
  'basic-computer': {
    title: 'Basic Computer',
    icon: Monitor,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    emoji: '💻',
  },
  'gk': {
    title: 'General Knowledge',
    icon: Globe,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    emoji: '🌍',
  },
  'public-speaking': {
    title: 'Public Speaking',
    icon: Megaphone,
    color: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-50',
    emoji: '🎯',
  },
};

// Sound effects using Web Audio API
const useSoundEffects = () => {
  const audioContextRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSuccessSound = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    const playNote = (frequency, startTime, duration) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
      
      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration);
    };

    playNote(523.25, 0, 0.15);
    playNote(659.25, 0.15, 0.15);
    playNote(783.99, 0.3, 0.15);
    playNote(1046.5, 0.45, 0.4);
  }, [initAudio]);

  const playFailSound = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  }, [initAudio]);

  const playClickSound = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.08);
  }, [initAudio]);

  return { playSuccessSound, playFailSound, playClickSound };
};

const SuperKidsTest = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { playSuccessSound, playFailSound, playClickSound } = useSoundEffects();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isAnswered, setIsAnswered] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const resultConfettiTriggered = useRef(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const config = categoryConfig[categoryId];
  
  useEffect(() => {
    const storedStudent = localStorage.getItem('student_data');
    if (storedStudent) {
      setStudentData(JSON.parse(storedStudent));
    }
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const res = await api.get(
  `/student/tests/by-category/${categoryId}`
);


// api already returns response.data
const fetchedQuestions = Array.isArray(res)
  ? res
  : [];


console.log('Questions loaded:', fetchedQuestions);

setQuestions(fetchedQuestions);
setAnswers(new Array(fetchedQuestions.length).fill(null));


      } catch (err) {
        console.error('Error loading questions:', err);
        navigate('/super-kids');
      } finally {
        setLoading(false);
      }
    
    };

    loadQuestions();

  }, [categoryId, config, navigate]);
  

  useEffect(() => {
    if (showResult || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, timeLeft]);

  // Confetti on result
  useEffect(() => {
    if (showResult && !resultConfettiTriggered.current && result) {
      resultConfettiTriggered.current = true;
      const isPassed = result.is_passed;

      if (isPassed) {
        playSuccessSound();
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ['#22c55e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4'];

        const frame = () => {
          confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors });
          if (Date.now() < animationEnd) requestAnimationFrame(frame);
        };

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors,
          gravity: 0.6,
          scalar: 1.4
        });

        setTimeout(frame, 300);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5, x: 0.5 },
            shapes: ['star'],
            colors: ['#fbbf24', '#f59e0b'],
            scalar: 1.5
          });
        }, 600);
      } else {
        playFailSound();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#8b5cf6', '#ec4899'],
          gravity: 0.8
        });
      }
    }
  }, [showResult, result, playSuccessSound, playFailSound]);

  useEffect(() => {
  if (!config) {
    navigate('/super-kids');
  }
}, [config, navigate]);

if (!config) return null;


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading test...</div>;
  }

  // NEW: Guard against empty question list
  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-2xl font-bold text-gray-700">No questions available</div>
        <p className="text-gray-600">This category doesn't have any questions yet.</p>
        <Link to="/super-kids">
          <Button>Back to Categories</Button>
        </Link>
      </div>
    );
  }

  const Icon = config.icon;
  // NEW: Safe progress calculation (prevents division by zero)
  const progress = questions.length 
    ? ((currentQuestion + 1) / questions.length) * 100 
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateResult = () => {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option) {
        correct++;
      }
    });

    const percentage = (correct / questions.length) * 100;
    const is_passed = percentage >= 70; // You can adjust this threshold

    return {
      correct_answers: correct,
      total_questions: questions.length,
      result_summary: { percentage },
      is_passed,
    };
  };

  const handleAnswer = (optionId) => {
  if (isAnswered) return;

  playClickSound();

  console.log(
    `%cQ${currentQuestion + 1} → Selected: ${optionId} | Correct: ${questions[currentQuestion]?.correct_option}`,
    optionId === questions[currentQuestion]?.correct_option 
      ? 'background:#28a745;color:white;padding:2px 6px;border-radius:4px;' 
      : 'background:#dc3545;color:white;padding:2px 6px;border-radius:4px;'
  );

  setSelectedAnswer(optionId);
  setIsAnswered(true);

  const newAnswers = [...answers];
  newAnswers[currentQuestion] = optionId;
  setAnswers(newAnswers);
};

  const nextQuestion = () => {
    playClickSound();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
      setIsAnswered(answers[currentQuestion + 1] !== null);
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    playClickSound();
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setIsAnswered(answers[currentQuestion - 1] !== null);
    }
  };

  const restartTest = () => {
    resultConfettiTriggered.current = false;
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setTimeLeft(300);
    setIsAnswered(false);
    setResult(null);
  };

  const finishTest = async () => {
  const resultData = calculateResult();

  setResult(resultData);
  setShowResult(true);

  try {
    await api.post('/student/quick-test/save', {
      student_name: studentData?.name || 'Guest',
      age: studentData?.age || null,
      category: categoryId,
      total_questions: resultData.total_questions,
      correct_answers: resultData.correct_answers,
      percentage: Math.round(resultData.result_summary.percentage),
      answers, // selected answers array
    });
  } catch (error) {
    console.error('Failed to save test result', error);
  }
};


  if (showResult) {
    if (!result) {
      return <div className="min-h-screen flex items-center justify-center">Loading results...</div>;
    }

    const score = result.correct_answers;
    const total = result.total_questions;
    const percentage = result.result_summary.percentage;
    const isPassed = result.is_passed;

    return (
      <div className={`min-h-screen pt-20 ${config.bgColor}`}>
        <div className="container-width section-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <Card className="max-w-2xl mx-auto border-4 border-dashed overflow-hidden">
              <motion.div 
                className={`bg-gradient-to-r ${config.color} text-white p-8 text-center relative overflow-hidden`}
                initial={{ y: -50 }}
                animate={{ y: 0 }}
              >
                {/* ... rest of result header remains the same ... */}
                <motion.div 
                  className="text-7xl mb-4 relative z-10"
                  animate={isPassed ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 1, repeat: isPassed ? Infinity : 0, repeatDelay: 2 }}
                >
                  {isPassed ? (
                    <span className="inline-flex items-center gap-2">
                      <Trophy className="w-16 h-16 text-amber-300" />
                    </span>
                  ) : (
                    <span>💪</span>
                  )}
                </motion.div>

                {studentData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-2"
                  >
                    <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                      <Crown className="w-4 h-4 mr-2" />
                      {studentData.name}
                    </Badge>
                  </motion.div>
                )}

                <motion.h1 
                  className="text-3xl md:text-4xl font-black mb-2 relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {isPassed ? 'Congratulations!' : 'Good Try!'}
                </motion.h1>
                <motion.p 
                  className="text-xl opacity-90 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {isPassed ? 'You did an amazing job!' : 'Keep practicing to improve!'}
                </motion.p>
              </motion.div>
              
              <CardContent className="p-8 text-center">
                {/* ... rest of the result content remains the same ... */}
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3, stiffness: 200 }}
                >
                  <div className="relative inline-block">
                    <motion.div 
                      className="text-7xl font-black text-gray-800 mb-2"
                      animate={isPassed ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isPassed ? 3 : 0 }}
                    >
                      {score}/{total}
                    </motion.div>
                    {isPassed && (
                      <motion.div
                        className="absolute -top-2 -right-6"
                        initial={{ rotate: -30, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                      </motion.div>
                    )}
                  </div>
                  <motion.div 
                    className="text-xl text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Your Score: <span className={`font-bold ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </motion.div>
                </motion.div>

                {/* Badges and buttons remain the same */}
                <motion.div 
                  className="flex flex-wrap justify-center gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isPassed && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg">
                        <Star className="w-5 h-5 mr-2 fill-white" />
                        Star Performer!
                      </Badge>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Badge className={`px-6 py-3 text-lg ${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'} text-white shadow-lg`}>
                      {isPassed ? <Medal className="w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                      {isPassed ? 'Passed!' : 'Keep Going!'}
                    </Badge>
                  </motion.div>
                  {isPassed && percentage === 100 && (
                    <motion.div whileHover={{ scale: 1.1 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
                      <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg">
                        <PartyPopper className="w-5 h-5 mr-2" />
                        Perfect Score!
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={restartTest} variant="outline" className="w-full py-6 text-lg font-bold">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/super-kids" className="w-full block">
                      <Button className={`w-full py-6 text-lg font-bold bg-gradient-to-r ${config.color} text-white`}>
                        <Home className="w-5 h-5 mr-2" />
                        More Tests
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${config.bgColor}`}>
      <div className="container-width section-padding">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/super-kids" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Categories
          </Link>
          <motion.div 
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-white'}`}
            animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeLeft < 60 ? Infinity : 0 }}
          >
            <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-bold">{formatTime(timeLeft)}</span>
          </motion.div>
        </motion.div>

        {/* Student Info */}
        {studentData && (
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Badge className="bg-white px-4 py-2 text-gray-700 shadow-sm">
              <Crown className="w-4 h-4 mr-2 text-amber-500" />
              Playing as: <span className="font-bold ml-1">{studentData.name}</span>
            </Badge>
          </motion.div>
        )}

        {/* Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="max-w-3xl mx-auto border-4 border-dashed overflow-hidden">
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${config.color} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold">{config.title}</h2>
                    <p className="opacity-90">Question {currentQuestion + 1} of {questions.length}</p>
                  </div>
                </div>
                <motion.div 
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {config.emoji}
                </motion.div>
              </div>
              <Progress value={progress} className="mt-4 bg-white/30" />
            </div>

            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="mb-8"
                >
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="grid gap-4">
                    {questions[currentQuestion].options.map((option, index) => {
                      const isSelected = selectedAnswer === option.id;
                      const showCorrect = isAnswered && isSelected && (selectedAnswer === questions[currentQuestion].correct_option);
                      const showWrong = isAnswered && isSelected && (selectedAnswer !== questions[currentQuestion].correct_option);

                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer(option.id)}
                          disabled={isAnswered}
                          whileHover={!isAnswered ? { scale: 1.02, x: 5 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`w-full p-4 md:p-5 rounded-xl text-left font-medium text-lg transition-all duration-300 border-3 ${
                            showCorrect
                              ? 'bg-green-100 border-green-500 text-green-700'
                              : showWrong
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : isSelected
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.text}</span>
                            {showCorrect && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </motion.div>
                            )}
                            {showWrong && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                <XCircle className="w-6 h-6 text-red-600" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="px-6"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={nextQuestion}
                    disabled={!isAnswered}
                    className={`px-6 bg-gradient-to-r ${config.color} text-white`}
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Navigator */}
        <motion.div 
          className="max-w-3xl mx-auto mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  playClickSound();
                  setCurrentQuestion(index);
                  setSelectedAnswer(answers[index]);
                  setIsAnswered(answers[index] !== null);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  index === currentQuestion
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : answers[index] !== null
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperKidsTest;