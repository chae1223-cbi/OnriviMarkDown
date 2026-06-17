import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || !supabaseAnonKey;

function createNoopClient(): SupabaseClient {
  const thenable = { then: (resolve: any) => resolve({ data: null, error: null }) };
  const query: any = new Proxy(thenable, {
    get: (target, prop) => {
      if (prop === 'then') return target.then;
      if (prop === 'select') return () => query;
      if (prop === 'eq') return () => query;
      if (prop === 'single') return () => query;
      if (prop === 'limit') return () => query;
      if (prop === 'order') return () => query;
      if (prop === 'on') return () => channel;
      if (prop === 'subscribe') return () => channel;
      return () => query;
    },
  });
  const channel: any = new Proxy({}, {
    get: () => () => channel,
  });
  return {
    channel: () => channel,
    removeChannel: () => {},
    from: () => query,
    auth: { signInWithPassword: async () => ({ data: null, error: null }), signOut: async () => {} },
    realtime: {} as any,
    rpc: () => query,
    schema: () => query,
  } as any;
}

const createSupabaseClient = () => {
  if (isPlaceholder) return createNoopClient();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const supabase = createSupabaseClient();
