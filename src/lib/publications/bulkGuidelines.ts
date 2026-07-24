/**
 * Especificação das colunas do CSV de publicação em massa (só para entidades).
 * Fonte única — usada no modelo descarregável, nas instruções da página e na validação.
 */
export const BULK_CSV_COLUMNS = [
  { key: "titulo", label: "titulo", required: true, hint: "Mínimo 5 caracteres." },
  { key: "descricao", label: "descricao", required: true, hint: "Mínimo 20 caracteres. Usa aspas se contiver vírgulas." },
  { key: "tipo", label: "tipo", required: true, hint: "doacao, troca ou venda." },
  { key: "categoria", label: "categoria", required: true, hint: "Slug da categoria ou subcategoria (ex: mobilidade, cadeiras-rodas)." },
  { key: "estado", label: "estado", required: true, hint: "novo, bom ou usado." },
  { key: "publico", label: "publico", required: true, hint: "crianca, adulto ou ambos." },
  { key: "concelho", label: "concelho", required: true, hint: "Nome exato do concelho (ex: Lisboa, Porto)." },
  { key: "codigo_postal", label: "codigo_postal", required: true, hint: "4 dígitos (ex: 4000)." },
  { key: "preco", label: "preco", required: false, hint: "Obrigatório só se tipo=venda. Formato 0.00." },
  { key: "negociavel", label: "negociavel", required: false, hint: "sim ou nao. Só relevante se tipo=venda." },
  { key: "disponivel", label: "disponivel", required: false, hint: "sim ou nao. Por omissão: sim." },
  { key: "foto_url_1", label: "foto_url_1", required: true, hint: "URL pública de uma imagem (a 1ª é a capa)." },
  { key: "foto_url_2", label: "foto_url_2", required: false, hint: "URL pública de imagem adicional." },
  { key: "foto_url_3", label: "foto_url_3", required: false, hint: "URL pública de imagem adicional." },
  { key: "foto_url_4", label: "foto_url_4", required: false, hint: "URL pública de imagem adicional." },
  { key: "foto_url_5", label: "foto_url_5", required: false, hint: "URL pública de imagem adicional." },
] as const;

export const BULK_CSV_EXAMPLE_ROW = [
  "Cadeira de rodas manual", "Cadeira de rodas dobrável, em bom estado, rodas infláveis.",
  "doacao", "mobilidade", "bom", "adulto", "Lisboa", "1000", "", "", "sim",
  "https://exemplo.pt/fotos/cadeira1.jpg", "https://exemplo.pt/fotos/cadeira2.jpg", "", "", "",
];

export function buildTemplateCSV(): string {
  const header = BULK_CSV_COLUMNS.map((c) => c.label).join(",");
  const example = BULK_CSV_EXAMPLE_ROW.map((v) => (v.includes(",") ? `"${v}"` : v)).join(",");
  return `${header}\n${example}\n`;
}
