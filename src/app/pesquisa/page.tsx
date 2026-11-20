"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OFFICIAL_SURVEY_QUESTIONS, Question } from "@/data/survey-questions";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Check,
  MapPin,
  ThumbsUp,
  Meh,
  ThumbsDown,
  HelpCircle,
  EyeOff,
  Sparkles,
  Building2,
  DollarSign,
  GraduationCap,
  Compass,
  Users2,
  Calendar,
  AlertCircle,
  Pointer,
  HeartHandshake,
  Loader2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Função semântica para ícones de alternativas
 */
function getSemanticOptionIcon(questionId: number, value: string, isSelected: boolean) {
  const iconClass = `w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] md:w-[48px] md:h-[48px] landscape-compact-icon transition-transform ${
    isSelected ? "text-white drop-shadow-md" : ""
  }`;

  if (isSelected) {
    return <CheckCircle2 className={`${iconClass} stroke-[2.2]`} />;
  }

  // Q2: Dificuldades
  if (value === "financeira") return <DollarSign className={`${iconClass} text-[#C79C3B] stroke-[2]`} />;
  if (value === "estrutura_templos") return <Building2 className={`${iconClass} text-[#1E88E5] stroke-[2]`} />;
  if (value === "formacao_ministerial") return <GraduationCap className={`${iconClass} text-[#00897B] stroke-[2]`} />;
  if (value === "acesso_logistica") return <Compass className={`${iconClass} text-[#E65100] stroke-[2]`} />;
  if (value === "questoes_sociais") return <Users2 className={`${iconClass} text-[#8E24AA] stroke-[2]`} />;
  if (value === "outra") return <AlertCircle className={`${iconClass} text-[#717179] stroke-[2]`} />;

  // Q3, Q5, Q7: Sim / Às vezes / Em parte / Não
  if (value === "sim") return <ThumbsUp className={`${iconClass} text-[#20BB11] stroke-[2]`} />;
  if (value === "as_vezes" || value === "em_parte") return <Meh className={`${iconClass} text-[#C79C3B] stroke-[2]`} />;
  if (value === "nao") return <ThumbsDown className={`${iconClass} text-[#F64F6A] stroke-[2]`} />;

  // Q4: Prestação de contas (Clara, Parcial, Insuficiente, Não conheço)
  if (value === "clara") return <Sparkles className={`${iconClass} text-[#20BB11] stroke-[2]`} />;
  if (value === "parcial") return <Meh className={`${iconClass} text-[#C79C3B] stroke-[2]`} />;
  if (value === "insuficiente") return <ThumbsDown className={`${iconClass} text-[#F64F6A] stroke-[2]`} />;
  if (value === "nao_conheco") return <EyeOff className={`${iconClass} text-[#717179] stroke-[2]`} />;

  // Q6: Frequência de visitas (Frequente, Ocasional, Rara, Nunca)
  if (value === "frequente") return <HeartHandshake className={`${iconClass} text-[#20BB11] stroke-[2]`} />;
  if (value === "ocasional") return <Calendar className={`${iconClass} text-[#C79C3B] stroke-[2]`} />;
  if (value === "rara") return <AlertCircle className={`${iconClass} text-[#E65100] stroke-[2]`} />;
  if (value === "nunca") return <EyeOff className={`${iconClass} text-[#F64F6A] stroke-[2]`} />;

  return <HelpCircle className={`${iconClass} text-[#717179] stroke-[2]`} />;
}

export default function PesquisaPage() {
  const router = useRouter();
  
  // Etapas:
  // 0: Identificação da Região
  // 1 a 7: Perguntas objetivas (IDs 1 a 7)
  // 8: Campo livre opcional (ID 8)
  const [currentStep, setCurrentStep] = useState(0); 
  const [regiao, setRegiao] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [comentarioLivre, setComentarioLivre] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Token único de submissão (idempotência) para impedir registros duplicados em cliques repetidos
  const [submissionToken, setSubmissionToken] = useState<string>("");

  useEffect(() => {
    // Gera token idempotente estável para esta sessão de preenchimento
    if (typeof window !== "undefined") {
      setSubmissionToken(crypto.randomUUID());
    }
  }, []);

  // Timer automático de 10 segundos na tela de conclusão
  useEffect(() => {
    if (!isCompleted) return;

    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, router]);

  const totalSteps = 1 + OFFICIAL_SURVEY_QUESTIONS.length; // 9
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  const currentQuestion: Question | undefined = currentStep > 0 ? OFFICIAL_SURVEY_QUESTIONS[currentStep - 1] : undefined;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : "";

  const handleSelectOption = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    setSubmitError(null);
  };

  const handleNext = async () => {
    // Etapa 0: Validação estrita de região
    if (currentStep === 0) {
      if (!regiao.trim()) return;
      setCurrentStep(1);
      return;
    }

    // Etapas 1 a 7: Avança para a próxima etapa
    if (currentStep < OFFICIAL_SURVEY_QUESTIONS.length) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Etapa 8: Finalização e Persistência no Supabase
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const totemId = typeof window !== "undefined" ? (localStorage.getItem("totem_id") || "totem_geral") : "totem_geral";
      const token = submissionToken || crypto.randomUUID();

      const payloadOficial = {
        submission_token: token,
        regiao: regiao.trim(),
        totem_id: totemId,
        q1_gestao_nota: parseInt(answers[1] || "0", 10),
        q2_dificuldade_igrejas: answers[2] || "outra",
        q3_demandas_regiao: answers[3] || "as_vezes",
        q4_prestacao_contas: answers[4] || "nao_conheco",
        q5_amparo_ministerial: answers[5] || "em_parte",
        q6_frequencia_visitas: answers[6] || "ocasional",
        q7_formacao_teologica: answers[7] || "em_parte",
        q8_comentario_livre: comentarioLivre.trim() || null,
        respostas_completas: {
          versao: "oficial_ago_2026",
          submission_token: token,
          regiao: regiao.trim(),
          ...answers,
          8: comentarioLivre.trim(),
        },
      };

      // Gravação EXCLUSIVA na tabela oficial aprovada com checagem rigorosa
      const { data, error } = await supabase
        .from("respostas_pesquisa_oficial")
        .insert([payloadOficial])
        .select("id");

      if (error) {
        // Se ocorrer conflito 23505 (duplicação de token), consulta o servidor para validar se a submissão realmente foi salva
        if (error.code === "23505") {
          try {
            const checkRes = await fetch("/api/pesquisa/verify-submission", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            const checkData = await checkRes.json();
            if (checkData.verified) {
              setIsCompleted(true);
              return;
            }
          } catch (verifyErr) {
            console.error("Erro ao verificar submissão:", verifyErr);
          }
        }

        console.error("Erro na persistência da pesquisa:", error);
        setSubmitError(
          "Não foi possível registrar suas respostas no servidor. Verifique a conexão do totem e clique em 'Tentar Novamente'. Todas as suas respostas foram preservadas."
        );
        return;
      }

      // Somente avança para tela de agradecimento se a confirmação do banco foi bem-sucedida
      setIsCompleted(true);
    } catch (err: any) {
      console.error("Exceção na comunicação de rede:", err);
      setSubmitError(
        "Falha na comunicação de rede com o servidor. Por favor, tente novamente. Nenhuma resposta foi perdida."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSubmitError(null);
    }
  };

  // TELA DE CONCLUSÃO / SUCESSO (SOMENTE APÓS CONFIRMAÇÃO DO BANCO)
  if (isCompleted) {
    return (
      <main className="relative w-full min-h-screen min-h-[100dvh] bg-[#591013] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
        <div className="relative w-full max-w-[560px] bg-[#FFF9F0] border-[3px] sm:border-[4px] border-[#D8BC86] rounded-[24px] sm:rounded-[30px] p-6 sm:p-10 shadow-2xl text-center my-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#800020] text-white border-2 border-[#C79C3B] flex items-center justify-center mx-auto mb-5 shadow-md">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFD666]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#800020] mb-3">
            Obrigado pela sua contribuição!
          </h1>

          <p className="text-[#5C3D42] text-sm sm:text-base mb-6 leading-relaxed max-w-lg mx-auto">
            Sua avaliação foi registrada de forma totalmente anônima e confidencial. A liderança da COMIEADEPA agradece sua valiosa participação na AGO 2026.
          </p>

          <div className="bg-[#FAF0E1] border border-[#E7CE9E] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm text-[#800020] mb-6 max-w-md mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#800020] shrink-0" />
            <span className="font-semibold">Sessão finalizada com segurança. Nenhum dado pessoal foi mantido.</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 w-full">
            <Link
              href="/"
              className="w-full max-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#800020] via-[#750215] to-[#54040E] hover:from-[#9D0F2D] hover:to-[#6E0A1E] text-white font-extrabold tracking-wider text-lg transition-all shadow-xl shadow-[#800020]/35 border border-[#E5B533]/40 cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>OK</span>
            </Link>

            <span className="text-xs sm:text-sm text-[#8C6D47] font-semibold">
              Retornando à tela inicial em {countdown}s...
            </span>
          </div>
        </div>
      </main>
    );
  }

  // Validação de avanço
  const canAdvance = currentStep === 0 
    ? regiao.trim().length > 0 
    : currentQuestion?.optional 
      ? true 
      : Boolean(currentAnswer);

  return (
    <main className="relative w-full min-h-screen min-h-[100dvh] bg-[#591013] flex flex-col items-center justify-center p-3 sm:p-5 md:p-8 landscape-compact-py overflow-x-hidden overflow-y-auto select-none">
      <div className="relative z-10 w-full flex justify-center py-1 sm:py-3">
        <section 
          className="relative w-full bg-[#FFF9F0] border-[3px] sm:border-[4px] border-[#D8BC86] rounded-[20px] sm:rounded-[30px] shadow-[0_20px_45px_-8px_rgba(30,5,8,0.45)] p-4 sm:p-6 md:p-7 landscape-compact-card flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-5"
          style={{
            width: "min(1380px, calc(100% - 24px))",
            minHeight: "auto",
          }}
        >
          {/* CABEÇALHO */}
          <div className="w-full shrink-0 flex flex-col gap-2 landscape-compact-header">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div 
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-[#800020] via-[#750215] to-[#590410] border border-[#C79C3B]/60 text-white shadow-md shadow-[#800020]/25 px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 h-[34px] sm:h-[44px]"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs font-black">
                  {currentStep === 0 ? "📍" : currentStep === 8 ? "✍️" : "?"}
                </div>
                <span className="text-[11px] sm:text-sm md:text-base font-black tracking-wide">
                  {currentStep === 0 ? "Identificação" : currentStep === 8 ? "Campo Livre" : "Pergunta"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#800020] font-extrabold text-xs sm:text-sm md:text-base">
                <span className="hidden sm:inline text-[#8C6D47] uppercase font-bold text-xs tracking-wider">
                  {currentStep === 0 ? "Região Pastoral •" : `${currentQuestion?.category} •`}
                </span>
                <span className="bg-[#F5EAD7] px-3 py-1 rounded-full border border-[#DDC295] text-[11px] sm:text-sm font-black shadow-inner">
                  {currentStep === 0 
                    ? "Início • Identificação" 
                    : currentStep === 8 
                      ? "Etapa Final (Opcional)" 
                      : `Pergunta ${currentStep} de 7`}
                </span>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-[#E8DAC2] h-[6px] sm:h-[8px] rounded-full overflow-hidden p-[1px] shadow-inner">
              <div
                className="bg-gradient-to-r from-[#800020] via-[#9E0F2D] to-[#6E0A1E] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* ALERTA DE ERRO DE CONEXÃO / PERSISTÊNCIA */}
          {submitError && (
            <div className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 shadow-md animate-shake">
              <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold text-rose-900 leading-snug">
                  Aviso de Transmissão de Dados:
                </p>
                <p className="text-xs sm:text-sm text-rose-800 mt-1">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 0: ABERTURA & IDENTIFICAÇÃO DA REGIÃO */}
          {currentStep === 0 && (
            <div className="w-full flex flex-col items-center gap-4 sm:gap-6 py-2 sm:py-4">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 
                  className="font-extrabold text-[#800020] tracking-tight leading-snug"
                  style={{ fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 800 }}
                >
                  Avaliação Institucional dos Ministros
                </h2>
                <p className="text-[#5C3D42] text-sm sm:text-base leading-relaxed">
                  Sua participação é anônima e contribui para o aprimoramento dos serviços da Convenção.
                </p>
              </div>

              <div className="w-full max-w-xl bg-white border-2 border-[#E8D4B0] rounded-2xl p-5 sm:p-6 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-[#800020] font-bold text-sm sm:text-base">
                  <MapPin className="w-5 h-5 text-[#800020]" />
                  <span>Informe a sua Região:*</span>
                </div>

                <input
                  type="text"
                  placeholder="Ex: Baixo Amazonas, Marajó, Metropolitana, Sul do Pará..."
                  value={regiao}
                  onChange={(e) => {
                    setRegiao(e.target.value);
                    setSubmitError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && regiao.trim()) handleNext();
                  }}
                  autoFocus
                  className="w-full bg-[#FFFDF9] border-2 border-[#D8BC86] focus:border-[#800020] rounded-xl px-4 py-3.5 text-[#1A0307] text-base sm:text-lg font-semibold outline-none transition-all placeholder:text-[#9E8B78] placeholder:font-normal"
                />

                <p className="text-xs text-[#8C6D47] flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#800020] shrink-0" />
                  <span>Apenas a região será associada à resposta. Nenhum nome ou CPF é solicitado.</span>
                </p>
              </div>
            </div>
          )}

          {/* ETAPAS 1 A 7: PERGUNTAS OBJETIVAS */}
          {currentStep >= 1 && currentStep <= 7 && currentQuestion && (
            <>
              <div className="w-full pt-0.5 sm:pt-1">
                <div className="flex items-start gap-2.5 sm:gap-4 md:gap-5 w-full">
                  <div 
                    className="w-[4px] sm:w-[6px] bg-gradient-to-b from-[#E5B533] via-[#DCA326] to-[#C78F1A] rounded-full shrink-0 shadow-sm self-stretch min-h-[36px]"
                  />
                  <h2 
                    className="font-extrabold text-[#800020] leading-snug sm:leading-snug tracking-tight text-left break-words w-full"
                    style={{ fontSize: "clamp(16px, 2.1vw, 30px)", fontWeight: 800 }}
                  >
                    {currentQuestion.title}
                  </h2>
                </div>
              </div>

              <div className="w-full flex items-center justify-center py-0.5">
                <div 
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1 rounded-full bg-[#F5EAD7] border border-[#DFC392] shadow-sm text-[#800020] text-center"
                >
                  <Pointer className="w-3.5 h-3.5 text-[#800020] animate-bounce shrink-0" />
                  <span 
                    className="font-bold tracking-wide"
                    style={{ fontSize: "clamp(12px, 1.2vw, 17px)", fontWeight: 700 }}
                  >
                    {currentQuestion.type === "scale" ? "Selecione uma nota de 0 a 10:" : "Selecione uma opção abaixo:"}
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col justify-center my-auto py-1">
                {/* 1. PERGUNTA 1: NOTAS DE 0 A 10 */}
                {currentQuestion.type === "scale" && (
                  <div className="w-full">
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-2.5 w-full items-stretch">
                      {currentQuestion.options?.map((opt) => {
                        const isSelected = currentAnswer === opt.value;
                        const notaNum = parseInt(opt.value, 10);
                        const isAlta = notaNum >= 8;
                        const isMedia = notaNum >= 5 && notaNum < 8;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption(opt.value)}
                            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer text-center relative ${
                              isSelected
                                ? "bg-gradient-to-b from-[#800020] via-[#6E0A1E] to-[#4D020D] border-[#E5B533] border-[3px] text-white shadow-xl shadow-[#800020]/35 z-10 scale-[1.02]"
                                : "bg-white border-[#E8D4B0] text-[#1A0307] hover:border-[#DCA326] hover:bg-[#FFFDF9] hover:shadow-md shadow-sm"
                            }`}
                            style={{ minHeight: "clamp(64px, 10vw, 110px)" }}
                          >
                            <span 
                              className={`font-black ${isSelected ? "text-white" : "text-[#800020]"}`}
                              style={{ fontSize: "clamp(22px, 2.5vw, 36px)" }}
                            >
                              {opt.label}
                            </span>
                            <span 
                              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 ${
                                isSelected 
                                  ? "text-[#FFD666]" 
                                  : isAlta 
                                    ? "text-emerald-700" 
                                    : isMedia 
                                      ? "text-amber-700" 
                                      : "text-rose-700"
                              }`}
                            >
                              {notaNum === 0 ? "Mínima" : notaNum === 10 ? "Máxima" : `Nota ${notaNum}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. PERGUNTAS OBJETIVAS */}
                {currentQuestion.type === "options" && currentQuestion.options && (
                  <div className={`grid gap-2.5 sm:gap-3.5 w-full items-stretch ${
                    currentQuestion.options.length === 3
                      ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
                      : currentQuestion.options.length === 4
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}>
                    {currentQuestion.options.map((opt) => {
                      const isSelected = currentAnswer === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(opt.value)}
                          className={`w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-[18px] sm:rounded-[22px] border-2 transition-all duration-150 cursor-pointer text-left landscape-compact-option ${
                            isSelected
                              ? "bg-gradient-to-r from-[#800020] via-[#6E0A1E] to-[#4D020D] border-[#E5B533] border-[3px] text-white shadow-xl shadow-[#800020]/35 z-10"
                              : "bg-[#FFFFFF] border-[#E8D4B0] text-[#1A0307] hover:border-[#DCA326] hover:bg-[#FFFDF9] hover:shadow-md shadow-sm"
                          }`}
                          style={{ minHeight: "clamp(60px, 9vw, 95px)" }}
                        >
                          <div className="shrink-0 flex items-center justify-center">
                            {getSemanticOptionIcon(currentQuestion.id, opt.value, isSelected)}
                          </div>

                          <span
                            className={`leading-snug font-bold landscape-compact-text ${
                              isSelected ? "text-white" : "text-[#1A0307]"
                            }`}
                            style={{ fontSize: "clamp(14px, 1.3vw, 19px)", fontWeight: 700 }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ETAPA 8: CAMPO LIVRE (OPCIONAL) */}
          {currentStep === 8 && currentQuestion && (
            <div className="w-full flex flex-col gap-4 py-1">
              <div className="w-full pt-0.5 sm:pt-1">
                <div className="flex items-start gap-2.5 sm:gap-4 md:gap-5 w-full">
                  <div 
                    className="w-[4px] sm:w-[6px] bg-gradient-to-b from-[#E5B533] via-[#DCA326] to-[#C78F1A] rounded-full shrink-0 shadow-sm self-stretch min-h-[36px]"
                  />
                  <div>
                    <h2 
                      className="font-extrabold text-[#800020] leading-snug tracking-tight text-left break-words w-full"
                      style={{ fontSize: "clamp(16px, 2.1vw, 28px)", fontWeight: 800 }}
                    >
                      {currentQuestion.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C6D47] mt-1 font-medium">
                      {currentQuestion.helper}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
                <div className="relative w-full">
                  <textarea
                    rows={6}
                    maxLength={1000}
                    placeholder="Escreva sua mensagem aqui (opcional). Você pode enviar sem preencher..."
                    value={comentarioLivre}
                    onChange={(e) => {
                      setComentarioLivre(e.target.value);
                      setSubmitError(null);
                    }}
                    className="w-full bg-white border-2 border-[#D8BC86] focus:border-[#800020] rounded-2xl p-4 sm:p-5 text-[#1A0307] text-base leading-relaxed outline-none transition-all placeholder:text-[#9E8B78] resize-none shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-[#8C6D47] px-1 font-medium">
                  <span className="italic">
                    {comentarioLivre.trim() ? "Comentário preenchido" : "Campo opcional — você pode avançar diretamente"}
                  </span>
                  <span className={`font-bold ${comentarioLivre.length >= 950 ? "text-rose-600" : "text-[#800020]"}`}>
                    {comentarioLivre.length} / 1.000 caracteres
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* NAVEGAÇÃO INFERIOR */}
          <div className="w-full shrink-0 pt-2.5 sm:pt-4 border-t border-[#E5CCA0]/80">
            <footer className="flex flex-wrap items-center justify-between gap-3">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#800020] text-[#800020] hover:bg-[#F5EAD7] font-bold transition-colors cursor-pointer shadow-sm px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base min-w-[120px] sm:min-w-[160px] h-[44px] sm:h-[54px] disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#800020]" />
                  <span>Anterior</span>
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#DFC392] text-[#800020] hover:bg-[#F5EAD7] font-bold transition-colors shadow-sm px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base min-w-[120px] sm:min-w-[160px] h-[44px] sm:h-[54px]"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#800020]" />
                  <span>Início</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance || isSubmitting}
                className={`flex items-center justify-center gap-2 rounded-2xl font-bold transition-all cursor-pointer shadow-lg px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base min-w-[130px] sm:min-w-[170px] h-[44px] sm:h-[54px] ${
                  !canAdvance || isSubmitting
                    ? "bg-[#D8C7B2]/70 text-[#9E8B78] border border-[#C5B39E] cursor-not-allowed shadow-none"
                    : submitError
                      ? "bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950 text-white shadow-rose-900/40 active:scale-[0.98] border border-rose-400"
                      : "bg-gradient-to-r from-[#800020] via-[#750215] to-[#54040E] hover:from-[#9D0F2D] hover:to-[#6E0A1E] text-white shadow-[#800020]/35 active:scale-[0.98] border border-[#E5B533]/40"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Transmitindo...</span>
                  </>
                ) : submitError ? (
                  <>
                    <RotateCcw className="w-5 h-5 text-white" />
                    <span>Tentar Novamente</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === 0 
                        ? "Iniciar Questionário" 
                        : currentStep === 8 
                          ? "Finalizar Pesquisa" 
                          : "Próxima"}
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </>
                )}
              </button>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
