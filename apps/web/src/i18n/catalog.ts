export const supportedLocales = ['en', 'ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'] as const
export type Locale = (typeof supportedLocales)[number]

export const localizedLocales = supportedLocales.filter((locale) => locale !== 'en') as Exclude<
  Locale,
  'en'
>[]

// Only native-reviewed locales belong in search indexes. Other locales remain fully usable technical betas.
export const indexedLocales: Locale[] = ['en']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-cn': '简体中文',
  es: 'Español',
  'pt-br': 'Português (Brasil)',
  de: 'Deutsch',
  fr: 'Français',
}

export function localePath(locale: Locale, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return locale === 'en' ? normalized : `/${locale}${normalized}`
}

export const layoutMessages = {
  en: {
    tools: 'Tools',
    method: 'Method',
    privacy: 'Privacy',
    workspace: 'Workspace',
    desktop: 'Desktop',
    localOnly: 'Local only',
    footer: 'Developer data tools that stay on your device.',
    footerNote: 'No account. No upload. No generative AI. No tracking ads.',
    language: 'Language',
    changelog: 'Changelog',
    about: 'About',
    skip: 'Skip to content',
    primary: 'Primary',
    home: 'decod.ing home',
    translationBeta: 'Translation beta',
  },
  ko: {
    tools: '도구',
    method: '방법론',
    privacy: '개인정보',
    workspace: '작업공간',
    desktop: '데스크톱',
    localOnly: '로컬 전용',
    footer: '개발자 데이터가 기기 밖으로 나가지 않는 도구입니다.',
    footerNote: '계정, 업로드, 생성형 AI, 추적 광고가 없습니다.',
    language: '언어',
    changelog: '변경 기록',
    about: '소개',
    skip: '본문으로 건너뛰기',
    primary: '주 탐색',
    home: 'decod.ing 홈',
    translationBeta: '번역 베타',
  },
  ja: {
    tools: 'ツール',
    method: '検出方法',
    privacy: 'プライバシー',
    workspace: 'ワークスペース',
    desktop: 'デスクトップ',
    localOnly: 'ローカル専用',
    footer: '開発者データをデバイス内に保つツールです。',
    footerNote: 'アカウント、アップロード、生成 AI、トラッキング広告はありません。',
    language: '言語',
    changelog: '更新履歴',
    about: 'このサイトについて',
    skip: '本文へ移動',
    primary: 'メインナビゲーション',
    home: 'decod.ing ホーム',
    translationBeta: '翻訳ベータ',
  },
  'zh-cn': {
    tools: '工具',
    method: '方法',
    privacy: '隐私',
    workspace: '工作区',
    desktop: '桌面版',
    localOnly: '仅本地',
    footer: '让开发者数据始终留在您设备上的工具。',
    footerNote: '无需账户、无上传、无生成式 AI、无追踪广告。',
    language: '语言',
    changelog: '更新日志',
    about: '关于',
    skip: '跳至正文',
    primary: '主导航',
    home: 'decod.ing 首页',
    translationBeta: '翻译测试版',
  },
  es: {
    tools: 'Herramientas',
    method: 'Método',
    privacy: 'Privacidad',
    workspace: 'Espacio local',
    desktop: 'Escritorio',
    localOnly: 'Solo local',
    footer: 'Herramientas para datos de desarrollo que permanecen en tu dispositivo.',
    footerNote: 'Sin cuenta, subidas, IA generativa ni anuncios de seguimiento.',
    language: 'Idioma',
    changelog: 'Cambios',
    about: 'Acerca de',
    skip: 'Saltar al contenido',
    primary: 'Navegación principal',
    home: 'Inicio de decod.ing',
    translationBeta: 'Traducción beta',
  },
  'pt-br': {
    tools: 'Ferramentas',
    method: 'Método',
    privacy: 'Privacidade',
    workspace: 'Espaço local',
    desktop: 'Desktop',
    localOnly: 'Somente local',
    footer: 'Ferramentas para dados de desenvolvimento que ficam no seu dispositivo.',
    footerNote: 'Sem conta, upload, IA generativa ou anúncios de rastreamento.',
    language: 'Idioma',
    changelog: 'Novidades',
    about: 'Sobre',
    skip: 'Ir para o conteúdo',
    primary: 'Navegação principal',
    home: 'Início do decod.ing',
    translationBeta: 'Tradução beta',
  },
  de: {
    tools: 'Tools',
    method: 'Methode',
    privacy: 'Datenschutz',
    workspace: 'Arbeitsbereich',
    desktop: 'Desktop',
    localOnly: 'Nur lokal',
    footer: 'Entwicklerwerkzeuge, bei denen Daten auf Ihrem Gerät bleiben.',
    footerNote: 'Kein Konto, Upload, generative KI oder Tracking-Werbung.',
    language: 'Sprache',
    changelog: 'Änderungen',
    about: 'Über uns',
    skip: 'Zum Inhalt springen',
    primary: 'Hauptnavigation',
    home: 'decod.ing Startseite',
    translationBeta: 'Übersetzung Beta',
  },
  fr: {
    tools: 'Outils',
    method: 'Méthode',
    privacy: 'Confidentialité',
    workspace: 'Espace local',
    desktop: 'Bureau',
    localOnly: '100 % local',
    footer: 'Des outils de développement qui gardent vos données sur votre appareil.',
    footerNote: 'Sans compte, transfert, IA générative ni publicité de suivi.',
    language: 'Langue',
    changelog: 'Nouveautés',
    about: 'À propos',
    skip: 'Aller au contenu',
    primary: 'Navigation principale',
    home: 'Accueil decod.ing',
    translationBeta: 'Traduction bêta',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type HomeMessages = {
  title: string
  description: string
  eyebrow: string
  heading: string
  intro: string
  detectorCount: string
  utilityCount: string
  uploaded: string
  principles: string
  autoTitle: string
  autoBody: string
  chainTitle: string
  chainBody: string
  confidenceTitle: string
  confidenceBody: string
  sensitive: string
  workbench: string
  evidenceTitle: string
  evidenceBody: string
  warningTitle: string
  warningBody: string
  toolsTitle: string
  toolsBody: string
  toolsLink: string
}

export const homeMessages: Record<Locale, HomeMessages> = {
  en: {
    title: 'decod.ing — Universal decoder that runs on your device',
    description:
      'Detect, decode, inspect, and convert developer data on your device. 47 tools, no account or upload.',
    eyebrow: 'Zero-account universal decoder',
    heading: 'Paste anything.\nSee what it is.',
    intro:
      'Detect opaque values, follow nested encoding layers, and inspect deterministic warnings. Everything runs on this device.',
    detectorCount: 'smart detectors',
    utilityCount: 'local utilities',
    uploaded: 'bytes uploaded',
    principles: 'Product principles',
    autoTitle: 'Auto-detect',
    autoBody: 'No format picker before you start.',
    chainTitle: 'Recursive chain',
    chainBody: 'Base64 → gzip → JSON in one view.',
    confidenceTitle: 'Honest confidence',
    confidenceBody: 'Ambiguous candidates stay visible.',
    sensitive: 'Built for sensitive debugging',
    workbench: 'A local workbench, not another upload form.',
    evidenceTitle: 'Format evidence',
    evidenceBody: 'Every candidate shows confidence and the evidence that produced it.',
    warningTitle: 'Deterministic warnings',
    warningBody:
      'Rules explain expired tokens, unverified signatures, and safety limits without an LLM.',
    toolsTitle: 'Purpose-built tools',
    toolsBody: 'Format, convert, inspect, generate, and encode with 47 dedicated local operations.',
    toolsLink: 'Explore all tools →',
  },
  ko: {
    title: 'decod.ing — 기기에서 실행되는 범용 디코더',
    description:
      '개발자 데이터를 기기에서 감지·디코딩·검사·변환하세요. 47개 도구, 계정과 업로드 없음.',
    eyebrow: '계정 없는 범용 디코더',
    heading: '무엇이든 붙여넣고,\n형식을 확인하세요.',
    intro:
      '불투명한 값을 감지하고 중첩 인코딩을 따라가며 규칙 기반 경고를 확인합니다. 모든 처리는 이 기기에서 실행됩니다.',
    detectorCount: '스마트 감지기',
    utilityCount: '로컬 도구',
    uploaded: '업로드된 바이트',
    principles: '제품 원칙',
    autoTitle: '자동 감지',
    autoBody: '시작 전에 형식을 고를 필요가 없습니다.',
    chainTitle: '재귀 체인',
    chainBody: 'Base64 → gzip → JSON을 한 화면에서 확인합니다.',
    confidenceTitle: '정직한 신뢰도',
    confidenceBody: '모호한 후보도 숨기지 않습니다.',
    sensitive: '민감한 디버깅을 위해 설계됨',
    workbench: '또 하나의 업로드 폼이 아닌 로컬 작업대입니다.',
    evidenceTitle: '형식 근거',
    evidenceBody: '각 후보의 신뢰도와 판정 근거를 표시합니다.',
    warningTitle: '결정론적 경고',
    warningBody: 'LLM 없이 만료 토큰, 미검증 서명, 안전 제한을 규칙으로 설명합니다.',
    toolsTitle: '용도별 도구',
    toolsBody: '47개 로컬 작업으로 포맷·변환·검사·생성·인코딩을 처리합니다.',
    toolsLink: '모든 도구 보기 →',
  },
  ja: {
    title: 'decod.ing — デバイスで動くユニバーサルデコーダー',
    description:
      '開発者データをデバイス上で検出、デコード、検査、変換。47 ツール、アカウントもアップロードも不要です。',
    eyebrow: 'アカウント不要のユニバーサルデコーダー',
    heading: '何でも貼り付けて、\n中身を確認。',
    intro:
      '不透明な値を検出し、多重エンコードを追跡し、決定論的な警告を検査します。すべてこのデバイス上で実行されます。',
    detectorCount: 'スマート検出器',
    utilityCount: 'ローカルツール',
    uploaded: '送信バイト',
    principles: '製品原則',
    autoTitle: '自動検出',
    autoBody: '開始前の形式選択は不要です。',
    chainTitle: '再帰チェーン',
    chainBody: 'Base64 → gzip → JSON を 1 画面で追跡します。',
    confidenceTitle: '正直な信頼度',
    confidenceBody: '曖昧な候補も隠さず表示します。',
    sensitive: '機密データのデバッグのために',
    workbench: 'アップロードフォームではなく、ローカルの作業台です。',
    evidenceTitle: '形式の根拠',
    evidenceBody: 'すべての候補に信頼度と判定根拠を表示します。',
    warningTitle: '決定論的な警告',
    warningBody: 'LLM を使わず、期限切れトークン、未検証の署名、安全上限をルールで説明します。',
    toolsTitle: '用途別ツール',
    toolsBody: '47 個のローカル処理で、整形、変換、検査、生成、エンコードを実行します。',
    toolsLink: 'すべてのツールを見る →',
  },
  'zh-cn': {
    title: 'decod.ing — 在您设备上运行的通用解码器',
    description: '在设备上检测、解码、检查和转换开发者数据。47 个工具，无需账户或上传。',
    eyebrow: '无需账户的通用解码器',
    heading: '粘贴任意内容，\n立即识别格式。',
    intro: '检测不透明值、跟踪嵌套编码层并检查确定性警告。所有处理均在此设备上完成。',
    detectorCount: '智能检测器',
    utilityCount: '本地工具',
    uploaded: '上传字节',
    principles: '产品原则',
    autoTitle: '自动检测',
    autoBody: '开始前无需选择格式。',
    chainTitle: '递归链',
    chainBody: '在一个视图中跟踪 Base64 → gzip → JSON。',
    confidenceTitle: '诚实的置信度',
    confidenceBody: '始终显示有歧义的候选项。',
    sensitive: '专为敏感调试而设计',
    workbench: '这是本地工作台，而不是另一个上传表单。',
    evidenceTitle: '格式证据',
    evidenceBody: '每个候选项都会显示置信度和判定依据。',
    warningTitle: '确定性警告',
    warningBody: '无需 LLM，通过规则解释过期令牌、未验证签名和安全限制。',
    toolsTitle: '专用工具',
    toolsBody: '47 项本地操作，用于格式化、转换、检查、生成和编码。',
    toolsLink: '查看所有工具 →',
  },
  es: {
    title: 'decod.ing — Decodificador universal en tu dispositivo',
    description:
      'Detecta, decodifica, inspecciona y convierte datos de desarrollo en tu dispositivo. 47 herramientas, sin cuenta ni subidas.',
    eyebrow: 'Decodificador universal sin cuenta',
    heading: 'Pega cualquier cosa.\nDescubre qué es.',
    intro:
      'Detecta valores opacos, sigue capas de codificación anidadas y revisa advertencias deterministas. Todo se ejecuta en este dispositivo.',
    detectorCount: 'detectores inteligentes',
    utilityCount: 'utilidades locales',
    uploaded: 'bytes subidos',
    principles: 'Principios del producto',
    autoTitle: 'Detección automática',
    autoBody: 'No necesitas elegir un formato antes de empezar.',
    chainTitle: 'Cadena recursiva',
    chainBody: 'Base64 → gzip → JSON en una sola vista.',
    confidenceTitle: 'Confianza honesta',
    confidenceBody: 'Los candidatos ambiguos permanecen visibles.',
    sensitive: 'Diseñado para depuración sensible',
    workbench: 'Un banco de trabajo local, no otro formulario de subida.',
    evidenceTitle: 'Evidencia del formato',
    evidenceBody: 'Cada candidato muestra su confianza y las evidencias que lo produjeron.',
    warningTitle: 'Advertencias deterministas',
    warningBody:
      'Las reglas explican tokens caducados, firmas no verificadas y límites de seguridad sin un LLM.',
    toolsTitle: 'Herramientas especializadas',
    toolsBody: 'Formatea, convierte, inspecciona, genera y codifica con 47 operaciones locales.',
    toolsLink: 'Ver todas las herramientas →',
  },
  'pt-br': {
    title: 'decod.ing — Decodificador universal no seu dispositivo',
    description:
      'Detecte, decodifique, inspecione e converta dados de desenvolvimento no seu dispositivo. 47 ferramentas, sem conta ou upload.',
    eyebrow: 'Decodificador universal sem conta',
    heading: 'Cole qualquer coisa.\nDescubra o formato.',
    intro:
      'Detecte valores opacos, siga camadas de codificação e veja alertas determinísticos. Tudo roda neste dispositivo.',
    detectorCount: 'detectores inteligentes',
    utilityCount: 'utilitários locais',
    uploaded: 'bytes enviados',
    principles: 'Princípios do produto',
    autoTitle: 'Detecção automática',
    autoBody: 'Não é preciso escolher o formato antes de começar.',
    chainTitle: 'Cadeia recursiva',
    chainBody: 'Base64 → gzip → JSON em uma única tela.',
    confidenceTitle: 'Confiança honesta',
    confidenceBody: 'Candidatos ambíguos continuam visíveis.',
    sensitive: 'Feito para depuração sensível',
    workbench: 'Uma bancada local, não outro formulário de upload.',
    evidenceTitle: 'Evidência de formato',
    evidenceBody: 'Cada candidato mostra a confiança e as evidências usadas.',
    warningTitle: 'Alertas determinísticos',
    warningBody: 'Regras explicam tokens expirados, assinaturas não verificadas e limites sem LLM.',
    toolsTitle: 'Ferramentas especializadas',
    toolsBody: 'Formate, converta, inspecione, gere e codifique com 47 operações locais.',
    toolsLink: 'Ver todas as ferramentas →',
  },
  de: {
    title: 'decod.ing — Universeller Decoder auf Ihrem Gerät',
    description:
      'Entwicklerdaten auf Ihrem Gerät erkennen, decodieren, prüfen und konvertieren. 47 Tools, kein Konto oder Upload.',
    eyebrow: 'Universeller Decoder ohne Konto',
    heading: 'Alles einfügen.\nFormat erkennen.',
    intro:
      'Undurchsichtige Werte erkennen, verschachtelte Codierungen verfolgen und regelbasierte Warnungen prüfen. Alles läuft auf diesem Gerät.',
    detectorCount: 'intelligente Detektoren',
    utilityCount: 'lokale Tools',
    uploaded: 'hochgeladene Bytes',
    principles: 'Produktprinzipien',
    autoTitle: 'Automatisch erkennen',
    autoBody: 'Vor dem Start muss kein Format gewählt werden.',
    chainTitle: 'Rekursive Kette',
    chainBody: 'Base64 → gzip → JSON in einer Ansicht.',
    confidenceTitle: 'Ehrliche Konfidenz',
    confidenceBody: 'Mehrdeutige Kandidaten bleiben sichtbar.',
    sensitive: 'Für sensible Fehlersuche entwickelt',
    workbench: 'Eine lokale Werkbank statt eines weiteren Upload-Formulars.',
    evidenceTitle: 'Formatnachweise',
    evidenceBody: 'Jeder Kandidat zeigt Konfidenz und die zugrunde liegenden Nachweise.',
    warningTitle: 'Deterministische Warnungen',
    warningBody: 'Regeln erklären abgelaufene Token, ungeprüfte Signaturen und Limits ohne LLM.',
    toolsTitle: 'Spezialisierte Tools',
    toolsBody: 'Formatieren, konvertieren, prüfen, erzeugen und codieren mit 47 lokalen Vorgängen.',
    toolsLink: 'Alle Tools ansehen →',
  },
  fr: {
    title: 'decod.ing — Décodeur universel sur votre appareil',
    description:
      'Détectez, décodez, inspectez et convertissez des données de développement sur votre appareil. 47 outils, sans compte ni transfert.',
    eyebrow: 'Décodeur universel sans compte',
    heading: "Collez n'importe quoi.\nIdentifiez le format.",
    intro:
      "Détectez les valeurs opaques, suivez les couches d'encodage et examinez les avertissements déterministes. Tout s'exécute sur cet appareil.",
    detectorCount: 'détecteurs intelligents',
    utilityCount: 'outils locaux',
    uploaded: 'octets transférés',
    principles: 'Principes du produit',
    autoTitle: 'Détection automatique',
    autoBody: 'Aucun format à choisir avant de commencer.',
    chainTitle: 'Chaîne récursive',
    chainBody: 'Base64 → gzip → JSON dans une seule vue.',
    confidenceTitle: 'Confiance transparente',
    confidenceBody: 'Les candidats ambigus restent visibles.',
    sensitive: 'Conçu pour le débogage sensible',
    workbench: 'Un atelier local, pas un formulaire de transfert de plus.',
    evidenceTitle: 'Preuves de format',
    evidenceBody: 'Chaque candidat affiche son niveau de confiance et les preuves utilisées.',
    warningTitle: 'Avertissements déterministes',
    warningBody:
      'Des règles expliquent les jetons expirés, signatures non vérifiées et limites sans LLM.',
    toolsTitle: 'Outils spécialisés',
    toolsBody: 'Formatez, convertissez, inspectez, générez et encodez avec 47 opérations locales.',
    toolsLink: 'Voir tous les outils →',
  },
}

export type DetectorPageMessages = {
  back: string
  eyebrow: string
  evidenceTitle: string
  evidenceBody: string
  examplesEyebrow: string
  examplesTitle: string
  referencesEyebrow: string
  referencesTitle: string
  localDescription: (label: string) => string
}

export const detectorPageMessages: Record<Locale, DetectorPageMessages> = {
  en: {
    back: '← Detection methodology',
    eyebrow: 'Local detector',
    evidenceTitle: 'Evidence before guesses',
    evidenceBody:
      'Confidence and competing candidates stay visible. Detection never makes a network request.',
    examplesEyebrow: 'Safe examples',
    examplesTitle: 'Try synthetic inputs',
    referencesEyebrow: 'Specifications',
    referencesTitle: 'Detection references',
    localDescription: (label) =>
      `Detect and inspect ${label} locally without an account or upload.`,
  },
  ko: {
    back: '← 감지 방법론',
    eyebrow: '로컬 감지기',
    evidenceTitle: '추측보다 근거',
    evidenceBody: '신뢰도와 경쟁 후보를 모두 표시하며 네트워크 요청을 하지 않습니다.',
    examplesEyebrow: '안전한 예시',
    examplesTitle: '합성 입력 시도',
    referencesEyebrow: '명세',
    referencesTitle: '감지 참고 문서',
    localDescription: (label) => `${label}을(를) 계정과 업로드 없이 로컬에서 감지·검사합니다.`,
  },
  ja: {
    back: '← 検出方法',
    eyebrow: 'ローカル検出器',
    evidenceTitle: '推測より根拠',
    evidenceBody: '信頼度と競合候補を表示します。検出中にネットワーク通信は行いません。',
    examplesEyebrow: '安全な例',
    examplesTitle: '合成データで試す',
    referencesEyebrow: '仕様',
    referencesTitle: '検出の参考資料',
    localDescription: (label) =>
      `${label} をアカウントやアップロードなしでローカル検出・検査します。`,
  },
  'zh-cn': {
    back: '← 检测方法',
    eyebrow: '本地检测器',
    evidenceTitle: '证据优先于猜测',
    evidenceBody: '显示置信度和竞争候选项。检测绝不发起网络请求。',
    examplesEyebrow: '安全示例',
    examplesTitle: '尝试合成输入',
    referencesEyebrow: '规范',
    referencesTitle: '检测参考',
    localDescription: (label) => `无需账户或上传，在本地检测并检查 ${label}。`,
  },
  es: {
    back: '← Metodología de detección',
    eyebrow: 'Detector local',
    evidenceTitle: 'Evidencias antes que suposiciones',
    evidenceBody:
      'La confianza y los candidatos alternativos permanecen visibles. La detección nunca usa la red.',
    examplesEyebrow: 'Ejemplos seguros',
    examplesTitle: 'Prueba entradas sintéticas',
    referencesEyebrow: 'Especificaciones',
    referencesTitle: 'Referencias de detección',
    localDescription: (label) =>
      `Detecta e inspecciona ${label} localmente, sin cuenta ni subidas.`,
  },
  'pt-br': {
    back: '← Metodologia de detecção',
    eyebrow: 'Detector local',
    evidenceTitle: 'Evidências antes de suposições',
    evidenceBody:
      'A confiança e os candidatos alternativos permanecem visíveis. A detecção nunca usa a rede.',
    examplesEyebrow: 'Exemplos seguros',
    examplesTitle: 'Teste entradas sintéticas',
    referencesEyebrow: 'Especificações',
    referencesTitle: 'Referências de detecção',
    localDescription: (label) => `Detecte e inspecione ${label} localmente, sem conta ou upload.`,
  },
  de: {
    back: '← Erkennungsmethode',
    eyebrow: 'Lokaler Detektor',
    evidenceTitle: 'Nachweise statt Vermutungen',
    evidenceBody:
      'Konfidenz und alternative Kandidaten bleiben sichtbar. Die Erkennung greift nie auf das Netzwerk zu.',
    examplesEyebrow: 'Sichere Beispiele',
    examplesTitle: 'Synthetische Eingaben testen',
    referencesEyebrow: 'Spezifikationen',
    referencesTitle: 'Erkennungsreferenzen',
    localDescription: (label) => `${label} lokal ohne Konto oder Upload erkennen und prüfen.`,
  },
  fr: {
    back: '← Méthode de détection',
    eyebrow: 'Détecteur local',
    evidenceTitle: 'Des preuves avant les suppositions',
    evidenceBody:
      "Le niveau de confiance et les candidats concurrents restent visibles. La détection n'utilise jamais le réseau.",
    examplesEyebrow: 'Exemples sûrs',
    examplesTitle: 'Essayer des entrées synthétiques',
    referencesEyebrow: 'Spécifications',
    referencesTitle: 'Références de détection',
    localDescription: (label) =>
      `Détectez et inspectez ${label} localement, sans compte ni transfert.`,
  },
}

export type CatalogMessages = {
  title: string
  description: string
  eyebrow: string
  heading: string
  lead: string
  searchLabel: string
  searchPlaceholder: string
  of: string
  countSuffix: string
  recentEyebrow: string
  recentTitle: string
  category: string
  pack: string
  open: string
  empty: string
  addFavorite: string
  removeFavorite: string
}

export const catalogMessages: Record<Locale, CatalogMessages> = {
  en: {
    title: '47 local developer tools — decod.ing',
    description:
      'Format, convert, inspect, generate, encode, and decode with 47 privacy-first developer tools.',
    eyebrow: 'Complete local catalog',
    heading: '47 tools. One private workbench.',
    lead: 'Every tool runs on this device. Heavy parsers load only when you open them.',
    searchLabel: 'Search all 47 local tools',
    searchPlaceholder: 'format JSON, inspect JWT, generate UUID…',
    of: 'of',
    countSuffix: 'tools',
    recentEyebrow: 'Stored slugs only',
    recentTitle: 'Recent tools',
    category: 'Category',
    pack: 'Pack',
    open: 'Open tool →',
    empty: 'No matching tool. Try a format, action, or alias.',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
  },
  ko: {
    title: '47개 로컬 개발자 도구 — decod.ing',
    description: '개인정보를 우선하는 47개 도구로 포맷·변환·검사·생성·인코딩·디코딩하세요.',
    eyebrow: '전체 로컬 목록',
    heading: '47개 도구, 하나의 개인 작업대.',
    lead: '모든 도구는 이 기기에서 실행되며 무거운 파서는 열 때만 로드됩니다.',
    searchLabel: '47개 로컬 도구 검색',
    searchPlaceholder: 'JSON 포맷, JWT 검사, UUID 생성…',
    of: '/',
    countSuffix: '개 도구',
    recentEyebrow: '도구 ID만 저장',
    recentTitle: '최근 도구',
    category: '카테고리',
    pack: '팩',
    open: '도구 열기 →',
    empty: '일치하는 도구가 없습니다. 형식, 작업, 별칭으로 검색해 보세요.',
    addFavorite: '즐겨찾기에 추가',
    removeFavorite: '즐겨찾기에서 제거',
  },
  ja: {
    title: '47 個のローカル開発ツール — decod.ing',
    description: 'プライバシー重視の 47 ツールで整形、変換、検査、生成、エンコード、デコード。',
    eyebrow: 'すべてのローカルツール',
    heading: '47 ツール、1 つのプライベート作業台。',
    lead: 'すべてこのデバイス上で実行。重いパーサーは必要なときだけ読み込みます。',
    searchLabel: '47 個のローカルツールを検索',
    searchPlaceholder: 'JSON 整形、JWT 検査、UUID 生成…',
    of: '/',
    countSuffix: 'ツール',
    recentEyebrow: 'ツール ID のみ保存',
    recentTitle: '最近のツール',
    category: 'カテゴリー',
    pack: 'パック',
    open: 'ツールを開く →',
    empty: '一致するツールがありません。形式、操作、別名で検索してください。',
    addFavorite: 'お気に入りに追加',
    removeFavorite: 'お気に入りから削除',
  },
  'zh-cn': {
    title: '47 个本地开发者工具 — decod.ing',
    description: '使用 47 个隐私优先的开发工具进行格式化、转换、检查、生成、编码和解码。',
    eyebrow: '完整本地目录',
    heading: '47 个工具，一个私密工作台。',
    lead: '每个工具都在此设备上运行，大型解析器仅在打开时加载。',
    searchLabel: '搜索全部 47 个本地工具',
    searchPlaceholder: '格式化 JSON、检查 JWT、生成 UUID…',
    of: '/',
    countSuffix: '个工具',
    recentEyebrow: '仅保存工具 ID',
    recentTitle: '最近工具',
    category: '类别',
    pack: '工具包',
    open: '打开工具 →',
    empty: '没有匹配的工具。请尝试格式、操作或别名。',
    addFavorite: '添加到收藏',
    removeFavorite: '从收藏中移除',
  },
  es: {
    title: '47 herramientas locales para desarrollo — decod.ing',
    description:
      'Formatea, convierte, inspecciona, genera, codifica y decodifica con 47 herramientas privadas.',
    eyebrow: 'Catálogo local completo',
    heading: '47 herramientas. Un espacio privado.',
    lead: 'Cada herramienta se ejecuta en este dispositivo. Los analizadores pesados solo cargan al abrirlos.',
    searchLabel: 'Buscar en las 47 herramientas locales',
    searchPlaceholder: 'formatear JSON, inspeccionar JWT, generar UUID…',
    of: 'de',
    countSuffix: 'herramientas',
    recentEyebrow: 'Solo se guardan identificadores',
    recentTitle: 'Herramientas recientes',
    category: 'Categoría',
    pack: 'Paquete',
    open: 'Abrir herramienta →',
    empty: 'No hay coincidencias. Prueba un formato, acción o alias.',
    addFavorite: 'Añadir a favoritos',
    removeFavorite: 'Quitar de favoritos',
  },
  'pt-br': {
    title: '47 ferramentas locais para desenvolvimento — decod.ing',
    description:
      'Formate, converta, inspecione, gere, codifique e decodifique com 47 ferramentas privadas.',
    eyebrow: 'Catálogo local completo',
    heading: '47 ferramentas. Uma bancada privada.',
    lead: 'Cada ferramenta roda neste dispositivo. Analisadores pesados carregam somente ao abrir.',
    searchLabel: 'Pesquisar nas 47 ferramentas locais',
    searchPlaceholder: 'formatar JSON, inspecionar JWT, gerar UUID…',
    of: 'de',
    countSuffix: 'ferramentas',
    recentEyebrow: 'Somente IDs são salvos',
    recentTitle: 'Ferramentas recentes',
    category: 'Categoria',
    pack: 'Pacote',
    open: 'Abrir ferramenta →',
    empty: 'Nenhuma ferramenta encontrada. Tente um formato, ação ou apelido.',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover dos favoritos',
  },
  de: {
    title: '47 lokale Entwickler-Tools — decod.ing',
    description:
      'Formatieren, konvertieren, prüfen, erzeugen, codieren und decodieren mit 47 datenschutzfreundlichen Tools.',
    eyebrow: 'Vollständiger lokaler Katalog',
    heading: '47 Tools. Eine private Werkbank.',
    lead: 'Jedes Tool läuft auf diesem Gerät. Große Parser laden erst beim Öffnen.',
    searchLabel: 'Alle 47 lokalen Tools durchsuchen',
    searchPlaceholder: 'JSON formatieren, JWT prüfen, UUID erzeugen…',
    of: 'von',
    countSuffix: 'Tools',
    recentEyebrow: 'Nur Tool-IDs gespeichert',
    recentTitle: 'Zuletzt verwendet',
    category: 'Kategorie',
    pack: 'Paket',
    open: 'Tool öffnen →',
    empty: 'Kein passendes Tool. Versuchen Sie Format, Aktion oder Alias.',
    addFavorite: 'Zu Favoriten hinzufügen',
    removeFavorite: 'Aus Favoriten entfernen',
  },
  fr: {
    title: '47 outils de développement locaux — decod.ing',
    description:
      'Formatez, convertissez, inspectez, générez, encodez et décodez avec 47 outils respectueux de la vie privée.',
    eyebrow: 'Catalogue local complet',
    heading: '47 outils. Un atelier privé.',
    lead: "Chaque outil s'exécute sur cet appareil. Les analyseurs lourds ne chargent qu'à l'ouverture.",
    searchLabel: 'Rechercher parmi les 47 outils locaux',
    searchPlaceholder: 'formater JSON, inspecter JWT, générer UUID…',
    of: 'sur',
    countSuffix: 'outils',
    recentEyebrow: 'Seuls les identifiants sont stockés',
    recentTitle: 'Outils récents',
    category: 'Catégorie',
    pack: 'Pack',
    open: "Ouvrir l'outil →",
    empty: 'Aucun outil correspondant. Essayez un format, une action ou un alias.',
    addFavorite: 'Ajouter aux favoris',
    removeFavorite: 'Retirer des favoris',
  },
}

export type ToolPageMessages = {
  description: (name: string) => string
  back: string
  localUtility: string
  pack: string
  runsHere: string
  trustBody: string
  howEyebrow: string
  howTitle: string
  operationBody: (profile: string) => string
  boundaryEyebrow: string
  boundaryTitle: string
  previewBoundary: string
  parserBoundary: string
  transformBoundary: string
}

export const toolPageMessages: Record<Locale, ToolPageMessages> = {
  en: {
    description: (name) => `Use ${name} locally with no account or upload.`,
    back: '← All 47 tools',
    localUtility: 'Local utility',
    pack: 'Utility Pack',
    runsHere: 'Runs on this device',
    trustBody: 'No account, upload, telemetry, or server processing.',
    howEyebrow: 'How it works',
    howTitle: 'Purpose-built and deterministic.',
    operationBody: (profile) =>
      `Input is passed to a local ${profile} operation inside a dedicated Web Worker. The result stays on this page and is never placed in a URL, request, log, or analytics event.`,
    boundaryEyebrow: 'Safety boundary',
    boundaryTitle: 'Input is data, never authority.',
    previewBoundary:
      'Preview output is sandboxed with scripts, forms, navigation, downloads, and network blocked.',
    parserBoundary:
      'The parser has bounded input and cannot execute templates, commands, files, or network calls.',
    transformBoundary:
      'The operation is a pure local transformation with no OS or network capability.',
  },
  ko: {
    description: (name) => `${name}을(를) 계정과 업로드 없이 로컬에서 사용하세요.`,
    back: '← 47개 도구 전체',
    localUtility: '로컬 도구',
    pack: '도구 팩',
    runsHere: '이 기기에서 실행',
    trustBody: '계정, 업로드, 텔레메트리, 서버 처리가 없습니다.',
    howEyebrow: '작동 방식',
    howTitle: '용도에 맞게 설계된 결정론적 처리.',
    operationBody: (profile) =>
      `입력은 전용 Web Worker의 로컬 ${profile} 작업으로 전달됩니다. 결과는 이 페이지에만 남으며 URL·요청·로그·분석 이벤트에 들어가지 않습니다.`,
    boundaryEyebrow: '안전 경계',
    boundaryTitle: '입력은 데이터일 뿐, 권한이 아닙니다.',
    previewBoundary:
      '미리보기는 스크립트·폼·탐색·다운로드·네트워크를 차단한 샌드박스에서 표시됩니다.',
    parserBoundary: '파서는 제한된 입력만 받고 템플릿·명령·파일·네트워크를 실행할 수 없습니다.',
    transformBoundary: '운영체제나 네트워크 권한이 없는 순수 로컬 변환입니다.',
  },
  ja: {
    description: (name) => `${name} をアカウントやアップロードなしでローカル実行します。`,
    back: '← 47 ツール一覧',
    localUtility: 'ローカルツール',
    pack: 'ツールパック',
    runsHere: 'このデバイスで実行',
    trustBody: 'アカウント、アップロード、テレメトリ、サーバー処理はありません。',
    howEyebrow: '動作方法',
    howTitle: '専用設計の決定論的な処理。',
    operationBody: (profile) =>
      `入力は専用 Web Worker 内のローカル ${profile} 処理に渡されます。結果はこのページにのみ返され、URL、リクエスト、ログ、分析イベントには含まれません。`,
    boundaryEyebrow: '安全境界',
    boundaryTitle: '入力はデータであり、権限ではありません。',
    previewBoundary:
      'プレビューはサンドボックス内で表示され、スクリプト、フォーム、移動、ダウンロード、通信を禁止します。',
    parserBoundary:
      'パーサーの入力は制限され、テンプレート、コマンド、ファイル、通信は実行できません。',
    transformBoundary: 'OS やネットワーク権限を持たない、純粋なローカル変換です。',
  },
  'zh-cn': {
    description: (name) => `无需账户或上传，在本地使用 ${name}。`,
    back: '← 全部 47 个工具',
    localUtility: '本地工具',
    pack: '工具包',
    runsHere: '在此设备上运行',
    trustBody: '无需账户，无上传、遥测或服务器处理。',
    howEyebrow: '工作原理',
    howTitle: '专用且确定的处理。',
    operationBody: (profile) =>
      `输入会传递给专用 Web Worker 中的本地 ${profile} 操作。结果仅返回此页面，不会写入 URL、请求、日志或分析事件。`,
    boundaryEyebrow: '安全边界',
    boundaryTitle: '输入只是数据，绝非权限。',
    previewBoundary: '预览在沙箱中显示，禁止脚本、表单、导航、下载和网络。',
    parserBoundary: '解析器输入受限，无法执行模板、命令、文件或网络调用。',
    transformBoundary: '这是无操作系统或网络权限的纯本地转换。',
  },
  es: {
    description: (name) => `Usa ${name} localmente, sin cuenta ni subidas.`,
    back: '← Las 47 herramientas',
    localUtility: 'Utilidad local',
    pack: 'Paquete',
    runsHere: 'Se ejecuta en este dispositivo',
    trustBody: 'Sin cuenta, subidas, telemetría ni proceso en servidor.',
    howEyebrow: 'Cómo funciona',
    howTitle: 'Especializado y determinista.',
    operationBody: (profile) =>
      `La entrada pasa a una operación local ${profile} en un Web Worker dedicado. El resultado permanece en esta página y no entra en URL, solicitudes, registros ni eventos.`,
    boundaryEyebrow: 'Límite de seguridad',
    boundaryTitle: 'La entrada es un dato, nunca una autoridad.',
    previewBoundary:
      'La vista previa está aislada y bloquea scripts, formularios, navegación, descargas y red.',
    parserBoundary:
      'El analizador limita la entrada y no puede ejecutar plantillas, comandos, archivos ni red.',
    transformBoundary: 'Es una transformación local pura, sin acceso al sistema ni a la red.',
  },
  'pt-br': {
    description: (name) => `Use ${name} localmente, sem conta ou upload.`,
    back: '← Todas as 47 ferramentas',
    localUtility: 'Utilitário local',
    pack: 'Pacote',
    runsHere: 'Roda neste dispositivo',
    trustBody: 'Sem conta, upload, telemetria ou processamento no servidor.',
    howEyebrow: 'Como funciona',
    howTitle: 'Especializado e determinístico.',
    operationBody: (profile) =>
      `A entrada passa para uma operação local ${profile} em um Web Worker dedicado. O resultado fica nesta página e nunca entra em URL, solicitações, logs ou eventos.`,
    boundaryEyebrow: 'Limite de segurança',
    boundaryTitle: 'A entrada é dado, nunca autoridade.',
    previewBoundary:
      'A visualização é isolada e bloqueia scripts, formulários, navegação, downloads e rede.',
    parserBoundary:
      'O analisador limita a entrada e não executa modelos, comandos, arquivos ou rede.',
    transformBoundary: 'Uma transformação local pura, sem acesso ao sistema ou rede.',
  },
  de: {
    description: (name) => `${name} lokal ohne Konto oder Upload verwenden.`,
    back: '← Alle 47 Tools',
    localUtility: 'Lokales Tool',
    pack: 'Tool-Paket',
    runsHere: 'Läuft auf diesem Gerät',
    trustBody: 'Kein Konto, Upload, Telemetrie oder Serververarbeitung.',
    howEyebrow: 'Funktionsweise',
    howTitle: 'Spezialisiert und deterministisch.',
    operationBody: (profile) =>
      `Die Eingabe geht an einen lokalen ${profile}-Vorgang in einem eigenen Web Worker. Das Ergebnis bleibt auf dieser Seite und wird nie in URLs, Anfragen, Logs oder Events geschrieben.`,
    boundaryEyebrow: 'Sicherheitsgrenze',
    boundaryTitle: 'Eingabe ist Daten, niemals Berechtigung.',
    previewBoundary:
      'Die Vorschau ist isoliert; Skripte, Formulare, Navigation, Downloads und Netzwerk sind gesperrt.',
    parserBoundary:
      'Der Parser begrenzt Eingaben und kann keine Vorlagen, Befehle, Dateien oder Netzaufrufe ausführen.',
    transformBoundary:
      'Eine reine lokale Transformation ohne Betriebssystem- oder Netzwerkzugriff.',
  },
  fr: {
    description: (name) => `Utilisez ${name} localement, sans compte ni transfert.`,
    back: '← Les 47 outils',
    localUtility: 'Outil local',
    pack: 'Pack',
    runsHere: "S'exécute sur cet appareil",
    trustBody: 'Sans compte, transfert, télémétrie ni traitement serveur.',
    howEyebrow: 'Fonctionnement',
    howTitle: 'Spécialisé et déterministe.',
    operationBody: (profile) =>
      `L'entrée est transmise à une opération locale ${profile} dans un Web Worker dédié. Le résultat reste sur cette page et n'entre jamais dans une URL, requête, journal ou événement.`,
    boundaryEyebrow: 'Limite de sécurité',
    boundaryTitle: "L'entrée est une donnée, jamais une autorité.",
    previewBoundary:
      'La prévisualisation est isolée et bloque scripts, formulaires, navigation, téléchargements et réseau.',
    parserBoundary:
      "L'analyseur limite les entrées et ne peut exécuter ni modèle, commande, fichier ou appel réseau.",
    transformBoundary: 'Une transformation locale pure, sans accès au système ni au réseau.',
  },
}
