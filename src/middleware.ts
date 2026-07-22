import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Exclui: auth/callback, api, _next, ficheiros estáticos
    "/((?!auth|api|_next|_vercel|.*\\..*).*)",
  ],
};
