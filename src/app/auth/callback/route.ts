import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/pt";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const googleName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
      if (googleName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("users").update({ nome: googleName }).eq("id", data.user.id);
      }
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) return NextResponse.redirect(`${origin}${next}`);
      else if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
      else return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/pt/auth/login?error=auth_callback_failed`);
}
