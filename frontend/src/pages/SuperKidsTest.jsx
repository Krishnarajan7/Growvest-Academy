
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const categoryConfig = {
  'spoken-english': {
    title: 'Spoken English',
    icon: Mic,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    emoji: '🎤',
    questions: [
      { q: 'What is the correct greeting for morning?', options: ['Good Night', 'Good Morning', 'Good Evening', 'Hello'], answer: 1 },
      { q: 'Which word is a verb?', options: ['Beautiful', 'Run', 'Happy', 'Big'], answer: 1 },
      { q: 'Complete: "I ___ to school everyday."', options: ['go', 'goes', 'going', 'went'], answer: 0 },
      { q: 'What is the plural of "Child"?', options: ['Childs', 'Children', 'Childen', 'Childes'], answer: 1 },
      { q: 'Which sentence is correct?', options: ['She are happy', 'She is happy', 'She am happy', 'She be happy'], answer: 1 },
    ]
  },
  'physics': {
    title: 'Physics',
    icon: Atom,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    emoji: '⚛️',
    questions: [
      { q: 'What is the SI unit of force?', options: ['Meter', 'Kilogram', 'Newton', 'Joule'], answer: 2 },
      { q: 'What pulls objects towards Earth?', options: ['Magnetism', 'Gravity', 'Friction', 'Wind'], answer: 1 },
      { q: 'What is the speed of light?', options: ['300 km/s', '3,000 km/s', '300,000 km/s', '3,000,000 km/s'], answer: 2 },
      { q: 'Which color has the longest wavelength?', options: ['Blue', 'Green', 'Red', 'Violet'], answer: 2 },
      { q: 'Water boils at what temperature?', options: ['50°C', '75°C', '100°C', '150°C'], answer: 2 },
    ]
  },
  'general-maths': {
    title: 'General Maths',
    icon: Calculator,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    emoji: '🧮',
    questions: [
      { q: 'What is 15 × 8?', options: ['100', '120', '110', '130'], answer: 1 },
      { q: 'What is 144 ÷ 12?', options: ['10', '11', '12', '13'], answer: 2 },
      { q: 'What is 25% of 200?', options: ['25', '50', '75', '100'], answer: 1 },
      { q: 'What is the square root of 81?', options: ['7', '8', '9', '10'], answer: 2 },
      { q: 'What is 3³?', options: ['9', '12', '27', '81'], answer: 2 },
    ]
  },
  'basic-computer': {
    title: 'Basic Computer',
    icon: Monitor,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    emoji: '💻',
    questions: [
      { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Unit', 'Computer Processing Unit'], answer: 0 },
      { q: 'Which is an input device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], answer: 2 },
      { q: 'What is the brain of the computer?', options: ['RAM', 'CPU', 'Hard Disk', 'Monitor'], answer: 1 },
      { q: 'Which is used to store data permanently?', options: ['RAM', 'ROM', 'Hard Disk', 'CPU'], answer: 2 },
      { q: 'What file extension is for images?', options: ['.doc', '.mp3', '.jpg', '.exe'], answer: 2 },
    ]
  },
  'gk': {
    title: 'General Knowledge',
    icon: Globe,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    emoji: '🌍',
    questions: [
      { q: 'What is the capital of India?', options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], answer: 1 },
      { q: 'Which is the largest planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 2 },
      { q: 'Who invented the light bulb?', options: ['Newton', 'Einstein', 'Edison', 'Tesla'], answer: 2 },
      { q: 'What is the national animal of India?', options: ['Lion', 'Tiger', 'Elephant', 'Peacock'], answer: 1 },
      { q: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
    ]
  },
  'public-speaking': {
    title: 'Public Speaking',
    icon: Megaphone,
    color: 'from-red-500 to-orange-600',
    bgColor: 'bg-red-50',
    emoji: '🎯',
    questions: [
      { q: 'What should you maintain while speaking?', options: ['Low voice', 'Eye contact', 'Looking down', 'Speaking fast'], answer: 1 },
      { q: 'How should you start a speech?', options: ['With a joke', 'By apologizing', 'With a greeting', 'By shouting'], answer: 2 },
      { q: 'What helps reduce stage fear?', options: ['Avoiding practice', 'Practice and preparation', 'Speaking very fast', 'Looking at the floor'], answer: 1 },
      { q: 'Body language is important in speaking. True or False?', options: ['True', 'False', 'Sometimes', 'Never'], answer: 0 },
      { q: 'What makes a speech memorable?', options: ['Speaking too fast', 'Using stories and examples', 'Reading from paper', 'Avoiding the audience'], answer: 1 },
    ]
  },
};

const SuperKidsTest = () => {
  const { categoryId } = useParams<{ categoryId};
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isAnswered, setIsAnswered] = useState(false);

  const config = categoryConfig[categoryId];
  
  useEffect(() => {
    if (!config) {
      navigate('/super-kids');
      return;
    }
    setAnswers(new Array(config.questions.length).fill(null));
  }, [categoryId, config, navigate]);

  useEffect(() => {
    if (showResult || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, timeLeft]);

  if (!config) return null;

  const Icon = config.icon;
  const questions = config.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setIsAnswered(answers[currentQuestion - 1] !== null);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].answer ? 1 : 0);
    }, 0);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setTimeLeft(300);
    setIsAnswered(false);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const isPassed = percentage >= 60;

    return (
      <div className={`min-h-screen pt-20 ${config.bgColor}`}>
        <div className="container-width section-padding">
          <Card className="max-w-2xl mx-auto border-4 border-dashed overflow-hidden">
            <div className={`bg-gradient-to-r ${config.color} text-white p-8 text-center`}>
              <div className="text-6xl mb-4">
                {isPassed ? '🏆' : '💪'}
              </div>
              <h1 className="text-3xl font-black mb-2">
                {isPassed ? 'Congratulations!' : 'Good Try!'}
              </h1>
              <p className="text-xl opacity-90">
                {isPassed ? 'You did an amazing job!' : 'Keep practicing to improve!'}
              </p>
            </div>
            
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="text-6xl font-black text-gray-800 mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-xl text-gray-600">
                  Your Score: <span className={isPassed ? 'text-green-600' : 'text-orange-600'} >{percentage.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {isPassed && (
                  <Badge className="px-6 py-3 text-lg bg-yellow-500 text-white">
                    <Star className="w-5 h-5 mr-2" />
                    Star Performer!
                  </Badge>
                )}
                <Badge className={`px-6 py-3 text-lg ${isPassed ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                  {isPassed ? <CheckCircle className="w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  {isPassed ? 'Passed!' : 'Keep Going!'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={restartTest}
                  variant="outline" 
                  className="py-6 text-lg font-bold"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
                <Link to="/super-kids" className="w-full">
                  <Button 
                    className={`w-full py-6 text-lg font-bold bg-gradient-to-r ${config.color} text-white`}
                  >
                    <Home className="w-5 h-5 mr-2" />
                    More Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${config.bgColor}`}>
      <div className="container-width section-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/super-kids" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Categories
          </Link>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-white'}`}>
            <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Test Card */}
        <Card className="max-w-3xl mx-auto border-4 border-dashed overflow-hidden">
          {/* Category Header */}
          <div className={`bg-gradient-to-r ${config.color} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{config.title}</h2>
                  <p className="opacity-90">Question {currentQuestion + 1} of {questions.length}</p>
                </div>
              </div>
              <div className="text-4xl">{config.emoji}</div>
            </div>
            <Progress value={progress} className="mt-4 bg-white/30" />
          </div>

          <CardContent className="p-6 md:p-8">
            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                {questions[currentQuestion].q}
              </h3>

              {/* Options */}
              <div className="grid gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === questions[currentQuestion].answer;
                  const showCorrect = isAnswered && isCorrect;
                  const showWrong = isAnswered && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={isAnswered}
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
                        <span>{option}</span>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {showWrong && <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
                className="px-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className={`px-6 bg-gradient-to-r ${config.color} text-white`}
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <div className="max-w-3xl mx-auto mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(answers[index]);
                  setIsAnswered(answers[index] !== null);
                }}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  index === currentQuestion
                    ? `bg-gradient-to-r ${config.color} text-white`
                    : answers[index] !== null
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperKidsTest;
