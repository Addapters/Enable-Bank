"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthError = {
  message: string;
};

export async function login(
  _prevState: AuthError | void,
  formData: FormData
): Promise<AuthError | void> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/pt";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { message: "Email ou palavra-passe incorretos." };
    }
    return { message: "Ocorreu um erro ao entrar. Tenta novamente." };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function register(
  _prevState: AuthError | void,
  formData: FormData
): Promise<AuthError | void> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const tipo = (formData.get("tipo") as string) || "particular";
  const concelho = (formData.get("concelho") as string) || null;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, tipo, concelho },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { message: "Este email já está registado. Tenta fazer login." };
    }
    return { message: "Erro ao criar conta. Verifica os dados e tenta novamente." };
  }

  if (data.user && !data.user.email_confirmed_at) {
    redirect("/pt/auth/verify-email");
  }

  if (data.user) {
    await supabase
      .from("users")
      .update({ nome, tipo, concelho })
      .eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/pt");
}

export async function loginWithGoogle(redirectTo?: string): Promise<AuthError | void> {
  const supabase = await createClient();

  const callbackUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
  if (redirectTo) callbackUrl.searchParams.set("next", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) return { message: "Erro ao iniciar sessão com Google." };
  if (data.url) redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/pt");
}

export async function forgotPassword(
  _prevState: AuthError | { success: true } | undefined,
  formData: FormData
): Promise<AuthError | { success: true }> {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) return { message: "Erro ao enviar email. Verifica o endereço e tenta novamente." };
  return { success: true };
}
