import { NextResponse } from "next/server";

// Placeholder MVP — will be replaced with Claude API call
// Input: { photoCount: number }
// Output: { titulo: string; descricao: string }

const MOCK_SUGGESTIONS = [
  {
    titulo: "Cadeira de rodas manual em bom estado",
    descricao:
      "Cadeira de rodas manual com estrutura em alumínio leve. Assento confortável com apoios de braços ajustáveis e repousa-pés removíveis. Ideal para uso em casa ou exterior. Em bom estado de conservação, sem danos na estrutura.",
  },
  {
    titulo: "Andarilho articulado com rodas",
    descricao:
      "Andarilho articulado dobrável com quatro rodas e travões. Altura regulável para diferentes utilizadores. Estrutura em alumínio leve e resistente. Perfeito para apoio à mobilidade em casa e no exterior.",
  },
  {
    titulo: "Cadeira de banho com apoios laterais",
    descricao:
      "Cadeira de banho em plástico resistente à humidade com apoios laterais e encosto. Altura regulável. Facilita a higiene de pessoas com mobilidade reduzida. Em ótimo estado de conservação.",
  },
];

export async function POST(request: Request) {
  const { photoCount } = await request.json().catch(() => ({ photoCount: 1 }));

  // Simulate AI processing time
  await new Promise((r) => setTimeout(r, 1800));

  const suggestion =
    MOCK_SUGGESTIONS[Math.floor(Math.random() * MOCK_SUGGESTIONS.length)];

  return NextResponse.json({
    ...suggestion,
    confidence: photoCount >= 2 ? "alta" : "média",
    note:
      "Sugestão automática gerada pelo Banky. Revê e ajusta o texto conforme necessário.",
  });
}
