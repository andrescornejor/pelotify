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
}

// Maps WMO Weather interpretation codes to icons
// https://open-meteo.com/en/docs
const getWeatherIcon = (code: number, className?: string) => {
  const iconClass = className || "w-10 h-10";
  if (code === 0) return <Sun className={cn(iconClass, "text-yellow-400")} />;
  if (code >= 1 && code <= 3) return <Cloud className={cn(iconClass, "text-slate-400")} />;
  if (code >= 45 && code <= 48) return <CloudFog className={cn(iconClass, "text-slate-300")} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className={cn(iconClass, "text-blue-300")} />;
  if (code >= 61 && code <= 67) return <CloudRain className={cn(iconClass, "text-blue-500")} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={cn(iconClass, "text-indigo-200")} />;
  if (code >= 80 && code <= 82) return <CloudRain className={cn(iconClass, "text-blue-600")} />;
  if (code >= 95 && code <= 99) return <CloudLightning className={cn(iconClass, "text-purple-500")} />;
  return <Cloud className={cn(iconClass, "text-slate-400")} />;
};

export function WeatherWidget({ lat, lng, location, date, time, className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);

        // Resolve coordinates from location if not provided
        let targetLat = lat;
        let targetLng = lng;

        if (!targetLat || !targetLng) {
            const venue = findVenueByLocation(location || '');
            if (venue) {
                targetLat = venue.lat;
                targetLng = venue.lng;
            } else {
                // Default to Rosario coordinates if everything else fails
                targetLat = -32.9468;
                targetLng = -60.6393;
            }
        }

        // Open-Meteo is free and doesn't require an API key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLng}&hourly=temperature_2m,weathercode&forecast_days=14`
        );
        const data = await response.json();

        // Extract match timestamp (ISO format)
        const matchDateTime = `${date}T${time.split(' ')[0]}:00`;
        const matchDateObj = new Date(matchDateTime);

        // Find the index of the hourly data closest to our match time
        let closestIdx = 0;
        let minDiff = Infinity;

        data.hourly.time.forEach((t: string, idx: number) => {
          const diff = Math.abs(new Date(t).getTime() - matchDateObj.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        // If the date is too far in the future, we might not have data
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
      <div className={cn("flex items-center gap-2 animate-pulse", className)}>
        <div className="w-5 h-5 rounded-full bg-foreground/10" />
        <div className="w-8 h-3 bg-foreground/10 rounded" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={cn("flex items-center gap-4 px-4 py-2 rounded-2xl bg-foreground/[0.03] border border-foreground/10 md:", className)}>
      {getWeatherIcon(weather.code, "w-12 h-12")}
      <div className="flex items-center">
        <span className="text-4xl font-black italic tracking-tighter text-foreground leading-none">{weather.temp}°</span>
        <Thermometer className="w-4 h-4 text-foreground/30 ml-1 mt-auto mb-1" />
      </div>
    </div>
  );
}
