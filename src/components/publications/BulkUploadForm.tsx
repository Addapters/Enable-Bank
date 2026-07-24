"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload, CheckCircle2, XCircle, Loader2, FileSpreadsheet } from "lucide-react";
import { parseCSV, csvToObjects } from "@/lib/publications/csvParser";
import { BULK_CSV_COLUMNS, buildTemplateCSV } from "@/lib/publications/bulkGuidelines";
import { createPublicationsBulk, type BulkRowResult } from "@/lib/publications/bulkActions";

interface Category { slug: string; nome: string; parent_id: string | null }

interface Props {
  categories: Category[];
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadForm({ categories }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkRowResult[] | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setResults(null);
    setParseError(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = csvToObjects(parseCSV(text));
      if (parsed.length === 0) { setParseError("O ficheiro não tem linhas de dados."); setRows([]); return; }
      setRows(parsed);
    } catch {
      setParseError("Não foi possível ler o ficheiro. Confirma que é um CSV válido.");
      setRows([]);
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createPublicationsBulk(rows);
      setResults(result);
    });
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Guidelines */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Formato do ficheiro CSV</h2>
        <p className="text-sm text-gray-500">
          Cada linha do ficheiro cria um anúncio. As fotos têm de estar já hospedadas online
          (ex: no teu site, Google Drive público, etc.) — indica os URLs públicos nas colunas
          foto_url. Os contactos usados serão os que já tens configurados no teu perfil.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-medium">Coluna</th>
                <th className="py-2 pr-4 font-medium">Obrigatório</th>
                <th className="py-2 font-medium">Formato</th>
              </tr>
            </thead>
            <tbody>
              {BULK_CSV_COLUMNS.map((c) => (
                <tr key={c.key} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs text-purple-700">{c.label}</td>
                  <td className="py-2 pr-4 text-gray-500">{c.required ? "Sim" : "Não"}</td>
                  <td className="py-2 text-gray-600">{c.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-purple-700 font-medium">Ver slugs de categorias disponíveis</summary>
          <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-gray-600">
            {categories.map((c) => (
              <li key={c.slug} className="font-mono">
                {c.nome} → <span className="text-purple-700">{c.slug}</span>
              </li>
            ))}
          </ul>
        </details>

        <button
          type="button"
          onClick={() => downloadTextFile("modelo-anuncios.csv", buildTemplateCSV())}
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:underline"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Descarregar modelo CSV
        </button>
      </section>

      {/* Upload */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Carregar ficheiro</h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-colors px-6 py-10 cursor-pointer text-center"
        >
          <FileSpreadsheet className="w-8 h-8 text-purple-400" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-700">
            {fileName ?? "Clica para escolher o ficheiro CSV"}
          </p>
          {rows.length > 0 && <p className="text-xs text-gray-500">{rows.length} anúncio(s) detetado(s)</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {parseError && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />{parseError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={rows.length === 0 || pending}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
          {pending ? "A publicar..." : `Publicar ${rows.length || ""} anúncio(s)`}
        </button>
      </section>

      {/* Resultados */}
      {results && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">
            Resultado — {successCount} de {results.length} publicados com sucesso
          </h2>
          <ul className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-2 py-2 text-sm">
                {r.success
                  ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                  : <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />}
                <span className="text-gray-500 shrink-0">Linha {r.row}:</span>
                <span className="text-gray-900 font-medium truncate">{r.titulo || "(sem título)"}</span>
                {r.error && <span className="text-red-600">— {r.error}</span>}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">
            Os anúncios publicados com sucesso ficam pendentes até serem revistos pela equipa Enable Bank.
          </p>
        </section>
      )}
    </div>
  );
}
