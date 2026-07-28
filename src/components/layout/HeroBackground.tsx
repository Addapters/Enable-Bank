const NODES: {
  left: number;
  top: number;
  size: number;
  anim: "eb-bob-a" | "eb-bob-b";
  duration: number;
  delay: number;
  icon: string;
  alt: string;
  halo?: boolean;
}[] = [
  // Lado esquerdo (4 ícones)
  { left: 7.5, top: 20.833, size: 64, anim: "eb-bob-a", duration: 9, delay: 0, icon: "mobilidade", alt: "Mobilidade", halo: true },
  { left: 17.083, top: 65.278, size: 58, anim: "eb-bob-b", duration: 11, delay: 1, icon: "comunicacao", alt: "Comunicação" },
  { left: 27.5, top: 15.278, size: 60, anim: "eb-bob-b", duration: 10, delay: 2, icon: "banho-higiene", alt: "Banho e Higiene" },
  { left: 32.917, top: 83.333, size: 62, anim: "eb-bob-a", duration: 12, delay: 3, icon: "cama-descanso", alt: "Cama e Descanso" },
  // Lado direito (4 ícones)
  { left: 73.333, top: 83.333, size: 58, anim: "eb-bob-a", duration: 11.5, delay: 5, icon: "casa-ambiente", alt: "Casa e Ambiente" },
  { left: 81.25, top: 26.389, size: 64, anim: "eb-bob-b", duration: 10, delay: 6.5, icon: "lazer-desporto", alt: "Lazer e Desporto", halo: true },
  { left: 92.083, top: 59.722, size: 60, anim: "eb-bob-b", duration: 12.5, delay: 3.5, icon: "reabilitacao", alt: "Reabilitação" },
  { left: 95.833, top: 16.667, size: 56, anim: "eb-bob-a", duration: 13, delay: 7, icon: "outros", alt: "Outros" },
];

const DOTS: { left: number; top: number; size: number; color: string; duration: number; delay: number }[] = [
  { left: 12.5, top: 45.833, size: 12, color: "rgba(255,255,255,.8)", duration: 7, delay: 0 },
  { left: 22.917, top: 41.667, size: 10, color: "rgba(230,244,230,.85)", duration: 8.5, delay: 1 },
  { left: 37.917, top: 62.5, size: 11, color: "rgba(255,255,255,.7)", duration: 9, delay: 3 },
  { left: 42.083, top: 30.556, size: 11, color: "rgba(255,255,255,.75)", duration: 10.5, delay: 1.5 },
  { left: 46.667, top: 12.5, size: 12, color: "rgba(253,244,217,.85)", duration: 7.5, delay: 2 },
  { left: 51.25, top: 88.889, size: 10, color: "rgba(230,244,230,.8)", duration: 9, delay: 2.5 },
  { left: 58.333, top: 16.667, size: 10, color: "rgba(255,255,255,.7)", duration: 8, delay: 4 },
  { left: 63.333, top: 59.722, size: 11, color: "rgba(252,234,227,.8)", duration: 11, delay: 3 },
  { left: 69.167, top: 38.889, size: 12, color: "rgba(255,255,255,.75)", duration: 8, delay: 4 },
  { left: 86.667, top: 88.889, size: 11, color: "rgba(252,234,227,.85)", duration: 9.5, delay: 5 },
  { left: 98.75, top: 38.889, size: 10, color: "rgba(255,255,255,.65)", duration: 6.5, delay: 6 },
];

const BLOBS: { style: React.CSSProperties; duration: number; delay: number }[] = [
  { style: { left: "-8%", top: "-48%", width: "50%", paddingBottom: "50%", background: "radial-gradient(circle, rgba(227,242,251,.46), rgba(227,242,251,0) 66%)" }, duration: 17, delay: 0 },
  { style: { right: "-10%", bottom: "-52%", width: "54%", paddingBottom: "54%", background: "radial-gradient(circle, rgba(230,244,230,.44), rgba(230,244,230,0) 64%)" }, duration: 21, delay: 5 },
  { style: { left: "28%", bottom: "-42%", width: "38%", paddingBottom: "38%", background: "radial-gradient(circle, rgba(252,234,227,.36), rgba(252,234,227,0) 66%)" }, duration: 19, delay: 9 },
  { style: { right: "22%", top: "-40%", width: "34%", paddingBottom: "34%", background: "radial-gradient(circle, rgba(253,244,217,.34), rgba(253,244,217,0) 66%)" }, duration: 23, delay: 2 },
  { style: { left: "38%", top: "-44%", width: "30%", paddingBottom: "30%", background: "radial-gradient(circle, rgba(236,234,251,.40), rgba(236,234,251,0) 68%)" }, duration: 25, delay: 12 },
];

export default function HeroBackground() {
  return (
    <>
      <div className="eb-bg" aria-hidden="true">
        {BLOBS.map((b, i) => (
          <div key={i} style={{ ...b.style, animation: `eb-breathe ${b.duration}s ease-in-out infinite ${b.delay}s` }} />
        ))}
      </div>

      <svg className="eb-svg" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
        <g className="eb-g1">
          <line x1="90" y1="75" x2="150" y2="165" />
          <line x1="150" y1="165" x2="205" y2="235" />
          <line x1="90" y1="75" x2="330" y2="55" />
          <line x1="205" y1="235" x2="395" y2="300" />
          <line x1="330" y1="55" x2="505" y2="110" />
          <line x1="395" y1="300" x2="615" y2="320" />
          <line x1="505" y1="110" x2="560" y2="45" />
          <line x1="560" y1="45" x2="700" y2="60" />
          <line x1="505" y1="110" x2="760" y2="215" />
          <line x1="760" y1="215" x2="615" y2="320" />
          <line x1="615" y1="320" x2="880" y2="300" />
          <line x1="700" y1="60" x2="760" y2="215" />
        </g>
        <g className="eb-g2">
          <line x1="150" y1="165" x2="275" y2="150" />
          <line x1="275" y1="150" x2="330" y2="55" />
          <line x1="275" y1="150" x2="455" y2="225" />
          <line x1="455" y1="225" x2="395" y2="300" />
          <line x1="455" y1="225" x2="505" y2="110" />
          <line x1="700" y1="60" x2="975" y2="95" />
          <line x1="760" y1="215" x2="830" y2="140" />
          <line x1="830" y1="140" x2="975" y2="95" />
          <line x1="880" y1="300" x2="1040" y2="320" />
          <line x1="1040" y1="320" x2="1105" y2="215" />
          <line x1="880" y1="300" x2="1105" y2="215" />
          <line x1="975" y1="95" x2="1105" y2="215" />
          <line x1="975" y1="95" x2="1150" y2="60" />
          <line x1="1105" y1="215" x2="1185" y2="140" />
          <line x1="1150" y1="60" x2="1185" y2="140" />
        </g>
      </svg>

      <div className="eb-layer" aria-hidden="true">
        {NODES.map((n, i) => (
          <div key={i} className="eb-n" style={{ left: `${n.left}%`, top: `${n.top}%` }}>
            <div
              className="eb-c"
              style={{
                width: n.size,
                height: n.size,
                margin: -n.size / 2,
                animation: `${n.anim} ${n.duration}s ease-in-out infinite ${n.delay}s`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/category-icons/${n.icon}.png`} alt="" />
            </div>
            {n.halo && (
              <div
                className="eb-h"
                style={{
                  width: n.size,
                  height: n.size,
                  margin: -n.size / 2,
                  animation: `eb-halo ${n.duration}s ease-out infinite ${n.delay}s`,
                }}
              />
            )}
          </div>
        ))}

        {DOTS.map((d, i) => (
          <div key={i} className="eb-n" style={{ left: `${d.left}%`, top: `${d.top}%` }}>
            <div
              className="eb-d"
              style={{
                width: d.size,
                height: d.size,
                margin: -d.size / 2,
                background: d.color,
                animation: `eb-tw ${d.duration}s ease-in-out infinite ${d.delay}s`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="eb-vig" />
    </>
  );
}
