'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_STORIES = [
  { id: 1, type: 'create', user: 'Tu Historia', img: null, isActive: false },
  { id: 2, type: 'story', user: 'Rodri FC', img: 'https://images.unsplash.com/photo-1551958219-acbc608c6aff?q=80&w=200&auto=format&fit=crop', isActive: true },
  { id: 3, type: 'story', user: 'SinteticoVIP', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop', isActive: true },
  { id: 4, type: 'story', user: 'Los Pibes', img: 'https://images.unsplash.com/photo-1600250395356-07755b40cf6d?q=80&w=200&auto=format&fit=crop', isActive: false },
  { id: 5, type: 'story', user: 'FC Barrio', img: 'https://plus.unsplash.com/premium_photo-1661884488583-05b1c55d9b5f?q=80&w=200&auto=format&fit=crop', isActive: false },
];

export const StoriesRow = () => {
  const { user } = useAuth();
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide snap-x">
      <div className="flex items-center gap-4 px-2">
        {MOCK_STORIES.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
          >
            <div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 ${
                story.isActive ? 'bg-gradient-to-tr from-primary via-emerald-400 to-accent' : 'bg-foreground/10'
              }`}
            >
              <div className="w-full h-full rounded-full bg-background p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center relative">
                  {story.type === 'create' ? (
                    <>
                      {avatar && <img src={avatar} alt="You" className="w-full h-full object-cover opacity-70" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <img src={story.img!} alt={story.user} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-foreground/70 truncate w-16 sm:w-20 text-center font-kanit">
              {story.type === 'create' ? 'Agregar...' : story.user}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
