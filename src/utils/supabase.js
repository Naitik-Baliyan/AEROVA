import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://inxmrqqimbrzqpifmwxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueG1ycXFpbWJyenFwaWZtd3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTQ5NzUsImV4cCI6MjA5NDIzMDk3NX0.SLKV-oOfTmiV8E3x8me3gh_lIcMDGKS_9_EUeOKe4iQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase to automatically refresh the persistent token 
// only when the app is active, preventing background token decay.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
