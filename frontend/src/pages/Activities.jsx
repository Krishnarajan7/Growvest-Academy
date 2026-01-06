import React, { useState } from 'react';
import { Play, Eye, Heart, Image, Film, Award, Calendar, Users, Camera, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Activities = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedItems, setLikedItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const categories = [
    { id: 'all', name: 'All Media', count: 12 },
    { id: 'workshops', name: 'Workshops', count: 5 },
    { id: 'events', name: 'Events', count: 4 },
    { id: 'achievements', name: 'Achievements', count: 3 },
  ];

  const galleryItems = [
    {
      id: 1,
      type: 'image',
      category: 'events',
      title: 'Annual Tech Summit 2024',
      description: 'Students showcasing innovative projects at our annual tech summit',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      location: 'Main Auditorium',
      date: 'Dec 15, 2024',
      participants: 250,
      views: 1250,
      likes: 89,
    },
    {
      id: 2,
      type: 'video',
      category: 'workshops',
      title: 'Coding Workshop Highlights',
      description: 'Hands-on coding session with industry experts covering modern web development',
      thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
      location: 'Computer Lab',
      date: 'Nov 28, 2024',
      participants: 45,
      views: 2340,
      likes: 156,
      duration: '15:30',
    },
    {
      id: 3,
      type: 'image',
      category: 'achievements',
      title: 'Graduation Ceremony',
      description: 'Celebrating our successful graduates and their achievements',
      thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
      location: 'Convention Center',
      date: 'Oct 20, 2024',
      participants: 180,
      views: 890,
      likes: 234,
    },
    {
      id: 4,
      type: 'video',
      category: 'events',
      title: 'Hackathon 2024',
      description: '48-hour coding marathon with amazing innovations and creative solutions',
      thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
      location: 'Innovation Hub',
      date: 'Sep 15, 2024',
      participants: 120,
      views: 3100,
      likes: 278,
      duration: '8:45',
    },
    {
      id: 5,
      type: 'image',
      category: 'workshops',
      title: 'AI & Machine Learning Session',
      description: 'Interactive workshop on latest AI technologies and practical applications',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
      location: 'Tech Center',
      date: 'Aug 10, 2024',
      participants: 60,
      views: 1560,
      likes: 123,
    },
    {
      id: 6,
      type: 'image',
      category: 'achievements',
      title: 'Student Project Exhibition',
      description: 'Showcasing student innovations and breakthrough projects',
      thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
      location: 'Exhibition Hall',
      date: 'Jul 25, 2024',
      participants: 200,
      views: 980,
      likes: 87,
    },
    {
      id: 7,
      type: 'video',
      category: 'workshops',
      title: 'Web Development Bootcamp',
      description: 'Full-stack development intensive training with hands-on projects',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      location: 'Training Room A',
      date: 'Jun 18, 2024',
      participants: 35,
      views: 4200,
      likes: 312,
      duration: '22:15',
    },
    {
      id: 8,
      type: 'image',
      category: 'events',
      title: 'Guest Lecture Series',
      description: 'Industry experts sharing insights and career guidance with students',
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
      location: 'Seminar Hall',
      date: 'May 12, 2024',
      participants: 150,
      views: 1120,
      likes: 98,
    },
    {
      id: 9,
      type: 'video',
      category: 'workshops',
      title: 'Data Science Masterclass',
      description: 'Deep dive into data analysis and visualization techniques',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      location: 'Analytics Lab',
      date: 'Apr 22, 2024',
      participants: 40,
      views: 1890,
      likes: 145,
      duration: '18:20',
    },
    {
      id: 10,
      type: 'image',
      category: 'achievements',
      title: 'Award Ceremony',
      description: 'Recognizing outstanding student achievements and excellence',
      thumbnail: 'https://images.unsplash.com/photo-1559223607-a43f990c095d?w=800&h=600&fit=crop',
      location: 'Grand Hall',
      date: 'Mar 30, 2024',
      participants: 300,
      views: 2100,
      likes: 267,
    },
    {
      id: 11,
      type: 'video',
      category: 'workshops',
      title: 'Mobile App Development',
      description: 'Building cross-platform mobile applications from scratch',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      location: 'Dev Studio',
      date: 'Feb 15, 2024',
      participants: 30,
      views: 1650,
      likes: 112,
      duration: '25:45',
    },
    {
      id: 12,
      type: 'image',
      category: 'events',
      title: 'Tech Networking Night',
      description: 'Connecting students with industry professionals and mentors',
      thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
      location: 'Rooftop Lounge',
      date: 'Jan 28, 2024',
      participants: 100,
      views: 780,
      likes: 65,
    },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const stats = [
    { icon: Camera, value: '500+', label: 'Photos Captured' },
    { icon: Film, value: '50+', label: 'Videos Produced' },
    { icon: Users, value: '2,500+', label: 'Participants' },
    { icon: Award, value: '30+', label: 'Events Conducted' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container-width section-padding relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Camera className="w-4 h-4" />
              Our Journey in Pictures
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Activities & Media Gallery
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the moments that define Grovvest Academy. From workshops to celebrations, 
              see our community in action.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-background rounded-xl p-4 md:p-6 text-center shadow-sm border border-border">
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 border-b border-border bg-background">
        <div className="container-width section-padding">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {category.name}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-primary-foreground/20' : 'bg-background'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-16">
        <div className="container-width section-padding">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="group overflow-hidden bg-card border-border hover:shadow-xl transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedMedia(item.id)}
              >
                {/* Media Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Video Play Button */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Duration Badge */}
                  {item.duration && (
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs font-medium rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  )}

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 px-3 py-1.5 bg-background/95 backdrop-blur-sm text-foreground text-xs font-semibold rounded-md capitalize flex items-center gap-1.5">
                    {item.type === 'video' ? <Film className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    {item.category}
                  </span>

                  {/* Like Button */}
                  <button 
                    onClick={(e) => toggleLike(e, item.id)}
                    className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${likedItems.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {item.participants}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {item.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4" />
                      {item.likes + (likedItems.includes(item.id) ? 1 : 0)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Load More Media
            </Button>
          </div>
        </div>
      </section>

      {/* Media Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl w-full">
            <img 
              src={galleryItems.find(i => i.id === selectedMedia)?.thumbnail}
              alt=""
              className="w-full rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white/80 hover:text-white text-lg font-medium"
              onClick={() => setSelectedMedia(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;