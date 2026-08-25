import {
  BookOpenText,
  Broadcast,
  Church,
  CloudArrowDown,
  Folders,
  MonitorPlay,
  MusicNotes,
  Palette,
  ShieldCheck,
  Sparkle,
  Television,
  WifiSlash,
} from "@phosphor-icons/react";

export const checkoutUrl = "https://pay.hotmart.com/H106580171W";
export const demoUrl = "#demo";
export const whatsappUrl =
  "https://wa.me/5531998268940?text=Ol%C3%A1%2C%20quero%20conhecer%20a%20B%C3%ADblia%20Verbo%20para%20igreja.";

export const benefits = [
  "Tela exclusiva para TV ou projetor",
  "Logo e nome da sua igreja na tela",
  "Harpa Cristã com os 640 hinos completos",
  "Departamentos com apresentações próprias",
  "Modelo Preview/Programa, como um switcher profissional",
  "Funciona 100% offline, direto no Windows",
];

// Faixa de destaques logo abaixo do hero, como no design de referência
export const featureStrip = [
  { icon: Television, label: "Tela exclusiva para TV/projetor" },
  { icon: MusicNotes, label: "Harpa Cristã · 640 hinos" },
  { icon: Folders, label: "Departamentos com slides" },
  { icon: WifiSlash, label: "100% offline no Windows" },
];

export const trustBadges = [
  "Garantia incondicional de 7 dias",
  "Ativação imediata após a compra",
  "Suporte em português",
];

export const features = [
  {
    icon: BookOpenText,
    title: "Bíblia pronta para o culto",
    description:
      "Navegue entre livros, capítulos e versículos com uma interface pensada para quem opera a projeção durante a reunião — sem menus confusos, sem improviso.",
  },
  {
    icon: MusicNotes,
    title: "Harpa Cristã completa",
    description:
      "Os 640 hinos da Harpa Cristã prontos para apresentar, com estrofes e coro intercalados automaticamente na ordem certa.",
  },
  {
    icon: Folders,
    title: "Departamentos e apresentações próprias",
    description:
      "Crie pastas como Jovens, Louvor ou Crianças e monte apresentações de texto com um editor visual — fundo, cor e alinhamento do jeito que a sua igreja usa.",
  },
  {
    icon: Broadcast,
    title: "Tela Ao vivo, buscar e apresentar",
    description:
      "Busque uma referência, um hino ou uma apresentação num só lugar e coloque no ar em segundos — sem trocar de tela no meio do culto.",
  },
  {
    icon: Television,
    title: "Apresentação em tela separada",
    description:
      "Abra a visualização na TV, projetor ou telão enquanto mantém o controle completo na tela do operador. A congregação só vê o que deve ver.",
  },
  {
    icon: Palette,
    title: "A identidade da sua igreja",
    description:
      "Configure nome, logo e tema visual uma única vez. Cada slide projetado carrega a marca da congregação, com elegância e sobriedade.",
  },
  {
    icon: CloudArrowDown,
    title: "4 versões da Bíblia, sempre à mão",
    description:
      "Almeida Corrigida Fiel, Almeida Revista e Atualizada, Almeida Revisada Imprensa Bíblica e NVI. Baixe a versão que a sua igreja usa e tenha ela disponível offline, sem depender da internet do templo.",
  },
  {
    icon: MonitorPlay,
    title: "Preview e Programa separados",
    description:
      "Prepare o próximo slide no Preview e só ele vai para a tela quando você manda — o mesmo modelo dos softwares profissionais de projeção.",
  },
  {
    icon: ShieldCheck,
    title: "Licença sem mensalidade",
    description:
      "Pagamento único por licença, com ativação imediata. Sem assinatura escondida, sem cobrança recorrente surpreendendo a tesouraria.",
  },
];

export const workflow = [
  {
    step: "01",
    title: "Encontre o conteúdo",
    description:
      "Digite a referência, o número do hino ou o nome da apresentação na tela Ao vivo. O conteúdo certo aparece em poucos cliques.",
  },
  {
    step: "02",
    title: "Prepare no Preview",
    description:
      "O próximo slide fica pronto no Preview, só visível para o operador, com o tema da igreja já aplicado.",
  },
  {
    step: "03",
    title: "Coloque no ar",
    description:
      "Um clique manda para o Programa e para a TV ou projetor. A congregação acompanha a Palavra com clareza enquanto você controla tudo em silêncio.",
  },
];

export const bibleVersions = [
  { code: "AA", name: "Almeida Revisada Imprensa Bíblica", offline: false },
  { code: "ACF", name: "Almeida Corrigida Fiel", offline: true },
  { code: "ARA", name: "Almeida Revista e Atualizada", offline: false },
  { code: "NVI", name: "Nova Versão Internacional", offline: false },
];

export const useCases = [
  { icon: Church, title: "Culto de domingo" },
  { icon: BookOpenText, title: "Escola Bíblica" },
  { icon: Sparkle, title: "Santa Ceia" },
  { icon: MusicNotes, title: "Ensaio de louvor" },
  { icon: Folders, title: "Reunião de departamento" },
  { icon: Broadcast, title: "Congressos e conferências" },
];

export const offer = {
  name: "Licença Completa",
  price: "R$ 297",
  priceNote: "pagamento único · sem mensalidade",
  description:
    "Tudo o que sua igreja precisa para projetar a Palavra com excelência, em um único investimento.",
  items: [
    "Bíblia completa, offline, no Windows",
    "4 versões para baixar: ACF, ARA, AA e NVI",
    "Harpa Cristã com os 640 hinos",
    "Departamentos com apresentações próprias",
    "Tela Ao vivo com modelo Preview/Programa",
    "Personalização com logo e nome da igreja",
    "4 temas de apresentação",
    "Atualizações por 1 ano",
    "Suporte prioritário via WhatsApp",
    "Ativação imediata após a compra",
  ],
};

export const faqs = [
  {
    question: "Funciona sem internet?",
    answer:
      "Sim. Depois de instalada e com a Bíblia baixada, a Bíblia Verbo funciona 100% offline — ideal para igrejas onde a internet oscila ou nem chega. O culto nunca fica refém da conexão.",
  },
  {
    question: "Posso usar em TV, projetor ou telão?",
    answer:
      "Sim. A Bíblia Verbo foi criada exatamente para isso: ela abre uma janela de apresentação dedicada na segunda tela, detectando automaticamente o monitor externo, enquanto o operador mantém o controle na tela principal.",
  },
  {
    question: "Tem a Harpa Cristã?",
    answer:
      "Tem, completa: os 640 hinos, com estrofes e coro intercalados automaticamente na ordem certa para apresentar como qualquer versículo.",
  },
  {
    question: "Dá para criar apresentações próprias, além da Bíblia e da Harpa?",
    answer:
      "Sim. Você cria departamentos (Jovens, Louvor, Crianças etc.) e monta apresentações de texto com um editor visual — fundo, cor e alinhamento do slide, do jeito que a sua igreja usa.",
  },
  {
    question: "Dá para colocar o logo e o nome da minha igreja?",
    answer:
      "Sim. Na primeira configuração você define logo, nome da congregação e tema visual. A partir daí, toda apresentação carrega a identidade da sua igreja automaticamente.",
  },
  {
    question: "Preciso pagar mensalidade?",
    answer:
      "Não. A licença é de pagamento único. Você paga uma vez e usa — sem assinatura, sem cobrança recorrente.",
  },
  {
    question: "E se eu comprar e não gostar?",
    answer:
      "Você tem 7 dias de garantia incondicional. Se a Bíblia Verbo não atender à sua igreja, basta pedir o reembolso dentro do prazo e devolvemos 100% do valor.",
  },
  {
    question: "É difícil de instalar e configurar?",
    answer:
      "Não. A instalação leva poucos minutos e a configuração inicial é guiada. Qualquer voluntário da equipe de mídia consegue operar já no primeiro culto.",
  },
];

export const comparisonRows = [
  ["Feita para projeção em igrejas", false, true],
  ["Harpa Cristã completa incluída", false, true],
  ["Departamentos com apresentações próprias", false, true],
  ["Modelo Preview/Programa", false, true],
  ["Logo e nome da igreja na tela", false, true],
  ["Funciona offline no Windows", "às vezes", true],
  ["Pagamento único, sem mensalidade", false, true],
];
