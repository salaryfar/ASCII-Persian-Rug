
import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Download, 
  Sparkles, 
  Palette, 
  Layers, 
  Maximize, 
  Info,
  ChevronRight,
  ChevronLeft,
  Flower,
  Settings2,
  LayoutGrid,
  Check,
  RotateCcw,
  Sliders,
  Compass,
  ArrowRight,
  Grid3X3,
  Shuffle,
  Square
} from 'lucide-react';
import { PALETTES, RUG_STYLES, MOTIFS, PLACEMENT_MODES } from './constants';
import { RugConfig, RugCell, AIRugResponse } from './types';
import { generateRugTheme } from './services/geminiService';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [config, setConfig] = useState<RugConfig>({
    width: 80,
    height: 60,
    palette: PALETTES[0],
    complexity: 4,
    styleName: RUG_STYLES[0],
    hasMedallion: true,
    borderWidth: 2,
    selectedMotifIds: ['floral'],
    placementMode: 'random',
    customColors: {
      background: '#1a0505',
      primary: '#dc2626',
      secondary: '#10b981',
      accent: '#fbbf24',
      border: '#450a0a',
    },
    useCustomColors: false
  });

  const [aiResponse, setAiResponse] = useState<AIRugResponse | null>(null);
  const [rugGrid, setRugGrid] = useState<RugCell[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const generateRug = useCallback(async (isAiGen = false) => {
    setIsGenerating(true);
    
    let theme = aiResponse;
    if (isAiGen) {
      theme = await generateRugTheme(`${config.styleName} - highly detailed and unique`);
      setAiResponse(theme);
    }

    const chars = theme?.characters || {
      border: "█",
      innerBorder: "╬",
      field: "·",
      medallion: "❂",
      accent: "✧"
    };

    const activeMotifs = MOTIFS.filter(m => config.selectedMotifIds.includes(m.id));
    const fallbackMotif = MOTIFS[0];

    // Helper to get a motif based on position and mode
    const getMotifChar = (x: number, y: number, mode: 'uniform' | 'random' | 'tiled') => {
      if (activeMotifs.length === 0) return chars.accent;
      let motif = activeMotifs[0];
      
      if (mode === 'random') {
        // Pseudo-random based on coordinates for consistency
        const seed = (x * 123 + y * 456) % 1000;
        motif = activeMotifs[Math.floor((seed / 1000) * activeMotifs.length)];
      } else if (mode === 'tiled') {
        const tx = Math.floor(x / 10);
        const ty = Math.floor(y / 10);
        motif = activeMotifs[(tx + ty) % activeMotifs.length];
      }
      
      const charIndex = (x + y) % motif.chars.length;
      return motif.chars[charIndex];
    };

    const newGrid: RugCell[][] = [];
    const { width, height, palette, hasMedallion, placementMode, useCustomColors, customColors, styleName } = config;

    const getColor = (type: 'primary' | 'secondary' | 'accent' | 'border') => {
      if (useCustomColors) return customColors[type];
      return palette[type];
    };

    for (let y = 0; y < height; y++) {
      const row: RugCell[] = [];
      for (let x = 0; x < width; x++) {
        let cell: RugCell = { char: ' ', color: getColor('primary') };

        const dx = Math.min(x, width - 1 - x);
        const dy = Math.min(y, height - 1 - y);
        const depth = Math.min(dx, dy);
        const centerX = width / 2;
        const centerY = height / 2;
        const normDx = (x - centerX) / (width / 2);
        const normDy = (y - centerY) / (height / 2);
        const diamondDist = Math.abs(normDx) + Math.abs(normDy);
        const radialDist = Math.sqrt(normDx * normDx + normDy * normDy);

        // --- UNIQUE STYLE LOGIC ---
        if (styleName === "Berber Tribal (Nomadic)") {
          const isTopBottomBorder = y < 4 || y > height - 5;
          const isWiggleLeft = Math.abs(x - (6 + Math.sin(y * 0.2) * 2)) < 0.6;
          const isWiggleRight = Math.abs(x - (width - 7 + Math.cos(y * 0.25) * 1.5)) < 0.6;
          
          if (isTopBottomBorder) {
            const isPine = x % 6 === 0 && (y === 1 || y === height - 2);
            if (isPine) {
              cell = { char: '▲', color: getColor('accent') };
            } else if (y === 0 || y === height - 1) {
              cell = { char: '-', color: getColor('border') };
            }
          } else if (isWiggleLeft || isWiggleRight) {
            cell = { char: '≀', color: getColor('secondary') };
          } else {
            // Diamonds columns
            const colIdx = Math.floor(x / 15);
            const inColCenter = Math.abs(x % 15 - 7) < 3;
            if (inColCenter && (y % 12 < 6)) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('accent') };
            } else {
              cell = { char: ' ', color: getColor('primary') };
            }
          }
        } 
        else if (styleName === "Intricate Multi-Border") {
          // Focus on nested layers with different characters
          const borderChars = [chars.border, '╬', '▓', '░', '╫', '╪'];
          const borderColors = [getColor('border'), getColor('secondary'), getColor('primary'), getColor('accent')];
          
          if (depth < 24 && depth % 4 === 0) {
            cell = { char: borderChars[Math.floor(depth / 4) % borderChars.length], color: borderColors[Math.floor(depth / 4) % borderColors.length] };
          } else if (depth < 24 && depth % 4 === 1) {
            cell = { char: '·', color: getColor('primary') };
          } else {
            // Main field
            if (x % 5 === 0 && y % 5 === 0) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('accent') };
            } else {
              cell = { char: '·', color: getColor('primary') };
            }
          }
        }
        else if (styleName === "Sacred Geometry") {
          // Fractals and geometric math
          if (depth < 4) cell = { char: chars.border, color: getColor('border') };
          else {
            const circle = Math.abs(radialDist * 10 % 1);
            const cross = (x === Math.floor(centerX) || y === Math.floor(centerY));
            const diagonal = Math.abs(Math.abs(normDx) - Math.abs(normDy)) < 0.02;
            
            if (circle < 0.1 || cross || diagonal) {
              cell = { char: '╬', color: getColor('secondary') };
            } else if (x % 10 === 0 && y % 10 === 0) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('accent') };
            } else {
              cell = { char: '·', color: getColor('primary') };
            }
          }
        }
        else if (styleName === "Medallion Centerpiece") {
          if (depth < 5) cell = { char: chars.border, color: getColor('border') };
          else if (diamondDist < 0.6) {
            // Exploding medallion effect
            const ring = Math.floor(diamondDist * 10);
            if (ring === 1) cell = { char: chars.medallion, color: getColor('accent') };
            else if (ring % 2 === 0) cell = { char: '✧', color: getColor('secondary') };
            else cell = { char: '░', color: getColor('primary') };
          } else {
            // Scattered accents in field
            if (x % 8 === 0 && y % 8 === 0) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('accent') };
            } else {
              cell = { char: '·', color: getColor('primary') };
            }
          }
        }
        else if (styleName === "Bird & Bloom" || styleName === "Floral Garden") {
          const isBloom = styleName === "Floral Garden";
          if (depth < 4) cell = { char: chars.border, color: getColor('border') };
          else {
            // Densely packed motifs based on selected mode
            const density = isBloom ? 4 : 8;
            const isAtNode = (x % density === 0 && y % density === 0);
            
            if (isAtNode) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('accent') };
            } else if (isBloom && (x % 2 === 0 || y % 2 === 0)) {
              cell = { char: '⁛', color: getColor('secondary') };
            } else {
              cell = { char: '·', color: getColor('primary') };
            }
          }
        }
        else {
          // Persian Masterpiece
          if (depth < 5) {
            cell = { char: depth % 2 === 0 ? chars.border : '╬', color: getColor('border') };
          } else if (hasMedallion && diamondDist < 0.3) {
            cell = { char: diamondDist < 0.1 ? chars.medallion : '✧', color: getColor('accent') };
          } else {
            if (x % 6 === 0 && y % 6 === 0) {
              cell = { char: getMotifChar(x, y, placementMode), color: getColor('secondary') };
            } else {
              cell = { char: chars.field, color: getColor('primary') };
            }
          }
        }
        row.push(cell);
      }
      newGrid.push(row);
    }

    setRugGrid(newGrid);
    setIsGenerating(false);
  }, [config, aiResponse]);

  useEffect(() => {
    if (!showSplash) {
      generateRug();
    }
  }, [config.palette, config.width, config.height, config.selectedMotifIds, config.placementMode, config.hasMedallion, config.styleName, config.useCustomColors, config.customColors, showSplash, generateRug]);

  const toggleMotif = (id: string) => {
    setConfig(prev => {
      const newSelection = prev.selectedMotifIds.includes(id)
        ? prev.selectedMotifIds.filter(mid => mid !== id)
        : [...prev.selectedMotifIds, id];
      return { ...prev, selectedMotifIds: newSelection.length > 0 ? newSelection : [id] };
    });
  };

  const selectStyle = (style: string) => {
    const isBerber = style.includes('Berber');
    setConfig(prev => ({
      ...prev,
      styleName: style,
      palette: isBerber ? PALETTES[2] : PALETTES[0],
      width: isBerber ? 60 : 80,
      height: isBerber ? 80 : 60,
      hasMedallion: style === "Medallion Centerpiece" || style === "Persian Masterpiece"
    }));
    setShowSplash(false);
  };

  const handleCustomColorChange = (key: keyof typeof config.customColors, value: string) => {
    setConfig(prev => ({
      ...prev,
      useCustomColors: true,
      customColors: { ...prev.customColors, [key]: value }
    }));
  };

  const downloadRug = () => {
    const text = rugGrid.map(row => row.map(cell => cell.char).join('')).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `digital-textile-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLight = config.useCustomColors ? false : config.palette.isLight;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0f0a0a] flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-900 to-rose-700 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mx-auto mb-6">
              <Flower className="text-amber-300 animate-pulse" size={40} />
            </div>
            <h1 className="text-5xl font-cinzel font-bold text-white tracking-widest">The Loom of Shiraz</h1>
            <p className="text-white/40 uppercase tracking-[0.4em] text-xs font-bold">Select your base weave pattern</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RUG_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => selectStyle(style)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] hover:border-amber-500/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                    {style.includes('Berber') ? <Compass size={24} /> : <LayoutGrid size={24} />}
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-amber-500 transition-colors" size={20} />
                </div>
                <h3 className="text-lg font-cinzel font-bold text-white mb-2">{style}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                  Procedural ASCII Generation
                </p>
              </button>
            ))}
          </div>

          <div className="text-center pt-8">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">Digital Textile Weaver &bull; v2.6</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${!config.useCustomColors ? config.palette.background : ''} min-h-screen flex flex-col transition-colors duration-1000 overflow-hidden`} 
      style={{ backgroundColor: config.useCustomColors ? config.customColors.background : undefined }}
    >
      <header className={`px-8 py-5 border-b flex justify-between items-center backdrop-blur-2xl sticky top-0 z-50 ${isLight ? 'bg-white/40 border-slate-200' : 'bg-black/20 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSplash(true)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-2xl hover:scale-110 transition-transform ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-br from-red-900 to-rose-700 border-white/10'}`}
          >
            <RotateCcw className={`${isLight ? 'text-rose-600' : 'text-amber-300'}`} size={24} />
          </button>
          <div>
            <h1 className={`text-2xl font-cinzel font-bold tracking-widest ${isLight ? 'text-slate-900' : 'text-white'}`}>The Loom of Shiraz</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-blue-500' : 'bg-emerald-500'} shadow-lg`}></span>
              <p className={`text-[10px] uppercase tracking-[0.3em] font-medium ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{config.styleName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => generateRug(true)}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 border ${isLight ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800' : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-white/10'}`}
          >
            <Sparkles size={18} />
            {isGenerating ? "Weaving Knots..." : "AI Design Renewal"}
          </button>
          <button 
            onClick={downloadRug}
            className={`p-3 rounded-full border transition-all shadow-lg ${isLight ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
            title="Export Pattern"
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <aside 
          className={`transition-all duration-700 ease-in-out border-r overflow-y-auto relative z-40 ${showSettings ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'} ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/60 border-white/5 backdrop-blur-3xl'}`}
        >
          <div className="p-8 space-y-10 w-80 pb-32">
            
            {/* Pattern Mode */}
            <section>
              <div className={`flex items-center gap-3 mb-6 ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>
                <Grid3X3 size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Placement Pattern</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PLACEMENT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConfig({...config, placementMode: mode.id as any})}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${config.placementMode === mode.id ? (isLight ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-amber-500 bg-amber-500/20 text-amber-500') : (isLight ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-white/5 bg-white/5 text-white/30')}`}
                  >
                    {mode.id === 'random' ? <Shuffle size={18} /> : mode.id === 'uniform' ? <Square size={18} /> : <Grid3X3 size={18} />}
                    <span className="text-[9px] uppercase font-bold tracking-tight">{mode.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Motifs Selection */}
            <section>
              <div className={`flex items-center gap-3 mb-6 ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>
                <Settings2 size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Motifs Active</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOTIFS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMotif(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-[11px] font-bold ${config.selectedMotifIds.includes(m.id) ? (isLight ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-amber-500 bg-amber-500/20 text-white shadow-xl shadow-amber-500/10') : 'border-white/5 bg-white/5 text-white/40'}`}
                  >
                    <span className="text-xl leading-none">{m.chars[0]}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className={`flex items-center gap-3 mb-6 ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>
                <Maximize size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Dimensions</h3>
              </div>
              <div className="space-y-6">
                <div className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} p-4 rounded-xl border border-white/5`}>
                  <div className={`flex justify-between text-[10px] uppercase mb-3 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>Width</span>
                    <span className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>{config.width}</span>
                  </div>
                  <input 
                    type="range" min="40" max="160" value={config.width}
                    onChange={(e) => setConfig({...config, width: parseInt(e.target.value)})}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? 'accent-blue-600 bg-slate-300' : 'accent-red-600 bg-white/10'}`}
                  />
                </div>
                <div className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} p-4 rounded-xl border border-white/5`}>
                  <div className={`flex justify-between text-[10px] uppercase mb-3 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>Height</span>
                    <span className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>{config.height}</span>
                  </div>
                  <input 
                    type="range" min="40" max="160" value={config.height}
                    onChange={(e) => setConfig({...config, height: parseInt(e.target.value)})}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isLight ? 'accent-blue-600 bg-slate-300' : 'accent-red-600 bg-white/10'}`}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className={`flex items-center gap-3 mb-6 ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>
                <Sliders size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Colors</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Manual Control</span>
                  <input 
                    type="checkbox" checked={config.useCustomColors}
                    onChange={(e) => setConfig({...config, useCustomColors: e.target.checked})}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
                {[
                  { label: 'Base', key: 'background' },
                  { label: 'Lines', key: 'border' },
                  { label: 'Field', key: 'primary' },
                  { label: 'Accent', key: 'accent' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                    <span className={`text-[10px] uppercase font-medium ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{item.label}</span>
                    <input 
                      type="color" 
                      value={config.customColors[item.key as keyof typeof config.customColors]}
                      onChange={(e) => handleCustomColorChange(item.key as any, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className={`flex items-center gap-3 mb-6 ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>
                <Palette size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Presets</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setConfig({...config, palette: p, useCustomColors: false})}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${!config.useCustomColors && config.palette.name === p.name ? (isLight ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-amber-500 bg-amber-500/10 text-amber-500') : 'border-transparent bg-slate-400/5 hover:bg-slate-400/10'}`}
                  >
                    <span className={`text-xs font-semibold ${!config.useCustomColors && config.palette.name === p.name ? (isLight ? 'text-blue-700' : 'text-amber-500') : (isLight ? 'text-slate-600' : 'text-white/60')}`}>{p.name}</span>
                    <div className="flex gap-1">
                      <div className={`w-3 h-3 rounded-full border border-black/10 ${p.background}`}></div>
                      <div className={`w-3 h-3 rounded-full border border-black/10 ${p.primary.replace('text', 'bg')}`}></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-r-2xl border border-l-0 transition-all shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-400 hover:text-blue-500' : 'bg-white/10 border-white/10 text-white/50 hover:text-white'}`}
        >
          {showSettings ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>

        <div className="flex-1 overflow-auto p-8 lg:p-12 flex items-center justify-center relative">
          <div className="relative group perspective-2000">
            {!isLight && (
              <div className={`absolute inset-0 blur-[150px] opacity-30 rounded-full transition-all duration-1000 scale-150`} style={{ backgroundColor: config.useCustomColors ? config.customColors.primary : undefined }}></div>
            )}
            
            <div 
              className={`relative backdrop-blur-md p-8 lg:p-12 rounded-sm shadow-2xl border-[6px] border-double transition-all duration-1000 transform hover:scale-[1.01] ${isLight ? 'bg-white/95 border-slate-300 shadow-slate-300/50' : 'bg-[#050505]/90 border-white/10 shadow-black'}`}
              style={{ 
                minWidth: `${config.width * 8}px`,
                backgroundColor: config.useCustomColors ? config.customColors.background : undefined,
                borderColor: config.useCustomColors ? config.customColors.border : undefined
              }}
            >
              {aiResponse && (
                <div className="absolute -top-16 left-0 right-0 flex justify-between items-end px-4 transition-all duration-700 opacity-80 group-hover:opacity-100">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-cinzel font-black uppercase tracking-[0.4em] ${isLight ? 'text-slate-800' : 'text-amber-500'}`}>{aiResponse.name}</span>
                    <div className="flex gap-2 items-center">
                      <div className={`w-10 h-[1px] ${isLight ? 'bg-blue-500/40' : 'bg-amber-500/40'}`}></div>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{config.styleName}</span>
                    </div>
                  </div>
                  <div className={`text-[10px] font-mono italic max-w-[450px] text-right leading-relaxed ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                    "{aiResponse.description}"
                  </div>
                </div>
              )}

              <div className="font-mono leading-[0.8] tracking-tighter cursor-crosshair whitespace-pre select-all text-center antialiased">
                {rugGrid.map((row, y) => (
                  <div key={y} className="flex justify-center h-[10px]">
                    {row.map((cell, x) => (
                      <span 
                        key={`${x}-${y}`} 
                        style={{ color: config.useCustomColors ? cell.color : undefined }}
                        className={`${!config.useCustomColors ? cell.color : ''} inline-block w-[1ch] transition-all duration-500 hover:brightness-200 hover:scale-125 relative z-10`}
                      >
                        {cell.char}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute -bottom-14 left-0 right-0 flex justify-center gap-[2px] overflow-hidden h-14 pointer-events-none">
                {Array.from({ length: Math.floor(config.width * 1.5) }).map((_, i) => (
                  <div key={i} className={`flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity`}>
                    <div className={`w-[1px] h-10 ${isLight ? 'bg-slate-400' : 'bg-white/20'}`}></div>
                    <div className={`w-[3px] h-[3px] rounded-full mt-1 ${isLight ? 'bg-slate-500' : 'bg-white/40'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`px-12 py-5 border-t flex justify-between items-center text-[9px] uppercase tracking-[0.3em] z-50 ${isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-black/60 backdrop-blur-3xl border-white/5 text-white/20'}`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-blue-400' : 'bg-amber-500/50'}`}></div>
            <span>Eternal Silk Loom</span>
          </div>
          <span className="opacity-20 text-xs">|</span>
          <div className="flex gap-4">
            <span>Style: {config.styleName}</span>
            <span>Dimensions: {config.width}x{config.height}</span>
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <div className={`flex items-center gap-2 font-black italic ${isLight ? 'text-blue-500/40' : 'text-rose-500/40'}`}>
            <span>Digitally Woven</span>
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-rose-900/20 border-rose-500/20'}`}>
              <Sparkles size={10} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
