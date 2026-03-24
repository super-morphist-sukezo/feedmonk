"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "next-themes"; // ダークモード用に追加
import { Sparkles, Copy, Check, RotateCcw, RefreshCw, Twitter, Moon, Sun } from "lucide-react";

// --- 一文字ずつ表示するための専用コンポーネント ---
const TypewriterText = ({ text }: { text: string }) => {
  const characters = text.split("");
  return (
    <span>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const DEFAULT_HEADLINES: Record<string, string> = {
  ja: "溢れる想いを、\n澄み渡る言の葉へ。",
  en: "Overflowing feelings, distilled into lucid words.",
  fr: "Des émotions débordantes, distillées en mots limpides.",
  es: "Sentimientos desbordantes, destilados en palabras nítidas.",
  de: "Überströmende Gefühle, destilliert zu klaren Worten.",
  it: "Emozioni traboccanti, distillate in parole limpide.",
  pt: "Sentimentos transbordantes, destilados em palavras límpidas.",
  "pt-br": "Sentimentos transbordantes, destilados em palavras límpidas.",
  ko: "넘치는 마음을, 맑은 말로.",
  "zh-cn": "将满溢的情感，凝练成澄澈的言语。",
  "zh-tw": "把滿溢的情感，凝鍊成澄澈的言語。",
  ru: "Переполняющие чувства, превращённые в ясные слова.",
};

const getDefaultHeadline = (lang: string) => {
  const normalized = lang.toLowerCase();
  if (DEFAULT_HEADLINES[normalized]) return DEFAULT_HEADLINES[normalized];
  const base = normalized.split(/[-_]/)[0];
  return DEFAULT_HEADLINES[base] ?? DEFAULT_HEADLINES.en;
};

export default function FeedMonkApp() {
  const [text, setText] = useState("");
  const[result, setResult] = useState<any>(null);
  const [headline, setHeadline] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lang, setLang] = useState(() =>
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "ja"
  );

  // ダークモード制御用
  const { theme, setTheme, systemTheme } = useTheme();
  const[mounted, setMounted] = useState(false);

  const convertAction = useAction(api.ai.convert);
  const saveMutation = useMutation(api.transformations.save);

  const xUrlMatch = text.match(/https:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/);
  const xUrl = xUrlMatch ? xUrlMatch[0] : null;
  const defaultHeadline = getDefaultHeadline(lang);

  // ハイドレーションエラー防止
  useEffect(() => {
    setMounted(true);
  },[]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language) {
      setLang(navigator.language);
    }
  }, []);

  const onSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await convertAction({ text, lang });
      setResult(res);
      setHeadline(res?.headline ?? null);
      await saveMutation({ result: res });
    } catch (e) {
      console.error(e);
      alert("通信に失敗しました。少し時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- ダークモード対応: 背景のオーラの制御 ---
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  let bgGradient = isDark
    ? "radial-gradient(circle at 50% -20%, #171717, #0a0a0a)" // ダーク基本
    : "radial-gradient(circle at 50% -20%, #F9F9F7, #F9F9F7)"; // ライト基本

  if (result) {
    bgGradient = isDark 
      ? "radial-gradient(circle at 50% -20%, #8a5a00 0%, #0f4c5c 45%, #0a0a0a 100%)" // 悟り（ダーク：ゴールド→青緑→黒）
      : "radial-gradient(circle at 50% -20%, #fef3c7, #F9F9F7)"; // 悟り（ライトアンバー）
  } else if (loading) {
    bgGradient = isDark
      ? "radial-gradient(circle at 50% -20%, #082f49, #0a0a0a)" // 蒸留中（ダークブルー）
      : "radial-gradient(circle at 50% -20%, #e0f2fe, #F9F9F7)"; // 蒸留中（ライトブルー）
  } else if (text.length > 0) {
    bgGradient = isDark
      ? "radial-gradient(circle at 50% -20%, #450a0a, #0a0a0a)" // 怒り（ダークレッド）
      : "radial-gradient(circle at 50% -20%, #fee2e2, #F9F9F7)"; // 怒り（ライトレッド）
  }

  // 初回マウント前は何も描画しない（テーマのチラつき防止）
  if (!mounted) return null;

  return (
    <motion.div 
      className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-amber-100 dark:selection:bg-amber-900 overflow-x-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundImage: bgGradient }}
    >
      {/* 背景装飾（波紋） */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: loading ? [1, 1.1, 1] : 1, opacity: loading ?[0.3, 0.6, 0.3] : 0.5 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 border-[1px] border-slate-200 dark:border-white/5 rounded-full" 
        />
      </div>

      <nav className="p-6 flex justify-between items-center relative z-10 max-w-5xl mx-auto">
        <span
          className={`text-xl font-serif font-bold tracking-tighter ${
            isDark ? "text-slate-50" : "text-slate-800"
          }`}
        >
          feedmonk.app
        </span>
        
        <div className="flex items-center gap-6">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden md:block">
            Transmute Emotion into Wisdom
          </div>
          
          {/* ダークモード・トグルボタン */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all shadow-sm"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}>
              <h2
                className={`text-4xl font-serif mb-10 text-center leading-tight ${
                  isDark ? "text-slate-50" : "text-slate-800"
                }`}
              >
                {headline ? (
                  headline
                ) : (
                  <>
                    <span className="whitespace-pre-line">{defaultHeadline}</span>
                  </>
                )}
              </h2>
              
              {/* 入力エリア */}
              <motion.div className="relative group" animate={{ scale: loading ? 0.98 : 1 }} transition={{ duration: 0.5 }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="ここに文句を書き出してください..."
                  className="w-full h-80 p-8 rounded-[2.5rem] bg-white/70 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-2xl focus:border-red-300 dark:focus:border-red-900 focus:bg-white/90 dark:focus:bg-black/60 focus:ring-0 transition-all duration-500 text-lg placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-relaxed outline-none"
                  disabled={loading}
                />
                <div className="absolute bottom-8 right-8">
                  <button
                    onClick={onSubmit}
                    disabled={loading || !text}
                    className="bg-[#1A1A1A] dark:bg-slate-100 text-white dark:text-slate-900 px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-amber-700 dark:hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-20 shadow-lg"
                  >
                    {loading ? <RotateCcw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600 group-hover:animate-pulse" />}
                    {loading ? "蒸留中..." : "言葉を編む"}
                  </button>
                </div>
              </motion.div>
              <p className="mt-6 text-center text-xs text-red-400 dark:text-red-500/80 tracking-widest uppercase font-medium">
                ※個人情報は入力しないでください
              </p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              
              <div className="text-center px-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500/80 font-bold text-center block">The Insight</span>
                <h3
                  className={`text-2xl font-serif mt-3 italic leading-relaxed text-center ${
                    isDark ? "text-slate-50" : "text-slate-800"
                  }`}
                >
                  「{result.coreEmotion}」
                </h3>
              </div>

              <div className="grid gap-5">
                {[
                  { id: "A", text: result.patternA, label: "Humble Request" },
                  { id: "B", text: result.patternB, label: "Clear Feedback" },
                  { id: "C", text: result.patternC, label: "Direct Boundary" },
                ].map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="bg-white/80 dark:bg-black/30 backdrop-blur-sm p-7 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex justify-between items-start group hover:border-amber-200 dark:hover:border-amber-800 transition-all"
                  >
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold block mb-2">{p.label}</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{p.text}</p>
                    </div>
                    <button onClick={() => copyToClipboard(p.text, p.id)} className="ml-4 p-2 text-slate-300 dark:text-slate-600 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                      {copiedId === p.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* 詩的エンコード：タイピングアニメーション付き */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 1.2, duration: 0.8 }} 
                className="bg-[#1A1A1A] dark:bg-black p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden border border-transparent dark:border-white/10"
              >
                {/* 詩の背景のモヤモヤ（エモい演出） */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-amber-900/20 dark:from-purple-900/10 dark:to-amber-900/10 pointer-events-none" />

                <div className="absolute top-6 left-0 right-0 text-[9px] uppercase tracking-[0.6em] text-amber-500/40 font-bold">Poetic Reflection</div>
                
                <div className="text-white font-serif text-xl italic leading-loose text-amber-50 md:text-2xl px-4 mt-4 relative z-10">
                   {result.poeticTranslation && (
                     <TypewriterText text={result.poeticTranslation} />
                   )}
                </div>
                
                {/* Xへのシェアボタン */}
                {xUrl && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.5 }} 
                    className="mt-8 pt-6 border-t border-white/10 flex justify-center relative z-10"
                  >
                    <a
                      href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                        `【FeedMonkの詩】\n\n${result.poeticTranslation}\n\n#FeedMonk`
                      )}&url=${encodeURIComponent(xUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                    >
                      <Twitter className="w-4 h-4" />
                      引用リポストで詩を共有
                    </a>
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
                onClick={() => { setResult(null); setText(""); }}
                className="w-full py-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] text-slate-400 dark:text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-800 transition-all text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> もっと文句を書く
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-12 text-center text-slate-300 dark:text-slate-700 text-[10px] tracking-[0.3em] uppercase transition-colors">
        © 2026 monku.ai — feedmonk.app
      </footer>
    </motion.div>
  );
}
