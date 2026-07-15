import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const DEV_USER: import("@supabase/supabase-js").User = {
  id: "dev-user-001",
  aud: "authenticated",
  role: "authenticated",
  email: "dev@meetingos.local",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: "email" },
  user_metadata: {
    name: "Dev User",
    avatar_url: "",
    email: "dev@meetingos.local",
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/** Creates a mock Supabase client that returns empty data gracefully */
function createMockSupabase(): SupabaseClient {
  const emptyResponse = (data: unknown = null) =>
    Promise.resolve({ data, error: null, count: null, status: 200, statusText: "OK" });

  const handler: ProxyHandler<SupabaseClient> = {
    get(_target, prop) {
      if (prop === "from") {
        return (_table: string) => mockQueryBuilder();
      }
      if (prop === "auth") {
        return {
          getUser: () => emptyResponse({ user: DEV_USER }),
          getSession: () => emptyResponse({ session: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: () => emptyResponse(),
        };
      }
      if (prop === "storage") {
        return {
          from: () => ({
            download: () => emptyResponse(),
            remove: () => emptyResponse(),
            list: () => emptyResponse([]),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
          }),
        };
      }
      if (typeof prop === "string" && !prop.startsWith("_")) {
        return () => emptyResponse();
      }
      return undefined;
    },
  };

  const mockQueryBuilder = (): Record<string, unknown> => {
    let isSingle = false;
    const methods = [
      "select", "insert", "update", "delete", "eq", "neq", "gt", "gte", "lt", "lte",
      "like", "ilike", "is", "in", "contains", "containedBy", "rangeGt", "rangeGte",
      "rangeLt", "rangeLte", "overlaps", "textSearch", "match", "not", "or", "and",
      "filter", "order", "limit", "range", "csv", "csvText",
    ];
    const builder: Record<string, unknown> = {};
    for (const method of methods) {
      builder[method] = (..._args: unknown[]) => {
        if (method === "single" || method === "maybeSingle") isSingle = true;
        return builder;
      };
    }
    // .then() so it can be awaited like a promise — return null data for .single() queries
    builder.then = (resolve: (value: unknown) => void) => {
      if (isSingle) {
        resolve({ data: null, error: null, count: null, status: 200, statusText: "OK" });
      } else {
        resolve({ data: [], error: null, count: 0, status: 200, statusText: "OK" });
      }
    };
    return builder;
  };

  return new Proxy({} as SupabaseClient, handler);
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Safely get the authenticated user from Supabase.
 * In dev mode when Supabase is unavailable, returns a mock user + mock client
 * so API routes return empty data instead of 401 errors.
 */
export async function getServerUser(): Promise<{
  user: import("@supabase/supabase-js").User | null;
  supabase: SupabaseClient | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { user, supabase };
  } catch {
    console.warn("[Dev] Supabase unavailable — using mock data");
    return { user: DEV_USER, supabase: createMockSupabase() };
  }
}
