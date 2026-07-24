import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Regista uma visita de página (analítica interna do backoffice) sem atrasar a resposta —
// corre em background via waitUntil, e ignora prefetches do Next.js (link hover) para não
// inflacionar as contagens com navegação que o utilizador nunca chegou a fazer.
function logPageView(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
  if (request.headers.get("next-router-prefetch") || request.headers.get("purpose") === "prefetch") return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  event.waitUntil(
    fetch(`${url}/rest/v1/page_views`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
    }).catch(() => {})
  );
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const intlResponse = intlMiddleware(request);

  logPageView(request, event);

  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/publications/new", "/publications/edit"];
  const adminPaths = ["/admin"];

  const isProtected = protectedPaths.some((path) => pathname.includes(path));
  const isAdmin = adminPaths.some((path) => pathname.includes(path));

  if (!isProtected && !isAdmin) {
    return intlResponse;
  }

  let supabaseResponse = intlResponse || NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/pt/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!profile || (profile as any).role !== "admin") {
      return NextResponse.redirect(new URL("/pt", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Exclui: auth/callback, api, _next, ficheiros estáticos
    "/((?!auth|api|_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
