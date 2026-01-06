import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  Atom, 
  Calculator, 
  Monitor, 
  Globe, 
  Megaphone, 
  Star, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Play,
  Target,
  Rocket,
  Zap,
  Crown,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SuperKids = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Confetti burst on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      // Center burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3, x: 0.5 },
        colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'],
        gravity: 0.8,
        scalar: 1.2
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Confetti on card hover
  const triggerConfetti = useCallback((e) => {
    const rect = (e.currentTarget).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ['#22c55e', '#10b981', '#14b8a6', '#f59e0b', '#8b5cf6'],
      gravity: 1.2,
      scalar: 0.8,
      ticks: 100
    });
  }, []);

  const categories = [
    {
      id: 'spoken-english',
      title: 'Spoken English',
      subtitle: 'Master the Language',
      description: 'Fun interactive lessons to improve speaking, listening, and pronunciation skills',
      icon: Mic,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      hoverBg: 'hover:bg-rose-100',
      iconBg: 'bg-rose-500',
      questions: 25,
      duration: '15 mins',
      difficulty: 'Beginner',
    },
    {
      id: 'physics',
      title: 'Physics',
      subtitle: 'Explore the Universe',
      description: 'Discover the amazing world of physics through exciting experiments and concepts',
      icon: Atom,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      hoverBg: 'hover:bg-blue-100',
      iconBg: 'bg-blue-500',
      questions: 20,
      duration: '20 mins',
      difficulty: 'Intermediate',
    },
    {
      id: 'general-maths',
      title: 'General Maths',
      subtitle: 'Numbers are Fun',
      description: 'Build strong mathematical foundations with engaging puzzles and problems',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      hoverBg: 'hover:bg-emerald-100',
      iconBg: 'bg-emerald-500',
      questions: 30,
      duration: '25 mins',
      difficulty: 'Beginner',
    },
    {
      id: 'basic-computer',
      title: 'Basic Computer',
      subtitle: 'Tech Wizards Unite',
      description: 'Learn essential computer skills, typing, and basic programming concepts',
      icon: Monitor,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-300',
      hoverBg: 'hover:bg-violet-100',
      iconBg: 'bg-violet-500',
      questions: 20,
      duration: '15 mins',
      difficulty: 'Beginner',
    },
    {
      id: 'gk',
      title: 'General Knowledge',
      subtitle: 'Know Everything',
      description: 'Explore fascinating facts about the world, history, science, and more',
      icon: Globe,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      hoverBg: 'hover:bg-amber-100',
      iconBg: 'bg-amber-500',
      questions: 25,
      duration: '20 mins',
      difficulty: 'Mixed',
    },
    {
      id: 'public-speaking',
      title: 'Public Speaking',
      subtitle: 'Speak with Confidence',
      description: 'Develop presentation skills, overcome stage fear, and become a confident speaker',
      icon: Megaphone,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      hoverBg: 'hover:bg-red-100',
      iconBg: 'bg-red-500',
      questions: 15,
      duration: '15 mins',
      difficulty: 'Beginner',
    },
  ];

  const achievements = [
    { icon: Star, label: 'Gold Stars Earned', value: '5,000+', color: 'text-amber-500' },
    { icon: Trophy, label: 'Tests Completed', value: '10,000+', color: 'text-emerald-500' },
    { icon: Crown, label: 'Super Kids', value: '2,500+', color: 'text-violet-500' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-40 animate-bounce shadow-lg" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full opacity-40 animate-bounce shadow-lg" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-40 animate-bounce shadow-lg" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-10 w-14 h-14 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-40 animate-bounce shadow-lg" style={{ animationDuration: '2.8s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-10 h-10 bg-gradient-to-br from-violet-300 to-purple-400 rounded-full opacity-40 animate-bounce shadow-lg" style={{ animationDuration: '2.2s', animationDelay: '0.3s' }}></div>
          
          {/* Decorative stars */}
          <Star className="absolute top-20 left-1/3 w-8 h-8 text-amber-400 opacity-30 animate-pulse" />
          <Star className="absolute bottom-32 right-1/4 w-6 h-6 text-amber-400 opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <Sparkles className="absolute top-1/3 right-1/3 w-10 h-10 text-violet-400 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="container-width section-padding relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 rounded-full mb-6 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">For Ages 6-16</span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-rose-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                SUPER
              </span>
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {' '}KIDS
              </span>
              <Rocket className="inline-block w-12 h-12 md:w-16 md:h-16 ml-2 text-orange-500 animate-bounce" />
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-medium">
              Learn, Play, and Become a <span className="text-violet-600 font-bold">Champion!</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-105 transition-transform cursor-default">
                <BookOpen className="w-5 h-5 mr-2" />
                Fun Learning
              </Badge>
              <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:scale-105 transition-transform cursor-default">
                <Trophy className="w-5 h-5 mr-2" />
                Win Badges
              </Badge>
              <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform cursor-default">
                <Target className="w-5 h-5 mr-2" />
                Track Progress
              </Badge>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-8">
              {achievements.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border-2 border-dashed border-amber-300 hover:scale-105 transition-transform cursor-pointer"
                    onClick={triggerConfetti}
                  >
                    <Icon className={`w-8 h-8 md:w-10 md:h-10 ${item.color} mx-auto mb-2`} />
                    <div className="text-2xl md:text-3xl font-black text-gray-800">{item.value}</div>
                    <div className="text-xs md:text-sm text-gray-500 font-medium">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container-width section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
              Choose Your <span className="text-violet-600">Adventure!</span>
            </h2>
            <p className="text-lg text-gray-600">Pick a subject and start your learning journey</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => {
              const Icon = category.icon;
              
              return (
                <Link 
                  key={category.id}
                  to={`/super-kids/${category.id}`}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Card 
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border-3 ${category.borderColor} ${category.bgColor} ${category.hoverBg}`}
                  >
                    {/* Background decoration */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity ${category.color}" />
                    
                    <CardHeader className="pb-2">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black text-gray-800 group-hover:text-violet-600 transition-colors">
                        {category.title}
                      </CardTitle>
                      <p className="text-sm font-bold text-violet-500">{category.subtitle}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm md:text-base">
                        {category.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {category.questions} Questions
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <Zap className="w-3 h-3 mr-1" />
                          {category.duration}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <Target className="w-3 h-3 mr-1" />
                          {category.difficulty}
                        </Badge>
                      </div>
                      
                      <Button 
                        className={`w-full bg-gradient-to-r ${category.color} text-white font-bold shadow-lg group-hover:shadow-xl transition-all`}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Test
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
        </div>
        
        <div className="container-width section-padding relative">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center justify-center gap-3">
              <Star className="w-8 h-8 text-amber-300" />
              Why Super Kids Love Us!
              <Star className="w-8 h-8 text-amber-300" />
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Rocket, text: 'Learn at Your Pace', desc: 'No pressure, just fun!' },
                { icon: Target, text: 'Track Your Progress', desc: 'See how you improve!' },
                { icon: Trophy, text: 'Win Cool Badges', desc: 'Collect achievements!' },
                { icon: Zap, text: 'Instant Results', desc: 'Know your score right away!' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/25 transition-all hover:scale-105 border-2 border-white/30 cursor-pointer"
                    onClick={triggerConfetti}
                  >
                    <Icon className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">{item.text}</h3>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-width section-padding">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
              Ready to Become a <span className="text-violet-600">Super Kid?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of kids who are learning and having fun at the same time!
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-rose-600 text-white text-lg px-8 py-6 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              onClick={(e) => {
                triggerConfetti(e);
                // Multiple bursts for celebration
                setTimeout(() => {
                  confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22c55e', '#10b981', '#f59e0b']
                  });
                }, 100);
                setTimeout(() => {
                  confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#8b5cf6', '#ec4899', '#ef4444']
                  });
                }, 200);
              }}
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Your First Test FREE!
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuperKids;
