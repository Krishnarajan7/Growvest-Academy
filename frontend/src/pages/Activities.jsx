import React, { useState, useEffect, useRef } from 'react';
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
  const [categories, setCategories] = useState([{ slug: 'all', name: 'All Media' }]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicApi.getPublicCategories();

        const cats =
          res?.data?.data?.data ??
          res?.data?.data ??
          res?.data ??
          [];

        const formatted = cats.map((cat) => ({
          slug: cat.slug,
          name: cat.name,
        })).sort((a, b) => a.name.localeCompare(b.name));

        setCategories([
          { slug: 'all', name: 'All Media' },
          ...formatted,
        ]);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'all') {
          params.category_slug = selectedCategory;
        }

        const res = await publicApi.getPublicMedia(params);
        const items = res.data?.data?.data || res.data?.data || [];
        setMedia(items);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchMedia();
  }, [selectedCategory]);

  const galleryItems = media.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.name || 'Untitled',
    description: item.description || '',
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

  const stats = [
    { icon: Camera, value: '500+', label: 'Photos Captured' },
    { icon: Film, value: '50+', label: 'Videos Produced' },
    { icon: Award, value: '30+', label: 'Events Conducted' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-background">
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

      <section className="py-6 border-b border-border bg-background">
        <div className="container-width section-padding">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category.slug;
              return (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
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

      <section className="py-12 md:py-16">
        <div className="container-width section-padding">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading media...</div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No media found {selectedCategory !== 'all' ? `in this category` : 'yet'}.
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 auto-rows-fr">
              {galleryItems.map((item) => (
                <Card
                  key={item.id}
                  className="
                    group overflow-hidden 
                    bg-card 
                    border border-border/40
                    rounded-xl 
                    shadow-sm hover:shadow-xl 
                    transition-all duration-300 
                    cursor-pointer 
                    flex flex-col h-full
                    backdrop-blur-sm
                    hover:-translate-y-1
                  "
                  onClick={() => setSelectedMedia(item.id)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="
                        w-full h-full object-cover 
                        transition-transform duration-700 
                        group-hover:scale-[1.08]
                      "
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent/0 pointer-events-none" />

                    {item.type === 'video' && (
                      <div className="
                        absolute inset-0 
                        flex items-center justify-center
                        opacity-90 group-hover:opacity-100
                        transition-opacity duration-300
                      ">
                        <div className="
                          w-14 h-14 sm:w-16 sm:h-16 
                          bg-primary/90 backdrop-blur-sm 
                          rounded-full 
                          flex items-center justify-center 
                          shadow-lg shadow-primary/30
                          ring-1 ring-primary/40
                          transform group-hover:scale-110 
                          transition-transform duration-300
                        ">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {item.duration && (
                      <div className="
                        absolute bottom-3 right-3 
                        px-2.5 py-1 
                        bg-black/75 backdrop-blur-md 
                        text-white text-xs font-medium 
                        rounded-md 
                        flex items-center gap-1.5
                        shadow-sm
                      ">
                        <Clock className="w-3.5 h-3.5" />
                        {item.duration}
                      </div>
                    )}

                    <div className="
                      absolute top-3 left-3 
                      max-w-[85%]
                      px-2 py-0.5 
                      bg-background/80 backdrop-blur-md 
                      border border-border/50
                      text-foreground/90 text-xs font-medium 
                      rounded-md 
                      flex items-center gap-1.5
                      shadow-sm
                      truncate
                    ">
                      {item.type === 'video' ? (
                        <Film className="w-3.5 h-3.5" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="
                      font-semibold text-lg leading-tight 
                      text-foreground 
                      mb-2.5 
                      line-clamp-2
                      group-hover:text-primary 
                      transition-colors
                    ">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="
                        text-sm text-muted-foreground 
                        line-clamp-2 
                        mb-4 
                        flex-grow
                      ">
                        {item.description}
                      </p>
                    )}

                    <div className="
                      flex items-center justify-between 
                      text-xs text-muted-foreground/80
                      mt-auto pt-3 border-t border-border/40
                    ">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>

                      {item.duration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

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