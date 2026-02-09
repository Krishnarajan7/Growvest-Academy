import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Mic,
  Sparkles,           // ← changed from Atom
  Calculator,
  Monitor,
  Globe,
  Megaphone,
  Star,
  Trophy,
  ArrowRight,
  Play,
  Target,
  Rocket,
  Zap,
  Crown,
  BookOpen,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentLoginModal from '@/components/StudentLoginModal';
import { api } from '@/lib/axios';  

const CATEGORY_UI_MAP = {
  'spoken-english': {
    subtitle: 'Master the Language',
    description: 'Fun interactive lessons to improve speaking, listening, and pronunciation skills',
    icon: Mic,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    hoverBg: 'hover:bg-rose-100',
    duration: '15 mins',
    difficulty: 'Beginner',
  },
  'phonics-song': {                               
    subtitle: 'Sing & Learn Sounds',
    description: 'Catchy songs and games to master letter sounds, blending and early reading',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-100',
    duration: '18 mins',
    difficulty: 'Beginner',
  },
  'general-maths': {
    subtitle: 'Numbers are Fun',
    description: 'Build strong mathematical foundations with engaging puzzles and problems',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    hoverBg: 'hover:bg-emerald-100',
    duration: '25 mins',
    difficulty: 'Beginner',
  },
  'basic-computer': {
    subtitle: 'Tech Wizards Unite',
    description: 'Learn essential computer skills, typing, and basic programming concepts',
    icon: Monitor,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    hoverBg: 'hover:bg-violet-100',
    duration: '15 mins',
    difficulty: 'Beginner',
  },
  'general-knowledge': {
    subtitle: 'Know Everything',
    description: 'Explore fascinating facts about the world, history, science, and more',
    icon: Globe,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    hoverBg: 'hover:bg-amber-100',
    duration: '20 mins',
    difficulty: 'Mixed',
  },
  'public-speaking': {
    subtitle: 'Speak with Confidence',
    description: 'Develop presentation skills, overcome stage fear, and become a confident speaker',
    icon: Megaphone,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    hoverBg: 'hover:bg-red-100',
    duration: '15 mins',
    difficulty: 'Beginner',
  },
};

const SuperKids = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confetti burst on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3, x: 0.5 },
        colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'],
        gravity: 0.8,
        scalar: 1.2,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/super-kids/categories');

        const categoriesData = Array.isArray(response.categories)
          ? response.categories
          : Array.isArray(response.data)
          ? response.data
          : [];

        const mappedCategories = categoriesData.map((cat) => ({
          id: cat.slug,
          title: cat.name,
          questions: cat.question_count || 0,
          ...(CATEGORY_UI_MAP[cat.slug] || {}),
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Confetti on card hover
  const triggerConfetti = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ['#22c55e', '#10b981', '#14b8a6', '#f59e0b', '#8b5cf6'],
      gravity: 1.2,
      scalar: 0.8,
      ticks: 100,
    });
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (studentData) => {
    try {
      const res = await api.post('/student/guest/enter', {
        name: studentData.name,
        age: studentData.age,
      });

      const { token, student } = res; 

      // Store token & student
      localStorage.setItem('student_token', token);
      localStorage.setItem('student_data', JSON.stringify(student));

      // Close modal
      setIsModalOpen(false);

      // Navigate to category test page
      if (selectedCategory) {
        console.log("Navigating to:", selectedCategory.id);
        navigate(`/super-kids/${selectedCategory.id}`);
      }
    } catch (error) {
      console.error('Guest registration failed', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-600">Loading Super Adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 via-white to-emerald-50 overflow-hidden">
      {/* Hero Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-40 shadow-lg"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full opacity-40 shadow-lg"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-40 shadow-lg"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute top-1/2 right-10 w-14 h-14 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-40 shadow-lg"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            className="absolute bottom-40 right-1/3 w-10 h-10 bg-gradient-to-br from-violet-300 to-purple-400 rounded-full opacity-40 shadow-lg"
          />

          {/* Decorative stars */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <Star className="absolute top-20 left-1/3 w-8 h-8 text-amber-400 opacity-30" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          >
            <Star className="absolute bottom-32 right-1/4 w-6 h-6 text-amber-400 opacity-30" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="absolute top-1/3 right-1/3 w-10 h-10 text-violet-400 opacity-30" />
          </motion.div>
        </div>

        <div className="container-width section-padding relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 rounded-full mb-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">For Ages 6-16</span>
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-rose-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                SUPER
              </span>
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {' '}KIDS
              </span>
              <motion.span
                animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Rocket className="inline-block w-12 h-12 md:w-16 md:h-16 ml-2 text-orange-500" />
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Learn, Play, and Become a <span className="text-violet-600 font-bold">Champion!</span>
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { icon: BookOpen, text: 'Fun Learning', color: 'from-emerald-500 to-teal-500' },
                { icon: Trophy, text: 'Win Badges', color: 'from-blue-500 to-cyan-500' },
                { icon: Target, text: 'Track Progress', color: 'from-violet-500 to-purple-500' },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className={`px-6 py-3 text-lg bg-gradient-to-r ${badge.color} text-white shadow-lg cursor-default`}
                  >
                    <badge.icon className="w-5 h-5 mr-2" />
                    {badge.text}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            {/* Achievement Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: Star, label: 'Gold Stars Earned', value: '5,000+', color: 'text-amber-500' },
                { icon: Trophy, label: 'Tests Completed', value: '10,000+', color: 'text-emerald-500' },
                { icon: Crown, label: 'Super Kids', value: '2,500+', color: 'text-violet-500' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border-2 border-dashed border-amber-300 cursor-pointer"
                    onClick={triggerConfetti}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <Icon className={`w-8 h-8 md:w-10 md:h-10 ${item.color} mx-auto mb-2`} />
                    </motion.div>
                    <div className="text-2xl md:text-3xl font-black text-gray-800">{item.value}</div>
                    <div className="text-xs md:text-sm text-gray-500 font-medium">{item.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container-width section-padding">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
              Choose Your <span className="text-violet-600">Adventure!</span>
            </h2>
            <p className="text-lg text-gray-600">Pick a subject and start your learning journey</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categories.map((category) => {
              // Fallback icon if category doesn't exist in UI map
              const Icon = category.icon || BookOpen;

              return (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="cursor-pointer h-full"
                >
                  <Card
                    className={`group relative overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl border-3 ${category.borderColor || 'border-gray-200'} ${category.bgColor || 'bg-gray-50'} ${category.hoverBg || 'hover:bg-gray-100'}`}
                  >
                    {/* Background decoration */}
                    <motion.div
                      className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${category.color || 'from-gray-400 to-gray-600'} opacity-20`}
                      animate={hoveredCategory === category.id ? { scale: 1.5, opacity: 0.4 } : { scale: 1, opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />

                    <CardHeader className="pb-2">
                      <motion.div
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${category.color || 'from-gray-500 to-gray-700'} flex items-center justify-center mb-4 shadow-lg`}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl md:text-2xl font-black text-gray-800 group-hover:text-violet-600 transition-colors">
                        {category.title}
                      </CardTitle>
                      <p className="text-sm font-bold text-violet-500">{category.subtitle || 'Explore Now'}</p>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-gray-600 mb-4 text-sm md:text-base flex-1">
                        {category.description || 'Exciting learning journey awaits!'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {category.questions} Questions
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <Zap className="w-3 h-3 mr-1" />
                          {category.duration || '20 mins'}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs border border-gray-200">
                          <Target className="w-3 h-3 mr-1" />
                          {category.difficulty || 'Mixed'}
                        </Badge>
                      </div>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          className={`w-full bg-gradient-to-r ${category.color || 'from-violet-500 to-purple-600'} text-white font-bold shadow-lg transition-all`}
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Test
                          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </motion.span>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
        </div>

        <div className="container-width section-padding relative">
          <motion.div className="text-center text-white" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <motion.h2
              className="text-3xl md:text-4xl font-black mb-8 flex items-center justify-center gap-3"
              initial={{ y: 30 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <Star className="w-8 h-8 text-amber-300" />
              </motion.div>
              Why Super Kids Love Us!
              <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <Star className="w-8 h-8 text-amber-300" />
              </motion.div>
            </motion.h2>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Rocket, text: 'Learn at Your Pace', desc: 'No pressure, just fun!' },
                { icon: Target, text: 'Track Your Progress', desc: 'See how you improve!' },
                { icon: Trophy, text: 'Win Cool Badges', desc: 'Collect achievements!' },
                { icon: Zap, text: 'Instant Results', desc: 'Know your score right away!' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.08, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/25 transition-all border-2 border-white/30 cursor-pointer"
                    onClick={triggerConfetti}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <Icon className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="font-bold text-lg mb-2">{item.text}</h3>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-width section-padding">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Lightbulb className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
              Ready to Become a <span className="text-violet-600">Super Kid?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of kids who are learning and having fun at the same time!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-rose-600 text-white text-lg px-8 py-6 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
                onClick={(e) => {
                  triggerConfetti(e);
                  setTimeout(() => {
                    confetti({
                      particleCount: 50,
                      angle: 60,
                      spread: 55,
                      origin: { x: 0 },
                      colors: ['#22c55e', '#10b981', '#f59e0b'],
                    });
                  }, 100);
                  setTimeout(() => {
                    confetti({
                      particleCount: 50,
                      angle: 120,
                      spread: 55,
                      origin: { x: 1 },
                      colors: ['#8b5cf6', '#ec4899', '#ef4444'],
                    });
                  }, 200);
                }}
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Start Your First Test FREE!
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        categoryTitle={selectedCategory?.title || ''}
        categoryColor={selectedCategory?.color || 'from-violet-500 to-purple-600'}
      />
    </div>
  );
};

export default SuperKids;