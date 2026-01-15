import React, { useState, useEffect } from 'react';
import {
  Play,
  Image as ImageIcon,
  Film,
  Award,
  Calendar,
  Camera,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { publicApi } from '@/lib/axios';

const Activities = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const categories = [
    { id: 'all', name: 'All Media' },
    { id: 'events', name: 'Events' },
    { id: 'workshops', name: 'Workshops' },
    { id: 'achievements', name: 'Achievements' },
  ];

  const stats = [
    { icon: Camera, value: '500+', label: 'Photos Captured' },
    { icon: Film, value: '50+', label: 'Videos Produced' },
    { icon: Award, value: '30+', label: 'Events Conducted' },
  ];

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'all') {
          params.category_slug = selectedCategory; // ← backend should filter by slug
        }

        const res = await publicApi.getPublicMedia(params);

        // Safe access - supports both paginated and non-paginated responses
        const items = res.data?.data?.data || res.data?.data || [];

        setMedia(items);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [selectedCategory]);

  const galleryItems = media.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.name || 'Untitled',
    category: item.categories?.[0]?.name ?? 'General',
    categorySlug: item.categories?.[0]?.slug ?? 'general',
    thumbnail: item.thumbnail_url || item.url || '',
    url: item.url || '',
    date: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—',
    duration: item.duration || null,
  }));

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
              Explore the moments that define Grovvest Academy. From workshops to celebrations, see our
              community in action.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-background rounded-xl p-4 md:p-6 text-center shadow-sm border border-border"
                >
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-border bg-background sticky top-0 z-10">
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
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 md:py-16">
        <div className="container-width section-padding">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading media...</div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No media found in this category yet.
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {galleryItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden bg-card border-border hover:shadow-xl transition-all duration-500 cursor-pointer"
                    onClick={() => setSelectedMedia(item.id)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                          </div>
                        </div>
                      )}

                      {item.duration && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs font-medium rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      )}

                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-background/95 backdrop-blur-sm text-foreground text-xs font-semibold rounded-md capitalize flex items-center gap-1.5">
                        {item.type === 'video' ? (
                          <Film className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        {item.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>

                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled
                >
                  Load More (coming soon)
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Simple Image Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-5xl w-full relative">
            <img
              src={media.find((m) => m.id === selectedMedia)?.url}
              alt="Full media"
              className="w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-large.jpg';
              }}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-md text-lg"
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