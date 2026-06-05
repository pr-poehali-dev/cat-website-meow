import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "home" | "games" | "profile" | "leaderboard" | "about";
type CatColor = "orange" | "gray" | "white" | "black" | "pink";
type CatAccessory = "none" | "crown" | "glasses" | "bow" | "hat";
type MeowSound = "classic" | "squeak" | "deep" | "cute";

interface Player {
  rank: number;
  name: string;
  score: number;
  level: number;
  badge: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<CatColor, { bg: string; body: string; label: string }> = {
  orange: { bg: "from-orange-400 to-orange-600",  body: "#f97316", label: "Рыжий"   },
  gray:   { bg: "from-gray-400 to-gray-600",      body: "#9ca3af", label: "Серый"   },
  white:  { bg: "from-white to-gray-200",         body: "#f3f4f6", label: "Белый"   },
  black:  { bg: "from-gray-800 to-gray-950",      body: "#374151", label: "Чёрный"  },
  pink:   { bg: "from-pink-300 to-pink-500",      body: "#ec4899", label: "Розовый" },
};

const CAT_ACCESSORIES: Record<CatAccessory, { emoji: string; label: string }> = {
  none:    { emoji: "",   label: "Без аксессуара" },
  crown:   { emoji: "👑", label: "Корона"         },
  glasses: { emoji: "🕶️", label: "Очки"           },
  bow:     { emoji: "🎀", label: "Бантик"          },
  hat:     { emoji: "🎩", label: "Цилиндр"         },
};

const MEOW_SOUNDS: Record<MeowSound, { label: string; pitch: number; duration: number }> = {
  classic: { label: "Классический", pitch: 800,  duration: 0.4 },
  squeak:  { label: "Писклявый",    pitch: 1400, duration: 0.3 },
  deep:    { label: "Низкий",       pitch: 400,  duration: 0.6 },
  cute:    { label: "Милый",        pitch: 1100, duration: 0.5 },
};

const GAMES = [
  { id: 1, title: "Кото-Прыжок",    emoji: "🐱", desc: "Прыгай по платформам и собирай рыбок",  color: "#ff44cc", score: "1 240",  players: "843"   },
  { id: 2, title: "Пазл-Котёнок",   emoji: "🧩", desc: "Собери картинку с котиком за 60 сек",   color: "#00ffee", score: "980",    players: "512"   },
  { id: 3, title: "Кото-Гонки",     emoji: "🏎️", desc: "Гонки на котах по неоновым трассам",    color: "#ffdd00", score: "2 100", players: "1 204" },
  { id: 4, title: "Клубок Хаоса",   emoji: "🧶", desc: "Разматывай клубок быстрее всех",        color: "#44ff88", score: "750",    players: "328"   },
  { id: 5, title: "Рыбный Магазин", emoji: "🐟", desc: "Управляй рыбным магазином для котов",   color: "#aa44ff", score: "3 400", players: "2 091" },
  { id: 6, title: "Кото-Бой",       emoji: "⚔️", desc: "Сражайся с другими котиками онлайн",    color: "#ff44cc", score: "5 600", players: "4 320" },
];

const LEADERBOARD: Player[] = [
  { rank: 1, name: "МурМастер",    score: 98420, level: 42, badge: "👑" },
  { rank: 2, name: "КисаПро",      score: 87310, level: 38, badge: "🥈" },
  { rank: 3, name: "ПушокFire",    score: 76540, level: 35, badge: "🥉" },
  { rank: 4, name: "КотоГеймер",   score: 65200, level: 31, badge: "⚡" },
  { rank: 5, name: "МяуЧемпион",   score: 58900, level: 29, badge: "🔥" },
  { rank: 6, name: "РыжийКод",     score: 47800, level: 26, badge: "💎" },
  { rank: 7, name: "КотикTurbo",   score: 39200, level: 23, badge: "🌟" },
  { rank: 8, name: "МурчалкаПлюс", score: 31500, level: 20, badge: "🎮" },
];

const MEOW_TIPS = [
  "Мяу! Добро пожаловать в КотоАркаду! 🐾",
  "Псссс... Попробуй Кото-Бой — там жарко! 🔥",
  "Мур-мур! Твой рейтинг ждёт тебя! ⭐",
  "Мяу-мяу! Настрой меня в разделе Профиль! 🎨",
  "Шшш... В Клубке Хаоса новый рекорд! 🏆",
];

// ─── Meow Audio ───────────────────────────────────────────────────────────────
function playMeow(sound: MeowSound) {
  try {
    const AudioCtxClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const { pitch, duration } = MEOW_SOUNDS[sound];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch * 0.6, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch, ctx.currentTime + duration * 0.3);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.8, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_e) { /* audio unavailable */ }
}

// ─── Cat SVG ──────────────────────────────────────────────────────────────────
function CatSVG({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="15,35 25,10 35,35" fill={color} />
      <polygon points="65,35 75,10 85,35" fill={color} />
      <polygon points="18,33 25,15 32,33" fill="#ffb3ba" opacity="0.6" />
      <polygon points="68,33 75,15 82,33" fill="#ffb3ba" opacity="0.6" />
      <ellipse cx="50" cy="65" rx="32" ry="28" fill={color} />
      <circle cx="50" cy="42" r="28" fill={color} />
      <ellipse cx="38" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="62" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="39" cy="41" rx="3.5" ry="4" fill="#1a0a2e" />
      <ellipse cx="63" cy="41" rx="3.5" ry="4" fill="#1a0a2e" />
      <circle cx="40" cy="40" r="1.2" fill="white" />
      <circle cx="64" cy="40" r="1.2" fill="white" />
      <ellipse cx="50" cy="50" rx="3" ry="2" fill="#ffb3ba" />
      <path d="M47 52 Q50 55 53 52" stroke="#c084a0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="20" y1="48" x2="44" y2="50" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="20" y1="52" x2="44" y2="52" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="56" y1="50" x2="80" y2="48" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="56" y1="52" x2="80" y2="52" stroke="white" strokeWidth="1" opacity="0.7" />
      <ellipse cx="24" cy="88" rx="10" ry="7" fill={color} />
      <ellipse cx="76" cy="88" rx="10" ry="7" fill={color} />
      <path
        d="M82 75 Q100 60 95 45 Q90 35 82 42"
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        style={{ transformOrigin: "82px 75px", animation: "tail-wag 0.5s ease-in-out infinite" }}
      />
      <ellipse cx="50" cy="68" rx="18" ry="14" fill="white" opacity="0.12" />
    </svg>
  );
}

// ─── Intro Overlay ────────────────────────────────────────────────────────────
function IntroOverlay({ onDone, catColor, meowSound }: {
  onDone: () => void;
  catColor: CatColor;
  meowSound: MeowSound;
}) {
  const [phase, setPhase] = useState<"cat" | "speech" | "out">("cat");

  useEffect(() => {
    playMeow(meowSound);
    const t1 = setTimeout(() => setPhase("speech"), 700);
    const t2 = setTimeout(() => setPhase("out"), 2800);
    const t3 = setTimeout(onDone, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [meowSound, onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center grid-bg"
      style={{
        background: "hsl(240 20% 6%)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Glow rings */}
      {[200, 310, 430].map((s, i) => (
        <div key={i} className="absolute rounded-full border border-neon-pink/20 pointer-events-none"
          style={{ width: s, height: s }} />
      ))}

      <div className="flex flex-col items-center gap-8 relative z-10">
        <div style={{ animation: "intro-cat 0.8s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <CatSVG color={CAT_COLORS[catColor].body} size={180} />
        </div>

        {phase === "speech" && (
          <div
            className="bg-card rounded-2xl px-8 py-4 text-center relative neon-border"
            style={{ animation: "speech-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <p className="font-pixel text-neon-pink text-sm tracking-widest">МЯУ!</p>
            <p className="text-foreground/80 text-sm mt-2">Добро пожаловать в КотоАркаду!</p>
          </div>
        )}

        <p className="font-pixel text-xs text-neon-cyan/60 tracking-widest">
          ЗАГРУЗКА...
        </p>
      </div>

      {["⭐","✨","🌟","💫","⚡"].map((s, i) => (
        <span key={i} className="absolute pointer-events-none text-2xl"
          style={{
            left: `${15 + i * 17}%`,
            top: `${12 + (i % 2) * 65}%`,
            animation: `star-pop 0.5s ${0.2 + i * 0.1}s ease-out both`,
          }}>{s}</span>
      ))}
    </div>
  );
}

// ─── Cat Helper ───────────────────────────────────────────────────────────────
function CatHelper({ catColor, catAccessory, meowSound, tipIndex }: {
  catColor: CatColor;
  catAccessory: CatAccessory;
  meowSound: MeowSound;
  tipIndex: number;
}) {
  const [showTip, setShowTip] = useState(false);
  const [bounce, setBounce] = useState(false);

  const handleClick = () => {
    playMeow(meowSound);
    setBounce(true);
    setShowTip(true);
    setTimeout(() => setBounce(false), 700);
    setTimeout(() => setShowTip(false), 3500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {showTip && (
        <div
          className="bg-card neon-border rounded-2xl rounded-br-none px-4 py-3 max-w-[200px] text-right"
          style={{ animation: "speech-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          <p className="text-sm text-foreground/90 leading-relaxed">
            {MEOW_TIPS[tipIndex % MEOW_TIPS.length]}
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{ animation: bounce ? "meow-bounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both" : "float 4s ease-in-out infinite" }}
      >
        {CAT_ACCESSORIES[catAccessory].emoji && (
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl z-10">
            {CAT_ACCESSORIES[catAccessory].emoji}
          </span>
        )}
        <CatSVG color={CAT_COLORS[catColor].body} size={80} />
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-pink flex items-center justify-center text-xs"
          style={{ animation: "glow-pulse 2s ease-in-out infinite" }}
        >🐾</div>
      </button>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Section; label: string; emoji: string }[] = [
  { id: "home",        label: "Главная", emoji: "🏠" },
  { id: "games",       label: "Игры",    emoji: "🎮" },
  { id: "leaderboard", label: "Лидеры",  emoji: "🏆" },
  { id: "profile",     label: "Профиль", emoji: "😸" },
  { id: "about",       label: "О сайте", emoji: "ℹ️"  },
];

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,68,204,0.1) 0%, transparent 65%)" }} />

      <div className="text-center max-w-2xl relative z-10" style={{ animation: "slide-up-fade 0.6s ease-out both" }}>
        <div className="font-pixel text-xs text-neon-cyan tracking-[0.3em] mb-5 opacity-80">
          ★ ИГРОВОЙ ПОРТАЛ ★
        </div>

        <h1 className="font-pixel text-5xl md:text-7xl mb-5 leading-[1.2]">
          <span className="neon-text-pink">КОТО</span>
          <span className="neon-text-cyan">АРКАДА</span>
        </h1>

        <p className="text-foreground/60 text-lg leading-relaxed mb-10">
          Развлекательный портал с играми, рейтингами<br />и твоим котиком-помощником
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <button
            onClick={() => onNavigate("games")}
            className="font-pixel text-xs px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: "var(--neon-pink)", color: "hsl(240 20% 6%)", boxShadow: "0 0 20px #ff44cc80" }}
          >
            🎮 ИГРАТЬ
          </button>
          <button
            onClick={() => onNavigate("leaderboard")}
            className="font-pixel text-xs px-8 py-4 rounded-xl neon-border-cyan text-neon-cyan transition-all hover:scale-105 hover:bg-neon-cyan/5"
          >
            🏆 РЕЙТИНГ
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { val: "6",    label: "Игр",          c: "#ff44cc" },
            { val: "8K+",  label: "Игроков",      c: "#00ffee" },
            { val: "99K+", label: "Рекорд очков", c: "#ffdd00" },
          ].map(({ val, label, c }) => (
            <div key={label} className="bg-card rounded-2xl p-4 neon-border text-center">
              <div className="font-pixel text-base" style={{ color: c }}>{val}</div>
              <div className="text-foreground/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {["✦","◆","▲","●","★","✦"].map((s, i) => (
        <span key={i} className="absolute font-pixel text-neon-pink/15 pointer-events-none select-none"
          style={{
            left: `${6 + i * 16}%`, top: `${18 + (i % 3) * 22}%`,
            fontSize: `${10 + i * 4}px`,
            animation: `float ${3 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
          }}>{s}</span>
      ))}
    </div>
  );
}

// ─── Games ────────────────────────────────────────────────────────────────────
function GamesSection() {
  return (
    <div className="min-h-screen px-4 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-12" style={{ animation: "slide-up-fade 0.5s ease-out both" }}>
        <div className="font-pixel text-xs text-neon-cyan tracking-widest mb-3">🎮 КАТАЛОГ</div>
        <h2 className="font-pixel text-3xl neon-text-pink">ИГРЫ</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES.map((game, i) => (
          <div key={game.id}
            className="bg-card rounded-2xl p-6 border border-border hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
            style={{ animation: `slide-up-fade 0.4s ${i * 0.08}s ease-out both` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
              style={{ background: `radial-gradient(circle at 50% 0%, ${game.color}18, transparent 70%)` }} />

            <div className="text-5xl mb-4">{game.emoji}</div>
            <h3 className="font-pixel text-xs mb-2" style={{ color: game.color }}>{game.title}</h3>
            <p className="text-foreground/60 text-sm mb-4 leading-relaxed">{game.desc}</p>
            <div className="flex justify-between text-xs text-foreground/40 mb-4">
              <span>🏆 {game.score}</span>
              <span>👥 {game.players}</span>
            </div>
            <button
              className="w-full py-2.5 rounded-xl font-pixel text-xs transition-all hover:opacity-90 active:scale-95"
              style={{ background: game.color, color: "hsl(240 20% 6%)" }}
            >
              ИГРАТЬ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardSection() {
  const rankColors = ["#ffdd00", "#c0c0c0", "#cd7f32"];

  return (
    <div className="min-h-screen px-4 py-24 max-w-3xl mx-auto">
      <div className="text-center mb-12" style={{ animation: "slide-up-fade 0.5s ease-out both" }}>
        <div className="font-pixel text-xs text-neon-yellow tracking-widest mb-3">⭐ ТОП ИГРОКОВ</div>
        <h2 className="font-pixel text-3xl neon-text-yellow">ТАБЛИЦА ЛИДЕРОВ</h2>
      </div>

      <div className="space-y-3">
        {LEADERBOARD.map((player, i) => (
          <div key={player.rank}
            className="bg-card rounded-2xl px-6 py-4 flex items-center gap-4 border border-border hover:border-neon-yellow/40 transition-all group"
            style={{ animation: `slide-up-fade 0.4s ${i * 0.07}s ease-out both` }}
          >
            <div className="font-pixel text-lg w-8 text-center"
              style={{ color: rankColors[i] || "hsl(var(--muted-foreground))" }}>
              {i < 3 ? player.badge : `#${player.rank}`}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: i < 3 ? `${rankColors[i]}22` : "hsl(var(--muted))" }}>
              🐱
            </div>
            <div className="flex-1">
              <div className="font-rubik font-semibold text-foreground group-hover:text-neon-yellow transition-colors">
                {player.name}
              </div>
              <div className="text-xs text-foreground/40">Уровень {player.level}</div>
            </div>
            <div className="text-right">
              <div className="font-pixel text-sm" style={{ color: rankColors[i] || "#fff" }}>
                {player.score.toLocaleString("ru")}
              </div>
              <div className="text-xs text-foreground/40">очков</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card rounded-2xl p-6 text-center neon-border">
        <p className="text-foreground/50 text-sm">Твой результат появится здесь после первой игры!</p>
        <p className="font-pixel text-neon-pink text-xs mt-2">ИГРАЙ И ПОБЕЖДАЙ 🏆</p>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection({
  catColor, catAccessory, meowSound,
  onColorChange, onAccessoryChange, onMeowChange,
}: {
  catColor: CatColor; catAccessory: CatAccessory; meowSound: MeowSound;
  onColorChange: (c: CatColor) => void;
  onAccessoryChange: (a: CatAccessory) => void;
  onMeowChange: (m: MeowSound) => void;
}) {
  return (
    <div className="min-h-screen px-4 py-24 max-w-4xl mx-auto">
      <div className="text-center mb-12" style={{ animation: "slide-up-fade 0.5s ease-out both" }}>
        <div className="font-pixel text-xs text-neon-green tracking-widest mb-3">🎨 КАСТОМИЗАЦИЯ</div>
        <h2 className="font-pixel text-3xl neon-text-pink">МОЙ КОТИК</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex flex-col items-center gap-5" style={{ animation: "slide-up-fade 0.4s 0.1s ease-out both" }}>
          <div className="bg-card neon-border rounded-3xl p-12 relative w-full flex items-center justify-center">
            <div className="absolute top-3 left-4 font-pixel text-xs text-neon-cyan/50">PREVIEW</div>
            <div style={{ animation: "float 4s ease-in-out infinite" }} className="relative">
              {CAT_ACCESSORIES[catAccessory].emoji && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">
                  {CAT_ACCESSORIES[catAccessory].emoji}
                </span>
              )}
              <CatSVG color={CAT_COLORS[catColor].body} size={160} />
            </div>
          </div>

          <button
            onClick={() => playMeow(meowSound)}
            className="font-pixel text-xs px-6 py-3 rounded-xl neon-border text-neon-pink hover:bg-neon-pink/10 transition-all hover:scale-105 active:scale-95"
          >
            🔊 ТЕСТ МЯУКАНЬЯ
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-5" style={{ animation: "slide-up-fade 0.4s 0.2s ease-out both" }}>
          {/* Color */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-pixel text-xs text-neon-cyan mb-4">🎨 ЦВЕТ КОТИКА</h3>
            <div className="flex gap-3 flex-wrap">
              {(Object.entries(CAT_COLORS) as [CatColor, typeof CAT_COLORS[CatColor]][]).map(([key, val]) => (
                <button key={key}
                  onClick={() => onColorChange(key)}
                  title={val.label}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${val.bg} transition-all hover:scale-110 relative border-2 ${
                    catColor === key ? "border-white scale-110" : "border-transparent"
                  }`}
                >
                  {catColor === key && (
                    <span className="absolute inset-0 flex items-center justify-center text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accessory */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-pixel text-xs text-neon-yellow mb-4">👑 АКСЕССУАРЫ</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CAT_ACCESSORIES) as [CatAccessory, typeof CAT_ACCESSORIES[CatAccessory]][]).map(([key, val]) => (
                <button key={key}
                  onClick={() => onAccessoryChange(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border ${
                    catAccessory === key
                      ? "border-neon-yellow text-neon-yellow bg-neon-yellow/10"
                      : "border-border text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  <span>{val.emoji || "✖"}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-pixel text-xs text-neon-pink mb-4">🔊 ЗВУК МЯУКАНЬЯ</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(MEOW_SOUNDS) as [MeowSound, typeof MEOW_SOUNDS[MeowSound]][]).map(([key, val]) => (
                <button key={key}
                  onClick={() => { onMeowChange(key); playMeow(key); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border ${
                    meowSound === key
                      ? "border-neon-pink text-neon-pink bg-neon-pink/10"
                      : "border-border text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  🎵 {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const features = [
    { emoji: "🎮", title: "6 уникальных игр",      desc: "Гонки, пазлы, аркады и стратегии на любой вкус" },
    { emoji: "🏆", title: "Таблица лидеров",        desc: "Соревнуйся с другими и покоряй вершины рейтинга" },
    { emoji: "🐱", title: "Котик-помощник",         desc: "Персональный кот с кастомизацией и своим характером" },
    { emoji: "🎨", title: "Геймификация",           desc: "Уровни, очки, ачивки и уникальные награды" },
    { emoji: "⚡", title: "Быстрые сессии",        desc: "Игры на 2–10 минут — удобно в любое время" },
    { emoji: "🌟", title: "Обновления каждую неделю", desc: "Новые игры и события добавляются регулярно" },
  ];

  return (
    <div className="min-h-screen px-4 py-24 max-w-4xl mx-auto">
      <div className="text-center mb-12" style={{ animation: "slide-up-fade 0.5s ease-out both" }}>
        <div className="font-pixel text-xs text-neon-purple tracking-widest mb-3">💡 ИНФОРМАЦИЯ</div>
        <h2 className="font-pixel text-3xl neon-text-cyan">О САЙТЕ</h2>
      </div>

      <div className="bg-card neon-border rounded-3xl p-8 mb-8 text-center" style={{ animation: "slide-up-fade 0.4s 0.1s ease-out both" }}>
        <div className="font-pixel text-xl neon-text-pink mb-4">КотоАркада</div>
        <p className="text-foreground/70 leading-relaxed max-w-lg mx-auto">
          Развлекательная платформа для тех, кто любит котиков и хорошие игры.
          Здесь ты найдёшь уютный уголок с играми, рейтингами и своим персональным котиком!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div key={f.title}
            className="bg-card rounded-2xl p-5 border border-border hover:border-neon-purple/50 transition-all hover:scale-[1.02] group"
            style={{ animation: `slide-up-fade 0.4s ${0.1 + i * 0.07}s ease-out both` }}
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-neon-cyan transition-colors">{f.title}</h3>
            <p className="text-foreground/50 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card rounded-2xl p-6 text-center border border-border" style={{ animation: "slide-up-fade 0.4s 0.55s ease-out both" }}>
        <p className="font-pixel text-neon-cyan text-xs mb-2">ВЕРСИЯ 1.0</p>
        <p className="text-foreground/40 text-sm">Сделано с ❤️ и 🐱 для любителей котиков</p>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const [section, setSection] = useState<Section>("home");
  const [catColor, setCatColor] = useState<CatColor>("orange");
  const [catAccessory, setCatAccessory] = useState<CatAccessory>("none");
  const [meowSound, setMeowSound] = useState<MeowSound>("classic");
  const [tipIndex, setTipIndex] = useState(0);

  const navigate = (s: Section) => {
    setSection(s);
    setTipIndex(p => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative">
      {showIntro && (
        <IntroOverlay onDone={() => setShowIntro(false)} catColor={catColor} meowSound={meowSound} />
      )}

      {!showIntro && (
        <>
          {/* Nav */}
          <nav className="fixed top-0 inset-x-0 z-30 border-b border-border/50 backdrop-blur-md"
            style={{ background: "rgba(11,10,20,0.88)" }}>
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <button onClick={() => navigate("home")}
                className="font-pixel text-xs neon-text-pink hover:opacity-80 transition-opacity tracking-wider">
                🐾 КОТОАРКАДА
              </button>
              <div className="flex items-center gap-1">
                {NAV_ITEMS.map(item => (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-rubik font-medium transition-all ${
                      section === item.id
                        ? "text-background font-bold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                    style={section === item.id ? { background: "var(--neon-pink)" } : {}}
                  >
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden text-base">{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <main className="pt-14">
            {section === "home"        && <HomeSection onNavigate={navigate} />}
            {section === "games"       && <GamesSection />}
            {section === "leaderboard" && <LeaderboardSection />}
            {section === "profile"     && (
              <ProfileSection
                catColor={catColor} catAccessory={catAccessory} meowSound={meowSound}
                onColorChange={setCatColor} onAccessoryChange={setCatAccessory} onMeowChange={setMeowSound}
              />
            )}
            {section === "about"       && <AboutSection />}
          </main>

          <CatHelper catColor={catColor} catAccessory={catAccessory} meowSound={meowSound} tipIndex={tipIndex} />
        </>
      )}
    </div>
  );
}