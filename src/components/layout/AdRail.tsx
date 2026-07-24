/**
 * Espaço reservado para publicidade nas margens laterais, em ecrãs suficientemente largos
 * para não colidir com o conteúdo principal (max-w-7xl + margem de segurança).
 * Puramente reservado — sem serviço de anúncios real ligado ainda.
 */
function AdSlot({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`hidden min-[1650px]:flex fixed top-28 ${side === "left" ? "left-4" : "right-4"} z-10 w-40 h-[600px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-300`}
      aria-hidden="true"
    >
      <span className="text-xs font-medium">Espaço publicitário</span>
      <span className="text-[10px]">160 × 600</span>
    </div>
  );
}

export default function AdRail() {
  return (
    <>
      <AdSlot side="left" />
      <AdSlot side="right" />
    </>
  );
}
