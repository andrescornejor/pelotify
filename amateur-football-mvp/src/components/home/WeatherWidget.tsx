'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, CloudDrizzle, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { findVenueByLocation } from '@/lib/venues';

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  location?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  className?: string;
  variant?: 'small' | 'large';
}

// Maps WMO Weather interpretation codes to icons and descriptions
const getWeatherInfo = (code: number, isLarge: boolean) => {
  const iconSize = isLarge ? "w-12 h-12" : "w-5 h-5";
  
  if (code === 0) return { 
    icon: <Sun className={cn(iconSize, "text-yellow-400")} />, 
    label: 'Despejado' 
  };
  if (code >= 1 && code <= 3) return { 
    icon: <Cloud className={cn(iconSize, "text-slate-400")} />, 
    label: 'Nublado' 
  };
  if (code >= 45 && code <= 48) return { 
    icon: <CloudFog className={cn(iconSize, "text-slate-300")} />, 
    label: 'Neblina' 
  };
  if (code >= 51 && code <= 55) return { 
    icon: <CloudDrizzle className={cn(iconSize, "text-blue-300")} />, 
    label: 'Llovizna' 
  };
  if (code >= 61 && code <= 67) return { 
    icon: <CloudRain className={cn(iconSize, "text-blue-500")} />, 
    label: 'Lluvia' 
  };
  if (code >= 71 && code <= 77) return { 
    icon: <CloudSnow className={cn(iconSize, "text-indigo-200")} />, 
    label: 'Nieve' 
  };
  if (code >= 80 && code <= 82) return { 
    icon: <CloudRain className={cn(iconSize, "text-blue-600")} />, 
    label: 'Chubascos' 
  };
  if (code >= 95 && code <= 99) return { 
    icon: <CloudLightning className={cn(iconSize, "text-purple-500")} />, 
    label: 'Tormenta' 
  };
  
  return { 
    icon: <Cloud className={cn(iconSize, "text-slate-400")} />, 
    label: 'Nublado' 
  };
};

export function WeatherWidget({ lat, lng, location, date, time, className, variant = 'small' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const isLarge = variant === 'large';

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);

        let targetLat = lat;
        let targetLng = lng;

        if (!targetLat || !targetLng) {
            const venue = findVenueByLocation(location || '');
            if (venue) {
                targetLat = venue.lat;
                targetLng = venue.lng;
            } else {
                targetLat = -32.9468;
                targetLng = -60.6393;
            }
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLng}&hourly=temperature_2m,weathercode&forecast_days=14`
        );
        const data = await response.json();

        const matchDateTime = `${date}T${time.split(' ')[0]}:00`;
        const matchDateObj = new Date(matchDateTime);

        let closestIdx = 0;
        let minDiff = Infinity;

        data.hourly.time.forEach((t: string, idx: number) => {
          const diff = Math.abs(new Date(t).getTime() - matchDateObj.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        if (minDiff > 24 * 60 * 60 * 1000) {
            setWeather(null);
        } else {
            setWeather({
                temp: Math.round(data.hourly.temperature_2m[closestIdx]),
                code: data.hourly.weathercode[closestIdx],
            });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lng, date, time]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-3 animate-pulse", isLarge ? "p-4" : "gap-2")}>
        <div className={cn("rounded-full bg-foreground/10", isLarge ? "w-12 h-12" : "w-5 h-5")} />
        <div className="flex flex-col gap-1">
          <div className={cn("bg-foreground/10 rounded", isLarge ? "w-16 h-8" : "w-8 h-3")} />
          {isLarge && <div className="w-12 h-3 bg-foreground/5 rounded" />}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const weatherInfo = getWeatherInfo(weather.code, isLarge);

  if (isLarge) {
    return (
      <div className={cn("flex items-center gap-6 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/[0.05] relative overflow-hidden", className)}>
        <div className="relative z-10 flex items-center justify-center">
            {weatherInfo.icon}
        </div>
        <div className="relative z-10 flex flex-col">
            <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black italic tracking-tighter text-foreground">
                    {weather.temp}°
                </span>
                <span className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em]">C</span>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 italic">
                {weatherInfo.label}
            </span>
        </div>
        <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
            <Thermometer className="w-16 h-16 text-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm", className)}>
      {weatherInfo.icon}
      <div className="flex items-center">
        <span className="text-[10px] font-black text-foreground">{weather.temp}°</span>
        <Thermometer className="w-2 h-2 text-foreground/30 ml-0.5" />
      </div>
    </div>
  );
}
