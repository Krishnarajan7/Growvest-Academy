import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BookOpen,
  Users,
  Shield,
  Star,
  Calculator,
  Trophy,
  Award,
  CheckCircle,
  Download,
  Share2,
  Code,
  BarChart3,
  PiggyBank,
  LineChart,
  Rocket,
  Clock,
  Globe,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StockMarketTicker from "@/components/StockMarketTicker";
import HeroCarousel from "@/components/HeroCarousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RegistrationForm from "@/components/RegistrationForm";

const Home = () => {
  const features = [
    {
      title: "Expert Guidance",
      description:
        "Learn from seasoned developers and tech industry experts. Get insights into modern programming practices and career guidance.",
      icon: TrendingUp,
    },
    {
      title: "Comprehensive Courses",
      description:
        "Access a wide range of courses covering Web Development, Java, AI, and more. Perfect for beginners and advanced learners.",
      icon: BookOpen,
    },
    {
      title: "Community Support",
      description:
        "Join a vibrant community of developers and learners. Share projects, ask questions, and grow together.",
      icon: Users,
    },
    {
      title: "Secure Platform",
      description:
        "Learn with confidence on our secure and reliable platform. Your progress and projects are protected.",
      icon: Shield,
    },
    {
      title: "Personalized Learning",
      description:
        "Customize your learning path to match your career goals. Track your progress and get personalized recommendations.",
      icon: Star,
    },
    {
      title: "Hands-on Projects",
      description:
        "Build real-world projects and portfolios. Apply your skills with practical assignments and industry-relevant challenges.",
      icon: Calculator,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      title: "Software Engineer",
      quote:
        "Growvest Academy helped me transition into tech with their comprehensive Full Stack course. The projects were amazing!",
    },
    {
      name: "Amit Patel",
      title: "Java Developer",
      quote:
        "I was new to programming, but Growvest Academy made Java simple and accessible. Now I'm working at a top tech company.",
    },
  ];

  const stats = [
    { label: "Technical Courses", value: "10+" },
    { label: "Happy Learners", value: "10K+" },
    { label: "Years of Experience", value: "5+" },
  ];

  const certificateFeatures = [
    { icon: CheckCircle, text: "Official Growvest Academy Certificate" },
    { icon: Download, text: "Downloadable PDF format" },
    { icon: Share2, text: "LinkedIn profile ready" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <HeroCarousel />
      {/* Event Section */}
      <section className="relative bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 text-white py-20 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-width section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Event Image */}
            <div className="flex justify-center lg:justify-start scroll-reveal-left">
              <img
                src="/images/spellbee.jpg"
                alt="Spelling Bee Event"
                className="rounded-2xl shadow-2xl border-4 border-white/30 transition-transform duration-300 hover:scale-105"
                style={{ maxWidth: "420px", height: "auto" }}
              />
            </div>

            {/* Right: Event Details */}
            <div className="space-y-6 text-center lg:text-left scroll-reveal-right">
              {/* Heading */}
              <h2 className="text-4xl lg:text-5xl font-extrabold drop-shadow-sm leading-tight animate-fadeInUp">
                🐝 Spelling Bee Competition 2025
              </h2>
              <p className="text-lg lg:text-xl text-yellow-50 max-w-lg animate-fadeInUp delay-200">
                Inspire confidence, celebrate talent, and let your child shine
                on stage ✨
              </p>
              <Badge className="bg-white text-yellow-700 text-base px-4 py-1 hover:text-white rounded-full shadow animate-fadeInUp delay-400">
                🎖 All Participants Receive Medals
              </Badge>

              {/* Info Highlights */}
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                {/* Registration */}
                <div className="bg-white/20 p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform text-left animate-fadeInUp delay-600">
                  <div className="flex items-center mb-3">
                    <Clock className="w-7 h-7 text-yellow-100 mr-3" />
                    <h3 className="font-semibold text-lg">
                      Registration Starts
                    </h3>
                  </div>
                  <p className="text-sm font-medium pl-10">📅 24 Sept, 2025</p>
                </div>

                {/* Prizes */}
                <div className="bg-white/20 p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform text-left animate-fadeInUp delay-800">
                  <div className="flex items-center mb-3">
                    <Trophy className="w-7 h-7 text-yellow-100 mr-3" />
                    <h3 className="font-semibold text-lg">Prizes</h3>
                  </div>
                  <ul className="text-sm space-y-1 pl-10">
                    <li>🥇 ₹3000 + Trophy + Certificate</li>
                    <li>🥈 ₹2000 + Trophy + Certificate</li>
                    <li>🥉 ₹1000 + Trophy + Certificate</li>
                  </ul>
                </div>
              </div>

              {/* Full Details */}
              <div className="bg-white/20 p-6 rounded-xl shadow-md mt-6 hover:-translate-y-1 transition-transform text-left animate-fadeInUp delay-1000">
                <div className="flex items-center mb-3">
                  <Globe className="w-7 h-7 text-yellow-100 mr-3" />
                  <h3 className="font-semibold text-lg">Event Details</h3>
                </div>
                <div className="pl-10 space-y-1 text-sm">
                  <p>👶 Junior: 6–9 yrs</p>
                  <p>👦 Senior: 10–15 yrs</p>
                  <p>💰 Fee: ₹120</p>
                  <p>📆 Competition Date: Coming Soon</p>
                  <a
                    href="https://growvestaca.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-50 underline hover:text-white text-sm mt-2 inline-block"
                  >
                    Learn More →
                  </a>
                </div>
              </div>

              {/* CTA with RegistrationForm Modal */}
              <div className="pt-4 animate-fadeInUp delay-1200">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-white text-yellow-700 font-bold shadow-md hover:shadow-lg hover:bg-yellow-50 transition-all rounded-full px-8 py-4 text-base"
                    >
                      Register Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg w-full">
                    <DialogHeader>
                      <DialogTitle>Register for Spelling Bee 2025</DialogTitle>
                    </DialogHeader>
                    <RegistrationForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Market Ticker */}
      <StockMarketTicker />

      {/* Stats Section */}
      <section className="py-12 bg-white scroll-reveal">
        <div className="container-width section-padding">
          <div className="grid md:grid-cols-3 gap-8 text-center stagger-children">
            {stats.map((stat, index) => (
              <div key={index} className="hover-lift">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-700 text-white relative overflow-hidden scroll-reveal">
        <div className="absolute inset-0 hero-parallax">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full opacity-20 -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-800 rounded-full opacity-20 translate-y-32 -translate-x-32"></div>
        </div>
        <div className="container-width section-padding relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 scroll-reveal-left">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-3 bg-green-500/20 px-4 py-2 rounded-full">
                  <Award className="w-6 h-6 text-yellow-300" />
                  <span className="font-medium text-green-100">
                    Industry-Recognized Certification
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Earn Certificates That Boost Your Career
                </h2>
                <p className="text-xl text-green-100 leading-relaxed">
                  Complete our comprehensive technical and financial courses and
                  receive certificates that showcase your expertise and enhance
                  your professional profile across industries.
                </p>
              </div>

              <div className="space-y-4 stagger-children">
                {certificateFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-green-100">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-white text-green-700 hover:bg-green-50 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="scroll-reveal-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-lg opacity-20 blur"></div>
                <img
                  src="/images/certify.jpg"
                  alt="Growvest Academy Certificate"
                  className="relative w-full max-w-lg mx-auto rounded-lg shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Award className="w-8 h-8 text-green-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 scroll-reveal">
        <div className="container-width section-padding">
          <div className="text-center mb-16 scroll-reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                Growvest Academy
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive education in technology and finance designed for
              modern professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md hover-lift"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:from-green-200 group-hover:to-green-200 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-green-700" />
                    </div>
                    <CardTitle className="group-hover:text-green-700 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Tools Section */}
      <section className="py-16 bg-white scroll-reveal">
        <div className="container-width section-padding">
          <div className="text-center mb-16 scroll-reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Smart Learning{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                Tools & Resources
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our comprehensive suite of learning tools for both
              technical and financial education
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 stagger-children">
            {[
              {
                icon: Code,
                title: "Code Editor",
                desc: "Built-in coding environment",
              },
              {
                icon: BarChart3,
                title: "Market Simulator",
                desc: "Practice trading safely",
              },
              {
                icon: Rocket,
                title: "Project Builder",
                desc: "Create real-world projects",
              },
              {
                icon: LineChart,
                title: "Portfolio Tracker",
                desc: "Monitor investments",
              },
              {
                icon: Trophy,
                title: "Skill Tracker",
                desc: "Monitor your progress",
              },
              {
                icon: PiggyBank,
                title: "SIP Calculator",
                desc: "Plan your investments",
              },
              {
                icon: Target,
                title: "Career Path",
                desc: "Personalized roadmap",
              },
              {
                icon: Globe,
                title: "Launch Pad",
                desc: "Deploy your projects",
              },
            ].map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-lift"
                >
                  <CardContent className="p-4 lg:p-6 text-center">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-green-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 group-hover:from-green-200 group-hover:to-green-200 transition-colors duration-300">
                      <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-green-700" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300 text-sm lg:text-base">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-xs lg:text-sm">
                      {tool.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 scroll-reveal">
        <div className="container-width section-padding">
          <div className="text-center mb-16 scroll-reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                Students
              </span>{" "}
              Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from people who have transformed their careers with
              us
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 stagger-children">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-lift"
              >
                <CardContent className="p-8">
                  <div className="mb-4">
                    <p className="text-gray-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-green-100 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-200 transition-colors duration-300">
                      <Users className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-600 text-white relative overflow-hidden scroll-reveal">
        <div className="absolute inset-0 bg-black/10 hero-parallax"></div>
        <div className="container-width section-padding relative">
          <div className="text-center max-w-3xl mx-auto scroll-reveal-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of successful professionals who advanced their
              careers with Growvest Academy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 font-medium w-full sm:w-auto hover-lift"
                >
                  Start Free Course
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/premium">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-green-700 hover:bg-white hover:text-green-700 font-medium w-full sm:w-auto hover-lift"
                >
                  Explore Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
