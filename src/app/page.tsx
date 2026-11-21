"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Clock, Smartphone, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDone = sessionStorage.getItem("pesquisa_concluida_ago2026") === "true";
      setAlreadyCompleted(isDone);
    }
  }, []);

  return (
    <main className="relative w-full min-h-[100dvh] bg-[#591013] flex flex-col items-center justify-between p-2.5 sm:p-5 md:p-8 short-screen-p select-none overflow-x-hidden overflow-y-auto">
      {/* Background Decorativo Institucional Sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#E5B533_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Card Institucional Centralizado e Fluido */}
      <div className="relative z-10 w-full max-w-[540px] md:max-w-[720px] lg:max-w-[900px] my-auto bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F0] to-[#FBF3E4] border-[2px] sm:border-[3px] border-[#D8BC86] rounded-[20px] sm:rounded-[32px] shadow-[0_20px_50px_-10px_rgba(20,2,4,0.65)] p-3.5 sm:p-7 md:p-9 short-screen-card flex flex-col items-center text-center">
        
        {/* Faixa Superior: Brasão Oficial e Identificação */}
        <div className="w-full flex flex-col items-center justify-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 short-screen-gap">
          <div className="relative w-[95px] h-[108px] sm:w-[135px] sm:h-[152px] md:w-[155px] md:h-[175px] short-screen-logo shrink-0 drop-shadow-[0_6px_12px_rgba(128,0,32,0.18)]">
            <Image
              src="/img/brasao_oficial_comieadepa.png"
              alt="Brasão Oficial COMIEADEPA"
              fill
              priority
              sizes="(max-width: 640px) 135px, 155px"
              className="object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-[10px] sm:text-xs md:text-sm font-black tracking-wider uppercase">
            <span>AGO 2026</span>
          </div>
        </div>

        {/* Títulos Oficiais */}
        <div className="w-full flex flex-col items-center gap-1 sm:gap-1.5 mb-2 sm:mb-4 short-screen-gap">
          <h2 className="text-[#800020] font-black text-lg sm:text-2xl md:text-3xl tracking-tight leading-tight uppercase font-serif short-screen-title">
            COMIEADEPA
          </h2>
          <p className="text-[#8C6D47] text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide uppercase max-w-md short-screen-desc">
            Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus no Pará
          </p>

          <div className="w-20 sm:w-32 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-[#C79C3B] to-transparent my-0.5 sm:my-2" />

          <h1 className="text-[#1A0307] font-black text-base sm:text-2xl md:text-3xl tracking-tight leading-snug short-screen-subtitle">
            Avaliação Institucional dos Ministros
          </h1>

          <p className="text-[#5C3D42] text-[11px] sm:text-sm md:text-base leading-relaxed max-w-lg mt-0.5 font-medium short-screen-desc">
            {alreadyCompleted
              ? "Sua avaliação nesta sessão já foi registrada com sucesso. Agradecemos sua valiosa colaboração na AGO 2026."
              : "Sua participação é anônima e contribui para o aprimoramento contínuo dos serviços e decisões da Convenção."}
          </p>
        </div>

        {/* Pilares Institucionais em Chips / Badges */}
        <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 max-w-md my-1.5 sm:my-3 short-screen-chips">
          <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-[#FAF0E1] border border-[#E7CE9E] text-center short-screen-chip-item">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#800020] mb-0.5 shrink-0" />
            <span className="text-[9px] sm:text-xs font-bold text-[#800020]">100% Anônimo</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-[#FAF0E1] border border-[#E7CE9E] text-center short-screen-chip-item">
            <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#800020] mb-0.5 shrink-0" />
            <span className="text-[9px] sm:text-xs font-bold text-[#800020]">Rápido (2 min)</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-[#FAF0E1] border border-[#E7CE9E] text-center short-screen-chip-item">
            <Smartphone className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#800020] mb-0.5 shrink-0" />
            <span className="text-[9px] sm:text-xs font-bold text-[#800020]">Mobile-First</span>
          </div>
        </div>

        {/* Botão de Ação Principal (Ativo ou Bloqueado caso já realizada) */}
        <div className="w-full max-w-md mt-2.5 sm:mt-5 short-screen-btn-box">
          {alreadyCompleted ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center w-full min-h-[46px] sm:min-h-[58px] py-3 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-[#D8C7B2]/60 text-[#7A6652] font-black tracking-wider text-sm sm:text-base uppercase border border-[#C5B39E] cursor-not-allowed shadow-none short-screen-btn select-none"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                <span className="text-emerald-900 font-extrabold">PESQUISA JÁ REALIZADA</span>
              </span>
            </button>
          ) : (
            <Link
              href="/pesquisa"
              className="group relative inline-flex items-center justify-center w-full min-h-[46px] sm:min-h-[58px] py-3 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#800020] via-[#750215] to-[#54040E] hover:from-[#9D0F2D] hover:via-[#850B1D] hover:to-[#6E0A1E] text-white font-black tracking-wider text-sm sm:text-lg uppercase transition-all duration-200 shadow-xl shadow-[#800020]/35 border border-[#E5B533]/50 cursor-pointer active:scale-[0.98] short-screen-btn"
            >
              <span className="drop-shadow-sm flex items-center justify-center gap-2">
                <span>INICIAR PESQUISA</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform stroke-[3]" />
              </span>
            </Link>
          )}
        </div>

      </div>

      {/* Rodapé Institucional Discreto */}
      <footer className="relative z-10 w-full text-center py-1 sm:py-2 text-[10px] sm:text-xs text-[#E5CCA0]/80 font-medium">
        COMIEADEPA — Assembleia Geral Ordinária 2026 • Sistema de Coleta Segura
      </footer>
    </main>
  );
}
