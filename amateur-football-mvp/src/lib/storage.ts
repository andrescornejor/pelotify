import { supabase } from './supabase';

export async function uploadTeamLogo(file: File, teamName: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${teamName.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // 1. Upload file
  const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data } = supabase.storage.from('logos').getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadUserAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 1. Upload file
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return data.publicUrl;
}
