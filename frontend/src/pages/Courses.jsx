import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, Check, Star } from "lucide-react";
import { toast } from "sonner";

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  const courses = [
    {
      id: 1,
      title: "Web Development with Project",
      description:
        "Master web development by building real-world projects using modern technologies and frameworks.",
      level: "intermediate",
      duration: "12 weeks",
      lessons: 45,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
      topics: [
        "HTML/CSS/JavaScript",
        "React.js",
        "Node.js",
        "Database Integration",
        "Project Deployment",
      ],
    },
    {
      id: 2,
      title: "Java with Project",
      description:
        "Learn Java programming from basics to advanced concepts with hands-on project development.",
      level: "beginner",
      duration: "10 weeks",
      lessons: 40,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Java Fundamentals",
        "OOP Concepts",
        "Spring Framework",
        "Database Connectivity",
        "Project Development",
      ],
    },
    {
      id: 3,
      title: "Stock Market",
      description:
        "Understand stock market fundamentals, trading strategies, and investment techniques.",
      level: "beginner",
      duration: "6 weeks",
      lessons: 24,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Market Basics",
        "Technical Analysis",
        "Fundamental Analysis",
        "Trading Strategies",
        "Risk Management",
      ],
    },
    {
      id: 4,
      title: "Financial Development",
      description:
        "Build financial literacy and learn personal finance management strategies.",
      level: "beginner",
      duration: "2 weeks",
      lessons: 8,
      price: "₹199",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Budgeting",
        "Investment Planning",
        "Tax Planning",
        "Financial Goals",
        "Money Management",
      ],
    },
    {
      id: 5,
      title: "AI with Project",
      description:
        "Dive into artificial intelligence and machine learning with practical project implementation.",
      level: "advanced",
      duration: "14 weeks",
      lessons: 50,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Python for AI",
        "Machine Learning",
        "Deep Learning",
        "Neural Networks",
        "AI Project Development",
      ],
    },
    {
      id: 6,
      title: "Fitness (Health and Physical Training)",
      description:
        "Complete fitness program covering health, nutrition, and physical training methodologies.",
      level: "beginner",
      duration: "8 weeks",
      lessons: 32,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Exercise Science",
        "Nutrition Planning",
        "Workout Routines",
        "Health Assessment",
        "Injury Prevention",
      ],
    },
    {
      id: 7,
      title: "Digital Marketing",
      description:
        "Master digital marketing strategies, social media marketing, and online advertising techniques.",
      level: "intermediate",
      duration: "10 weeks",
      lessons: 38,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      topics: [
        "SEO/SEM",
        "Social Media Marketing",
        "Content Marketing",
        "Email Marketing",
        "Analytics & Reporting",
      ],
    },
    {
      id: 8,
      title: "Data Science",
      description:
        "Learn data analysis, visualization, and machine learning to make data-driven decisions.",
      level: "advanced",
      duration: "16 weeks",
      lessons: 55,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Python/R Programming",
        "Data Analysis",
        "Machine Learning",
        "Data Visualization",
        "Statistical Analysis",
      ],
    },
    {
      id: 9,
      title: "Python",
      description:
        "Complete Python programming course from fundamentals to advanced application development.",
      level: "beginner",
      duration: "12 weeks",
      lessons: 42,
      price: "₹1,999",
      originalPrice: "₹5,000",
      isPremium: true,
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
      topics: [
        "Python Basics",
        "OOP in Python",
        "Web Development",
        "Data Structures",
        "Project Development",
      ],
    },
    {
      id: 10,
      title: "Hindi",
      description:
        "Learn Hindi language from basics to advanced conversation and writing skills.",
      level: "beginner",
      duration: "8 weeks",
      lessons: 30,
      price: "₹499",
      isPremium: true,
      image: "/images/hindi.jpg",
      topics: [
        "Hindi Alphabet",
        "Basic Grammar",
        "Vocabulary Building",
        "Conversation Skills",
        "Reading & Writing",
      ],
    },
    {
      id: 11,
      title: "Advanced English Mastery with Project",
      description:
        "Enhance your English proficiency through in-depth lessons, advanced grammar, and practical project-based learning.",
      level: "beginner",
      duration: "6 weeks",
      lessons: 20,
      price: "₹499",
      isPremium: true,
      image: "/images/english.jpeg",
      topics: [
        "Advanced Grammar",
        "Vocabulary Expansion",
        "Essay & Report Writing",
        "Public Speaking & Presentation Skills",
        "English Project Development",
      ],
    },
    {
      id: 12,
      title: "Arabic",
      description:
        "Learn Arabic language fundamentals including reading, writing, and conversational skills.",
      level: "beginner",
      duration: "8 weeks",
      lessons: 28,
      price: "₹499",
      isPremium: true,
      image: "/images/arabic.jpeg",
      topics: [
        "Arabic Alphabet",
        "Basic Grammar",
        "Vocabulary Building",
        "Conversation Skills",
        "Reading & Writing",
      ],
    },
  ];

  const filteredCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((course) => course.level === selectedCategory);

  const handleCategoryChange = (categoryId) => {
    setIsAnimating(true);
    setSelectedCategory(categoryId);
    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  useEffect(() => {
    console.log("Selected category:", selectedCategory);
    console.log("Filtered courses count:", filteredCourses.length);
  }, [selectedCategory, filteredCourses]);

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

<div className="mb-16">
  <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-white">
    <div className="grid md:grid-cols-2 gap-0">

      {/* LEFT SIDE - IMAGE */}
      <div className="relative">
        <img
          src="/images/superkids.jpg"
          alt="Super Kids Course"
          className="w-full h-full object-cover"
        />

        {/* AGE LABEL */}
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow-lg font-semibold text-orange-600">
          Ages 5–14 • Live + Recorded
        </div>
      </div>

      {/* RIGHT SIDE - CONTENT */}
      <div className="p-8 md:p-10 flex flex-col items-center text-center">

        {/* ⭐ BADGES CENTERED HERE */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {["GK", "Phonics", "Spoken English", "Computer Basics"].map((t) => (
            <Badge
              key={t}
              className="bg-orange-600 text-white px-3 py-1 rounded-lg shadow"
            >
              {t}
            </Badge>
          ))}
        </div>

        {/* TITLE */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 leading-tight">
          SUPER KIDS COURSE
        </h1>

        {/* SUBTEXT */}
        <p className="text-gray-600 text-lg md:text-xl mt-3 max-w-md">
          Build confidence, knowledge & skills with fun and structured learning.
        </p>

        {/* PRICE */}
        <div className="mt-6">
          <span className="text-2xl text-gray-400 line-through">₹999</span>
          <p className="text-5xl font-black text-orange-500 mt-1">
            ₹350 <span className="text-xl font-normal">/month</span>
          </p>
        </div>

        {/* BENEFITS */}
        <div className="mt-6 space-y-2 text-gray-700 text-base text-left w-full max-w-sm">
          {[
            "Daily fun-filled learning activities",
            "Live + Recorded access",
            "Progress tracking for parents",
            "Designed for ages 5–14",
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <Check className="text-green-600 mr-2" size={18} /> {item}
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg mt-8 py-6 rounded-xl shadow-lg"
          onClick={() => {
            toast.success("Joining WhatsApp group...");
            setTimeout(
              () =>
                window.open(
                  "https://chat.whatsapp.com/DU3aiu3CLy15dt6eVGW91K",
                  "_blank"
                ),
              2000
            );
          }}
        >
          Enroll Now @ ₹350 Only!
        </Button>

      </div>
    </div>
  </Card>
</div>


        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Master New Skills with Expert Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your career with our comprehensive courses designed for
            practical learning and real-world application.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.id ? "default" : "outline"
              }
              onClick={() => handleCategoryChange(category.id)}
              className={
                selectedCategory === category.id
                  ? "btn-primary"
                  : "btn-outline"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div
          className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-opacity duration-300 ${
            isAnimating ? "opacity-50" : "opacity-100"
          }`}
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card
                key={`${course.id}-${selectedCategory}`}
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level.charAt(0).toUpperCase() +
                        course.level.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-400 text-white border-0">
                      Premium
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl mb-2">
                    {course.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {course.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen size={16} className="mr-1" />
                        {course.lessons} lessons
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Topics Covered:
                      </h4>
                      <div className="space-y-1">
                        {course.topics.map((topic, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Check
                              size={14}
                              className="text-green-600 mr-2 flex-shrink-0"
                            />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline space-x-2">
                          {course.originalPrice && (
                            <span className="text-gray-400 line-through text-lg">
                              {course.originalPrice}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-primary">
                            {course.price}
                          </span>
                        </div>
                        <Button
                          className="btn-primary"
                          onClick={() => {
                            toast.success(
                              "Join our WhatsApp group to get the course!",
                              {
                                duration: 3000,
                              }
                            );
                            setTimeout(() => {
                              window.open(
                                "https://chat.whatsapp.com/DU3aiu3CLy15dt6eVGW91K?mode=ac_t",
                                "_blank"
                              );
                            }, 2000);
                          }}
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-gray-500">
                No courses found for the selected category.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              Join thousands of successful learners who have transformed their
              careers through our courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                View All Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-green-600 hover:bg-white hover:text-green-600"
              >
                <User className="mr-2" size={20} />
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;