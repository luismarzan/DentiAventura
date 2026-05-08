/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Apple, 
  Droplet, 
  Zap, 
  CheckCircle2, 
  RotateCcw,
  Trophy,
  Star,
  ArrowUp
} from 'lucide-react';

// --- Types ---
type Mission = {
  id: string;
  name: string;
  icon: any;
  message: string;
  color: string;
};

type Card = {
  id: number;
  type: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const MISSIONS: Mission[] = [
  { 
    id: 'brush', 
    name: '¡Escuadrón Cepillo!', 
    icon: Sparkles, 
    message: '¡Genial! Tus dientes brillan como diamantes.',
    color: 'bg-brand-blue'
  },
  { 
    id: 'food', 
    name: 'Escudo de Vitaminas', 
    icon: Apple, 
    message: '¡Poder frutal activado! Tu cuerpo es más fuerte.',
    color: 'bg-orange-500'
  },
  { 
    id: 'water', 
    name: 'Poción de Vida', 
    icon: Droplet, 
    message: '¡Hidratación máxima! Tienes mucha energía.',
    color: 'bg-cyan-400'
  },
  { 
    id: 'active', 
    name: 'Energía Héroe', 
    icon: Zap, 
    message: '¡Eres invencible! Corazón de superhéroe.',
    color: 'bg-brand-purple'
  },
];

const MEMORY_ITEMS = [
  { type: 'brush', icon: '🪥' },
  { type: 'paste', icon: '🧴' },
  { type: 'apple', icon: '🍎' },
  { type: 'body', icon: '💪' },
];

export default function App() {
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('denti_points');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [dailyPoints, setDailyPoints] = useState<number>(() => {
    const saved = localStorage.getItem('denti_daily_points');
    const savedDate = localStorage.getItem('denti_last_date');
    
    // Get current date in Venezuela (UTC-4)
    const venezuelaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    if (savedDate !== venezuelaDate) {
      return 0; // Reset for new day in VET
    }
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('denti_name') || '';
  });

  const [nameSet, setNameSet] = useState<boolean>(() => {
    return localStorage.getItem('denti_name_set') === 'true';
  });

  const [message, setMessage] = useState<string | null>(null);
  const [showMemory, setShowMemory] = useState(false);
  const [showDailyFullPopup, setShowDailyFullPopup] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isCelebration, setIsCelebration] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('denti_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('denti_daily_points', dailyPoints.toString());
    const venezuelaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    localStorage.setItem('denti_last_date', venezuelaDate);
  }, [dailyPoints]);

  useEffect(() => {
    localStorage.setItem('denti_name', name);
    if (name.trim().length > 0 && !nameSet) {
      setNameSet(true);
      localStorage.setItem('denti_name_set', 'true');
    }
  }, [name, nameSet]);

  // --- Actions ---
  const handleMission = (mission: Mission) => {
    if (dailyPoints >= 50) {
      setShowDailyFullPopup(true);
      return;
    }
    setPoints(prev => prev + 10);
    setDailyPoints(prev => prev + 10);
    setMessage(mission.message);
    setTimeout(() => setMessage(null), 3000);
    if (dailyPoints + 10 === 50) {
      setIsCelebration(true);
    }
  };

  const resetGame = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- Memory Game Logic ---
  const setupMemory = useCallback(() => {
    const newCards: Card[] = [...MEMORY_ITEMS, ...MEMORY_ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        type: item.type,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(newCards);
    setFlippedCards([]);
    setShowMemory(true);
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        // Check win
        if (newCards.every(c => c.isMatched)) {
          setTimeout(() => {
            setMessage("¡Ganaste el juego mental! +5 puntos");
            setPoints(p => p + 5);
            setShowMemory(false);
          }, 500);
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const HAPPY_IMAGE = "https://lh3.googleusercontent.com/d/1M9IxKiaSRJPd8cjHUkzbHbP872gU_bsv";
  const SAD_IMAGE = "https://lh3.googleusercontent.com/d/1_sSD5wdhFpQEnDNw9RgVGQAYufWm4Kmn";

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-blue/10 -z-10 rounded-b-[4rem]" />
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white/80 backdrop-blur shadow-sm sticky top-0 z-20">
        <div className="relative">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold text-slate-800 bg-transparent border-none focus:ring-2 focus:ring-brand-blue/20 rounded-lg p-0 w-full"
            placeholder="Escribe tu nombre"
          />
          <p className="text-sm text-slate-500 font-medium italic">¡Bienvenido a DentiAventura!</p>
          
          {/* Name Reminder Arrow */}
          <AnimatePresence>
            {!nameSet && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-16 left-0 flex flex-col items-start gap-1 z-30"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-brand-purple"
                >
                  <ArrowUp size={32} strokeWidth={3} />
                </motion.div>
                <div className="bg-brand-purple text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">
                  Escribe tu nombre aquí
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-slate-400 mb-1">
            <Trophy size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Puntos de Vida</span>
          </div>
          <span className="text-4xl font-black text-brand-purple">{points}</span>
        </div>
      </header>

      <main className="px-6 py-4 space-y-8">
        {/* Character Display */}
        <section className="flex flex-col items-center justify-center py-8 relative">
          <motion.div 
            animate={dailyPoints >= 50 ? { 
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            } : { 
              y: [0, -5, 0],
            }}
            transition={{ repeat: Infinity, duration: dailyPoints >= 50 ? 1 : 4 }}
            className="relative"
          >
            {/* Tooth Character Image */}
            <div className="w-64 h-64 flex items-center justify-center relative">
               <motion.div 
                 key={dailyPoints >= 50 ? 'happy' : 'sad'}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative w-full h-full flex items-center justify-center"
               >
                 <img 
                   src={dailyPoints >= 50 ? HAPPY_IMAGE : SAD_IMAGE} 
                   alt="Dientín"
                   className={`
                     w-full h-full object-contain drop-shadow-2xl
                     ${dailyPoints >= 50 ? 'filter drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]' : ''}
                   `}
                   referrerPolicy="no-referrer"
                 />
               </motion.div>
            </div>

            {/* Status Label */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
              <span className={`
                px-8 py-3 rounded-full text-white font-black text-lg shadow-xl whitespace-nowrap border-4 border-white
                ${dailyPoints >= 50 ? 'bg-brand-purple' : 'bg-slate-400'}
              `}>
                {dailyPoints === 0 ? 'Estado: Triste 😢' : dailyPoints < 50 ? 'Estado: ¡Esforzándose! 💪' : 'Estado: ¡Super Diente! 🏆'}
              </span>
            </div>
          </motion.div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 text-center"
              >
                <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-brand-blue/20 inline-block">
                  <p className="text-brand-blue font-bold">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Missions Grid */}
        <section className="grid grid-cols-1 gap-4">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Misiones de Hoy</h2>
          <div className="grid grid-cols-2 gap-4">
            {MISSIONS.map((mission) => (
              <button
                key={mission.id}
                onClick={() => handleMission(mission)}
                className={`
                  game-card p-6 flex flex-col items-center gap-3 text-white
                  ${mission.color}
                `}
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  <mission.icon size={32} />
                </div>
                <span className="text-sm font-black text-center">{mission.name}</span>
                <div className="text-[10px] font-bold uppercase py-1 px-3 bg-white/20 rounded-full">
                  +10 PUNTOS
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Mini Game Section */}
        <section className="pt-4">
          <button
            onClick={setupMemory}
            className="w-full py-4 bg-white border-2 border-slate-200 rounded-3xl flex items-center justify-center gap-2 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw size={20} />
            Entrena tu mente (Mini-Juego)
          </button>
        </section>

        {/* Reset */}
        <section className="flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <button onClick={() => setShowResetConfirm(true)} className="text-xs font-bold text-slate-400">Reiniciar aventura</button>
        </section>
      </main>

      {/* Memory Game Modal */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6"
            >
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Memory Match</h3>
                <p className="text-slate-500 text-sm">Encuentra las parejas saludables</p>
              </div>

              <div className="memory-grid">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-square rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300
                      ${card.isFlipped || card.isMatched ? 'bg-brand-blue text-white rotate-y-180' : 'bg-slate-100 text-transparent'}
                    `}
                  >
                    {(card.isFlipped || card.isMatched) ? MEMORY_ITEMS.find(i => i.type === card.type)?.icon : '?'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowMemory(false)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {isCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-purple/90 backdrop-blur p-6"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center text-white space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <Star className="text-yellow-400 fill-yellow-400 absolute -top-4 -left-4 animate-bounce" size={32} />
                  <Star className="text-yellow-400 fill-yellow-400 absolute -top-4 -right-4 animate-bounce delay-100" size={32} />
                  <Trophy size={120} className="text-yellow-400 drop-shadow-lg" />
                </div>
              </div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                ¡ERES UN<br />SÚPER DIENTE!
              </h2>
              <p className="text-lg opacity-90 font-medium">
                ¡Has completado tus misiones de hoy y ahora eres un héroe de la salud!
              </p>
              <button
                onClick={() => setIsCelebration(false)}
                className="px-12 py-4 bg-white text-brand-purple rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                ¡GENIAL!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Goal Reached Popup */}
      <AnimatePresence>
        {showDailyFullPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-brand-blue" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¡Misión Cumplida!</h3>
                <p className="text-slate-500 font-medium">
                  Ya has ganado tus 50 puntos de hoy. Tu mascota está muy feliz y necesita descansar.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Regresa mañana</p>
              </div>
              <button
                onClick={() => setShowDailyFullPopup(false)}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-lg shadow-lg"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <RotateCcw size={40} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Empezar de cero?</h3>
                <p className="text-slate-500 font-medium">
                  Se borrarán todos tus puntos y tu nombre. ¡Tendrás que empezar la aventura desde el principio!
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={resetGame}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform"
                >
                  SÍ, REINICIAR TODO
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold"
                >
                  NO, VOLVER ATRÁS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
