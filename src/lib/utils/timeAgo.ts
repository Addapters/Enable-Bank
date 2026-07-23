/** "há 5 min" / "há 3h" / "há 2 dias" / data por extenso para além de 30 dias. */
export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  return new Date(dateStr).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}
