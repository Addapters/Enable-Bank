import type { RankedItem } from "@/lib/admin/stats";

interface Props {
  items: RankedItem[];
  emptyLabel: string;
  barColorClassName?: string;
}

/** Lista horizontal simples de barras — para rankings (concelhos, pesquisas). Um único eixo, uma única cor sequencial. */
export default function StatBarList({ items, emptyLabel, barColorClassName = "bg-purple-600" }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.count));

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 sm:w-36 shrink-0 truncate text-gray-700" title={item.label}>{item.label}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColorClassName}`}
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-semibold text-gray-900 tabular-nums">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
