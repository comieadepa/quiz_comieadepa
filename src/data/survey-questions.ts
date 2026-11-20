export interface Question {
  id: number;
  category: string;
  title: string;
  type: "scale" | "options" | "textarea";
  options?: { label: string; value: string }[];
  helper?: string;
  optional?: boolean;
}

export const OFFICIAL_SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Gestão Administrativa",
    title: "Em uma escala de 0 a 10, como você avalia a gestão administrativa da Convenção?",
    type: "scale",
    options: [
      { label: "0", value: "0" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5", value: "5" },
      { label: "6", value: "6" },
      { label: "7", value: "7" },
      { label: "8", value: "8" },
      { label: "9", value: "9" },
      { label: "10", value: "10" },
    ],
  },
  {
    id: 2,
    category: "Realidade Regional",
    title: "Qual a principal dificuldade enfrentada pelas igrejas da sua região?",
    type: "options",
    options: [
      { label: "Financeira", value: "financeira" },
      { label: "Estrutura de templos", value: "estrutura_templos" },
      { label: "Formação ministerial", value: "formacao_ministerial" },
      { label: "Acesso e logística", value: "acesso_logistica" },
      { label: "Questões sociais", value: "questoes_sociais" },
      { label: "Outra", value: "outra" },
    ],
  },
  {
    id: 3,
    category: "Representatividade",
    title: "As demandas da sua região são consideradas nas decisões da Convenção?",
    type: "options",
    options: [
      { label: "Sim", value: "sim" },
      { label: "Às vezes", value: "as_vezes" },
      { label: "Não", value: "nao" },
    ],
  },
  {
    id: 4,
    category: "Transparência",
    title: "Como você avalia a prestação de contas da Convenção?",
    type: "options",
    options: [
      { label: "Clara", value: "clara" },
      { label: "Parcial", value: "parcial" },
      { label: "Insuficiente", value: "insuficiente" },
      { label: "Não conheço", value: "nao_conheco" },
    ],
  },
  {
    id: 5,
    category: "Cuidado Ministerial",
    title: "Você se sente amparado pela Convenção em suas necessidades pessoais e ministeriais?",
    type: "options",
    options: [
      { label: "Sim", value: "sim" },
      { label: "Em parte", value: "em_parte" },
      { label: "Não", value: "nao" },
    ],
  },
  {
    id: 6,
    category: "Proximidade da Liderança",
    title: "Com que frequência sua região recebe visitas da diretoria da Convenção?",
    type: "options",
    options: [
      { label: "Frequente", value: "frequente" },
      { label: "Ocasional", value: "ocasional" },
      { label: "Rara", value: "rara" },
      { label: "Nunca", value: "nunca" },
    ],
  },
  {
    id: 7,
    category: "Capacitação",
    title: "A formação teológica e ministerial oferecida pela Convenção atende às suas necessidades?",
    type: "options",
    options: [
      { label: "Sim", value: "sim" },
      { label: "Em parte", value: "em_parte" },
      { label: "Não", value: "nao" },
    ],
  },
  {
    id: 8,
    category: "Espaço Aberto",
    title: "Espaço livre: deixe aqui sua sugestão, crítica ou observação para a Convenção.",
    type: "textarea",
    helper: "Sua mensagem é anônima e será analisada com total confidencialidade pela diretoria.",
    optional: true,
  },
];

// Compatibilidade de export para evitar quebras em outros imports
export const SURVEY_QUESTIONS = OFFICIAL_SURVEY_QUESTIONS;
