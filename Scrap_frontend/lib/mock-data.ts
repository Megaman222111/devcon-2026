import type { Badge } from '@/components/gamification/badge-display'
import type { ModuleData } from '@/components/map/module-header'
import type { NodeState } from '@/components/map/path-node'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'
import type { KeyTerm, LessonContent } from '@/types/lesson'
import type { QuizQuestion } from '@/types/quiz'

export interface LessonData {
  id: string
  moduleId: string
  number: string
  title: string
  state: NodeState
  xp: number
}

export interface ScenarioData {
  id: string
  lessonId: string
  locationLabel: string
  imageUrl: string
  altText: string
  question: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation: string
  reference: string
  steps: string[]
}

export const lessonsForModule: Record<string, LessonData[]> = {
  'mod-1': [
    {
      id: 'l-1-1',
      moduleId: 'mod-1',
      number: '1.1',
      title: 'Roles and Responsibilities of Security Professionals',
      state: 'completed',
      xp: 10,
    },
    {
      id: 'l-1-2',
      moduleId: 'mod-1',
      number: '1.2',
      title: 'Legislation and the Licensing of Security Professionals in Alberta',
      state: 'current',
      xp: 12,
    },
    {
      id: 'l-1-3',
      moduleId: 'mod-1',
      number: '1.3',
      title: 'Appearance and Conduct for Security Professionals',
      state: 'upcoming',
      xp: 10,
    },
  ],
  'mod-2': [
    { id: 'l-2-1', moduleId: 'mod-2', number: '2.1', title: 'Charter of Rights and the Criminal Code of Canada', state: 'upcoming', xp: 12 },
    { id: 'l-2-2', moduleId: 'mod-2', number: '2.2', title: 'Use of Force', state: 'upcoming', xp: 12 },
    { id: 'l-2-3', moduleId: 'mod-2', number: '2.3', title: 'Additional Legislation', state: 'upcoming', xp: 12 },
  ],
  'mod-3': [
    { id: 'l-3-1', moduleId: 'mod-3', number: '3.1', title: 'Observation', state: 'upcoming', xp: 10 },
    { id: 'l-3-2', moduleId: 'mod-3', number: '3.2', title: 'Patrol Skills', state: 'upcoming', xp: 10 },
    { id: 'l-3-3', moduleId: 'mod-3', number: '3.3', title: 'Dealing with Substance Abusers', state: 'upcoming', xp: 10 },
    { id: 'l-3-4', moduleId: 'mod-3', number: '3.4', title: 'Interacting with the Media', state: 'upcoming', xp: 10 },
    { id: 'l-3-5', moduleId: 'mod-3', number: '3.5', title: 'Traffic Control', state: 'upcoming', xp: 10 },
    { id: 'l-3-6', moduleId: 'mod-3', number: '3.6', title: 'Post Orders', state: 'upcoming', xp: 10 },
    { id: 'l-3-7', moduleId: 'mod-3', number: '3.7', title: 'Starting a Shift', state: 'upcoming', xp: 10 },
    { id: 'l-3-8', moduleId: 'mod-3', number: '3.8', title: 'Ending a Shift', state: 'upcoming', xp: 10 },
    { id: 'l-3-9', moduleId: 'mod-3', number: '3.9', title: 'Working with a Partner', state: 'upcoming', xp: 10 },
    { id: 'l-3-10', moduleId: 'mod-3', number: '3.10', title: 'Use of Force Response', state: 'upcoming', xp: 12 },
  ],
  'mod-4': [
    { id: 'l-4-1', moduleId: 'mod-4', number: '4.1', title: 'Verbal and Non-Verbal Communication', state: 'upcoming', xp: 10 },
    { id: 'l-4-2', moduleId: 'mod-4', number: '4.2', title: 'Challenges to Communication', state: 'upcoming', xp: 10 },
    { id: 'l-4-3', moduleId: 'mod-4', number: '4.3', title: 'Communicating with Uncooperative Persons', state: 'upcoming', xp: 10 },
    { id: 'l-4-4', moduleId: 'mod-4', number: '4.4', title: 'Conducting an Interview', state: 'upcoming', xp: 10 },
  ],
  'mod-5': [
    { id: 'l-5-1', moduleId: 'mod-5', number: '5.1', title: 'Notebooks', state: 'upcoming', xp: 10 },
    { id: 'l-5-2', moduleId: 'mod-5', number: '5.2', title: 'Statements', state: 'upcoming', xp: 10 },
    { id: 'l-5-3', moduleId: 'mod-5', number: '5.3', title: 'Reports', state: 'upcoming', xp: 10 },
    { id: 'l-5-4', moduleId: 'mod-5', number: '5.4', title: 'Evidence', state: 'upcoming', xp: 10 },
    { id: 'l-5-5', moduleId: 'mod-5', number: '5.5', title: 'Preparing for Court', state: 'upcoming', xp: 10 },
  ],
  'mod-6': [
    { id: 'l-6-1', moduleId: 'mod-6', number: '6.1', title: 'Alarm Systems', state: 'upcoming', xp: 10 },
    { id: 'l-6-2', moduleId: 'mod-6', number: '6.2', title: 'Responding to Alarms', state: 'upcoming', xp: 10 },
    { id: 'l-6-3', moduleId: 'mod-6', number: '6.3', title: 'Emergency Scene Management', state: 'upcoming', xp: 12 },
  ],
  'mod-7': [
    { id: 'l-7-1', moduleId: 'mod-7', number: '7.1', title: 'Personal Safety', state: 'upcoming', xp: 10 },
    { id: 'l-7-2', moduleId: 'mod-7', number: '7.2', title: 'Identifying Hazards', state: 'upcoming', xp: 10 },
    { id: 'l-7-3', moduleId: 'mod-7', number: '7.3', title: 'Shift Work', state: 'upcoming', xp: 10 },
  ],
}

export const modules: ModuleData[] = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Introduction to the Security Industry',
    lessonsCount: lessonsForModule['mod-1'].length,
    completedLessons: 1,
    scenariosCount: 1,
    estimatedMinutes: 50,
    locked: false,
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'The Canadian Legal System and Security Professionals',
    lessonsCount: lessonsForModule['mod-2'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 65,
    locked: true,
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'Basic Security Procedures',
    lessonsCount: lessonsForModule['mod-3'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 90,
    locked: true,
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Communication for Security Professionals',
    lessonsCount: lessonsForModule['mod-4'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 50,
    locked: true,
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Documentation and Evidence',
    lessonsCount: lessonsForModule['mod-5'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 45,
    locked: true,
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Emergency Response Procedures for Security Professionals',
    lessonsCount: lessonsForModule['mod-6'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 50,
    locked: true,
  },
  {
    id: 'mod-7',
    number: 7,
    title: 'Health & Safety for Security Professionals',
    lessonsCount: lessonsForModule['mod-7'].length,
    completedLessons: 0,
    scenariosCount: 1,
    estimatedMinutes: 40,
    locked: true,
  },
]

const translationOverrides: Record<string, Partial<Record<LanguageCode, string>>> = {
  Observe: { tl: 'Obserbahan', hi: 'निरीक्षण', ur: 'مشاہدہ', zh: '观察', ko: '관찰', vi: 'Quan sát', es: 'Observar', pt: 'Observar', fr: 'Observer', ar: 'الملاحظة', ja: '観察' },
  Deter: { tl: 'Pigilan', hi: 'निवारण', ur: 'روکنا', zh: '威慑', ko: '억제', vi: 'Ngăn chặn', es: 'Disuadir', pt: 'Dissuadir', fr: 'Dissuader', ar: 'الردع', ja: '抑止' },
  Report: { tl: 'Iulat', hi: 'रिपोर्ट', ur: 'رپورٹ', zh: '报告', ko: '보고', vi: 'Báo cáo', es: 'Informar', pt: 'Relatar', fr: 'Signaler', ar: 'الإبلاغ', ja: '報告' },
  Confidentiality: { tl: 'Pagiging kumpidensiyal', hi: 'गोपनीयता', ur: 'رازداری', zh: '保密', ko: '기밀 유지', vi: 'Tính bảo mật', es: 'Confidencialidad', pt: 'Confidencialidade', fr: 'Confidentialité', ar: 'السرية', ja: '守秘義務' },
  SSIA: { tl: 'SSIA', hi: 'SSIA', ur: 'SSIA', zh: 'SSIA', ko: 'SSIA', vi: 'SSIA', es: 'SSIA', pt: 'SSIA', fr: 'SSIA', ar: 'SSIA', ja: 'SSIA' },
  Licensee: { tl: 'May lisensya', hi: 'लाइसेंसधारी', ur: 'لائسنس یافتہ', zh: '持证人', ko: '면허 보유자', vi: 'Người được cấp phép', es: 'Licenciatario', pt: 'Licenciado', fr: 'Titulaire de permis', ar: 'صاحب الترخيص', ja: '免許保持者' },
  Registrar: { tl: 'Registrar', hi: 'रजिस्ट्रार', ur: 'رجسٹرار', zh: '注册官', ko: '등록관', vi: 'Cơ quan đăng ký', es: 'Registrador', pt: 'Registrador', fr: 'Registraire', ar: 'المسجل', ja: '登録官' },
  Compliance: { tl: 'Pagsunod', hi: 'अनुपालन', ur: 'تعمیل', zh: '合规', ko: '준수', vi: 'Tuân thủ', es: 'Cumplimiento', pt: 'Conformidade', fr: 'Conformité', ar: 'الامتثال', ja: 'コンプライアンス' },
  Deportment: { tl: 'Kilos', hi: 'आचरण', ur: 'طرزِ عمل', zh: '举止', ko: '태도', vi: 'Tác phong', es: 'Comportamiento', pt: 'Postura profissional', fr: 'Maintien', ar: 'السلوك', ja: '立ち居振る舞い' },
  Integrity: { tl: 'Integridad', hi: 'ईमानदारी', ur: 'دیانت داری', zh: '诚信', ko: '정직성', vi: 'Chính trực', es: 'Integridad', pt: 'Integridade', fr: 'Intégrité', ar: 'النزاهة', ja: '誠実さ' },
  Uniform: { tl: 'Uniporme', hi: 'वर्दी', ur: 'یونیفارم', zh: '制服', ko: '제복', vi: 'Đồng phục', es: 'Uniforme', pt: 'Uniforme', fr: 'Uniforme', ar: 'الزي الرسمي', ja: '制服' },
  'Code of Conduct': { tl: 'Kodigo ng Pag-uugali', hi: 'आचार संहिता', ur: 'ضابطہ اخلاق', zh: '行为准则', ko: '행동 강령', vi: 'Bộ quy tắc ứng xử', es: 'Código de conducta', pt: 'Código de conduta', fr: 'Code de conduite', ar: 'مدونة السلوك', ja: '行動規範' },
  'Use of Force': { tl: 'Paggamit ng Puwersa', hi: 'बल का प्रयोग', ur: 'طاقت کا استعمال', zh: '使用武力', ko: '물리력 사용', vi: 'Sử dụng vũ lực', es: 'Uso de la fuerza', pt: 'Uso da força', fr: 'Usage de la force', ar: 'استخدام القوة', ja: '有形力の行使' },
}

function createTerm(id: string, english: string, paragraphIds: string[]): KeyTerm {
  return {
    id,
    english,
    translated: translationOverrides[english]?.tl ?? english,
    paragraphIds,
    translations: translationOverrides[english] ?? {},
  }
}

export const lessonContentById: Record<string, LessonContent> = {
  'l-1-1': {
    id: 'l-1-1',
    moduleId: 'mod-1',
    title: 'Roles and Responsibilities of Security Professionals',
    moduleLabel: 'Module 1',
    lessonLabel: 'Lesson 1.1',
    estimatedMinutes: 8,
    totalSections: 3,
    blocks: [
      { type: 'heading', id: 'l11-h1', level: 2, text: 'What Is a Security Professional?', topicTags: ['Core role'] },
      {
        type: 'paragraph',
        id: 'l11-p1',
        text: 'The Security Services and Investigators Act defines a security guard as an individual who protects an organization’s property, personnel, and information against fire, theft, vandalism, and illegal entry.',
        keywordRefs: ['observe', 'confidentiality'],
        topicTags: ['Core role'],
      },
      {
        type: 'definition',
        id: 'l11-d1',
        term: 'Security professional',
        definition: 'A trained person who protects people, property, and information while acting within legal authority and employer policy.',
        topicTags: ['Core role'],
      },
      { type: 'heading', id: 'l11-h2', level: 2, text: 'Common Activities', topicTags: ['Observe – Deter – Report'] },
      {
        type: 'list',
        id: 'l11-list-1',
        style: 'bullet',
        items: [
          'patrolling premises and grounds',
          'monitoring alarm systems and responding appropriately',
          'controlling access to people and areas',
          'observing and reporting criminal activity',
          'documenting interactions and events',
        ],
        topicTags: ['Observe – Deter – Report'],
      },
      {
        type: 'callout',
        id: 'l11-callout-1',
        variant: 'tip',
        title: 'Primary role',
        text: 'Security professionals are expected to observe, deter, and report before they escalate their response.',
        topicTags: ['Observe – Deter – Report'],
      },
      {
        type: 'paragraph',
        id: 'l11-p2',
        text: 'Across these duties, the role is often summarized as Observe, Deter, Report. Those three words anchor professional decision-making in day-to-day work.',
        keywordRefs: ['observe', 'deter', 'report'],
        topicTags: ['Observe – Deter – Report'],
      },
      { type: 'divider' },
      { type: 'heading', id: 'l11-h3', level: 2, text: 'Protecting Information', topicTags: ['Confidentiality'] },
      {
        type: 'paragraph',
        id: 'l11-p3',
        text: 'You may also be required to protect confidential information. In practice, this means maintaining confidentiality and observing or reporting suspicious access to information systems.',
        keywordRefs: ['confidentiality', 'observe', 'report'],
        topicTags: ['Confidentiality'],
      },
    ],
    keyTerms: [
      createTerm('observe', 'Observe', ['l11-p1', 'l11-p2', 'l11-p3']),
      createTerm('deter', 'Deter', ['l11-p2']),
      createTerm('report', 'Report', ['l11-p2', 'l11-p3']),
      createTerm('confidentiality', 'Confidentiality', ['l11-p1', 'l11-p3']),
    ],
  },
  'l-1-2': {
    id: 'l-1-2',
    moduleId: 'mod-1',
    title: 'Legislation and the Licensing of Security Professionals in Alberta',
    moduleLabel: 'Module 1',
    lessonLabel: 'Lesson 1.2',
    estimatedMinutes: 10,
    totalSections: 4,
    blocks: [
      { type: 'heading', id: 'l12-h1', level: 2, text: 'SSIA and Licensing Classes', topicTags: ['SSIA'] },
      {
        type: 'paragraph',
        id: 'l12-p1',
        text: 'Alberta introduced the Security Services and Investigators Act, often shortened to SSIA, to establish industry-wide standards for private security work.',
        keywordRefs: ['ssia'],
        topicTags: ['SSIA'],
      },
      {
        type: 'legal',
        id: 'l12-legal-1',
        code: 'SSIA',
        text: 'Persons cannot provide or advertise security services without the correct licence class.',
        topicTags: ['Licensing rules'],
      },
      {
        type: 'paragraph',
        id: 'l12-p2',
        text: 'Under the Act, a licensee must hold the proper class of licence before working. Licensing classes include Security Services, Loss Prevention, and Executive Security.',
        keywordRefs: ['licensee'],
        topicTags: ['Licensing rules'],
      },
      { type: 'heading', id: 'l12-h2', level: 2, text: 'Application Requirements', topicTags: ['Eligibility'] },
      {
        type: 'list',
        id: 'l12-list-1',
        style: 'bullet',
        items: [
          'minimum age of 18',
          'legal entitlement to work in Canada',
          'good character and competency',
          'no disqualifying criminal history',
          'approved training completion for the licence class',
        ],
        topicTags: ['Eligibility'],
      },
      {
        type: 'callout',
        id: 'l12-callout-1',
        variant: 'warning',
        title: 'Important',
        text: 'A person is not permitted to work until the licence has been issued. Training completion alone is not enough.',
        topicTags: ['Licensing rules'],
      },
      {
        type: 'paragraph',
        id: 'l12-p3',
        text: 'Licensees must also report required updates, cooperate with Registrar requests, and meet the timelines set by regulation.',
        keywordRefs: ['licensee', 'registrar', 'compliance'],
        topicTags: ['Compliance'],
      },
      { type: 'heading', id: 'l12-h3', level: 2, text: 'Complaints and Review', topicTags: ['Compliance'] },
      {
        type: 'paragraph',
        id: 'l12-p4',
        text: 'The complaint process allows concerns about conduct or licensing compliance to be reviewed through the Registrar and, where applicable, the Director.',
        keywordRefs: ['registrar', 'compliance'],
        topicTags: ['Compliance'],
      },
      {
        type: 'image',
        id: 'l12-img-1',
        src: '/lesson-images/c02-complaint-process-flow.png',
        alt: 'Complaint process flow diagram for SSIA review and appeal steps.',
        caption: 'Complaint and review flow under the SSIA.',
        topicTags: ['Compliance'],
      },
    ],
    keyTerms: [
      createTerm('ssia', 'SSIA', ['l12-p1']),
      createTerm('licensee', 'Licensee', ['l12-p2', 'l12-p3']),
      createTerm('registrar', 'Registrar', ['l12-p3', 'l12-p4']),
      createTerm('compliance', 'Compliance', ['l12-p3', 'l12-p4']),
    ],
  },
  'l-1-3': {
    id: 'l-1-3',
    moduleId: 'mod-1',
    title: 'Appearance and Conduct for Security Professionals',
    moduleLabel: 'Module 1',
    lessonLabel: 'Lesson 1.3',
    estimatedMinutes: 9,
    totalSections: 3,
    blocks: [
      { type: 'heading', id: 'l13-h1', level: 2, text: 'Appearance and Professional Image', topicTags: ['Professional image'] },
      {
        type: 'paragraph',
        id: 'l13-p1',
        text: 'Appearance directly affects credibility. A clean uniform and professional presentation influence whether the public trusts and respects your role.',
        keywordRefs: ['uniform'],
        topicTags: ['Professional image'],
      },
      { type: 'heading', id: 'l13-h2', level: 2, text: 'Deportment and Demeanour', topicTags: ['Deportment'] },
      {
        type: 'paragraph',
        id: 'l13-p2',
        text: 'Deportment describes conduct and behaviour. Strong deportment supports respectful public interaction, safe teamwork, and professionalism under stress.',
        keywordRefs: ['deportment'],
        topicTags: ['Deportment'],
      },
      {
        type: 'callout',
        id: 'l13-callout-1',
        variant: 'legal',
        title: 'Code of Conduct',
        text: 'Licensees must act with honesty and integrity, protect confidentiality, and avoid disorderly behaviour or unnecessary force while on duty.',
        topicTags: ['Code of conduct'],
      },
      {
        type: 'paragraph',
        id: 'l13-p3',
        text: 'Integrity and a clear code of conduct help security professionals make lawful, consistent decisions that employers and the public can trust.',
        keywordRefs: ['integrity', 'code-of-conduct'],
        topicTags: ['Code of conduct'],
      },
    ],
    keyTerms: [
      createTerm('deportment', 'Deportment', ['l13-p2']),
      createTerm('integrity', 'Integrity', ['l13-p3']),
      createTerm('uniform', 'Uniform', ['l13-p1']),
      createTerm('code-of-conduct', 'Code of Conduct', ['l13-p3']),
    ],
  },
}

export const defaultLessonContent: LessonContent = {
  id: 'coming-soon',
  moduleId: 'mod-0',
  title: 'Lesson Coming Soon',
  moduleLabel: 'Module',
  lessonLabel: 'TBD',
  estimatedMinutes: 5,
  totalSections: 1,
  blocks: [
    { type: 'heading', id: 'coming-soon-heading', level: 2, text: 'Content Not Yet Added' },
    {
      type: 'paragraph',
      id: 'coming-soon-paragraph',
      text: 'This lesson structure is available, but content for this chapter will be added in a future frontend update.',
      keywordRefs: [],
    },
  ],
  keyTerms: [],
}

export const lessonQuizById: Record<string, QuizQuestion[]> = {
  'l-1-1': [
    {
      type: 'mcq',
      id: 'l11-q1',
      question: 'Which phrase best summarizes the primary role of a security professional?',
      options: [
        { id: 'a', text: 'Observe, deter, report' },
        { id: 'b', text: 'Search, seize, arrest' },
        { id: 'c', text: 'Command, control, punish' },
        { id: 'd', text: 'Warn, ticket, remove' },
      ],
      correctOptionId: 'a',
      explanation: 'The lesson frames the role as Observe, Deter, Report. It emphasizes awareness and reporting before escalation.',
      reference: 'ABST Manual, Module 1, Lesson 1.1',
      topicLabel: 'Observe – Deter – Report',
      hint: 'Think about the three-word summary highlighted in the callout.',
    },
    {
      type: 'true-false',
      id: 'l11-q2',
      statement: 'Protecting confidential information can be part of a security professional’s job.',
      correct: 'true',
      explanation: 'Security work can include protecting information, not just people or property.',
      reference: 'ABST Manual, Module 1, Lesson 1.1',
      topicLabel: 'Confidentiality',
      hint: 'Review the final section of the lesson.',
    },
    {
      type: 'fill-blank',
      id: 'l11-q3',
      prompt: 'Complete the phrase: Observe, Deter, ____.',
      acceptableAnswers: ['report'],
      placeholder: 'Type the missing word',
      explanation: 'Report is the third pillar in the lesson’s core role summary.',
      reference: 'ABST Manual, Module 1, Lesson 1.1',
      topicLabel: 'Observe – Deter – Report',
      hint: 'It is the action you take after noting something important.',
    },
  ],
  'l-1-2': [
    {
      type: 'mcq',
      id: 'l12-q1',
      question: 'What must happen before a person can legally begin work in a licensed security role?',
      options: [
        { id: 'a', text: 'They must finish orientation at the worksite only' },
        { id: 'b', text: 'They must receive the correct licence' },
        { id: 'c', text: 'They must complete one probation shift' },
        { id: 'd', text: 'They must register with local police' },
      ],
      correctOptionId: 'b',
      explanation: 'The lesson states clearly that a person is not permitted to work until the licence has been issued.',
      reference: 'ABST Manual, Module 1, Lesson 1.2',
      topicLabel: 'Licensing rules',
      hint: 'Training alone is not enough.',
    },
    {
      type: 'true-false',
      id: 'l12-q2',
      statement: 'The SSIA exists to establish industry-wide standards for private security work.',
      correct: 'true',
      explanation: 'That is one of the lesson’s core purposes for the Act.',
      reference: 'ABST Manual, Module 1, Lesson 1.2',
      topicLabel: 'SSIA',
      hint: 'Look at the first paragraph of the lesson.',
    },
    {
      type: 'fill-blank',
      id: 'l12-q3',
      prompt: 'A person who holds a security licence is called a _____.',
      acceptableAnswers: ['licensee'],
      placeholder: 'Enter the term',
      explanation: 'The lesson repeatedly uses the term licensee for a person holding the proper licence.',
      reference: 'ABST Manual, Module 1, Lesson 1.2',
      topicLabel: 'Licensing rules',
      hint: 'It appears beside the licensing class explanation.',
    },
    {
      type: 'scenario-mcq',
      id: 'l12-q4',
      scenario: 'A coworker says they finished training yesterday and wants to start a shift before their licence arrives.',
      question: 'What is the best response?',
      options: [
        { id: 'a', text: 'Let them work if a supervisor approves it verbally' },
        { id: 'b', text: 'Allow them to shadow another guard as paid work' },
        { id: 'c', text: 'Explain they cannot work until the licence is issued' },
        { id: 'd', text: 'Tell them to work only if the site is quiet' },
      ],
      correctOptionId: 'c',
      explanation: 'Training completion does not replace licensing. The licence must be issued before work begins.',
      reference: 'ABST Manual, Module 1, Lesson 1.2',
      topicLabel: 'Licensing rules',
      hint: 'The warning callout is the key.',
    },
    {
      type: 'matching',
      id: 'l12-q5',
      instruction: 'Match each term with its correct description.',
      pairs: [
        { id: 'm1', term: 'SSIA', definition: 'The Act that sets standards for the industry' },
        { id: 'm2', term: 'Registrar', definition: 'Authority that reviews required reports and complaints' },
        { id: 'm3', term: 'Compliance', definition: 'Following the Act, regulations, and required timelines' },
      ],
      explanation: 'These terms describe the law, the decision-maker, and the obligation to follow the rules.',
      reference: 'ABST Manual, Module 1, Lesson 1.2',
      topicLabel: 'Compliance',
      hint: 'Think law, authority, and obligations.',
    },
  ],
  'l-1-3': [
    {
      type: 'mcq',
      id: 'l13-q1',
      question: 'Which item most directly affects the public’s first impression of a security professional?',
      options: [
        { id: 'a', text: 'How many reports they wrote last week' },
        { id: 'b', text: 'Uniform and professional presentation' },
        { id: 'c', text: 'Their shift schedule' },
        { id: 'd', text: 'Their favourite patrol route' },
      ],
      correctOptionId: 'b',
      explanation: 'The lesson connects appearance and presentation to credibility and trust.',
      reference: 'ABST Manual, Module 1, Lesson 1.3',
      topicLabel: 'Professional image',
      hint: 'Think about what the public sees first.',
    },
  ],
}

export const lessonScenariosById: Record<string, ScenarioData> = {
  'l-1-2': {
    id: 'scn-l12-001',
    lessonId: 'l-1-2',
    locationLabel: 'Licensing Counter · Downtown Office · 9:10 AM',
    imageUrl: '/lesson-images/c02-complaint-process-flow.png',
    altText: 'A security training office counter with a new applicant speaking to a licensing clerk and documents on the desk.',
    question: 'A trainee says they completed the course and wants to begin work tonight before their licence arrives. What is your first response?',
    options: [
      { id: 'a', text: 'Tell them it is acceptable if the employer is short-staffed' },
      { id: 'b', text: 'Explain they must wait until the licence is issued before working' },
      { id: 'c', text: 'Suggest they work off-site where nobody will notice' },
      { id: 'd', text: 'Advise them to begin work and submit the licence later' },
    ],
    correctOptionId: 'b',
    explanation: 'The safest and lawful response is to stop the work from starting. Completing training does not authorize employment before licensing is issued.',
    reference: 'ABST Manual, Module 1, Lesson 1.2',
    steps: [
      'Clarify that training completion and licence issuance are separate steps.',
      'State that work cannot begin until the licence is actually issued.',
      'Direct the trainee to follow the licensing process properly.',
    ],
  },
}

export const sampleQuiz = lessonQuizById['l-1-2']

export const badges: Badge[] = [
  { id: 'b-1', name: 'First Steps', description: 'Complete your first lesson', icon: 'shield', earned: true, earnedAt: '2024-01-15' },
  { id: 'b-2', name: 'Legal Eagle', description: 'Complete Module 2', icon: 'scale', earned: true, earnedAt: '2024-01-18' },
  { id: 'b-3', name: 'Hawk Eye', description: 'Perfect score on observation quiz', icon: 'eye', earned: false },
  { id: 'b-4', name: 'Documenter', description: 'Complete all report writing lessons', icon: 'file', earned: false },
  { id: 'b-5', name: 'First Responder', description: 'Complete Emergency Response module', icon: 'heart', earned: false },
  { id: 'b-6', name: 'Speed Runner', description: 'Complete a lesson in under 5 minutes', icon: 'zap', earned: false },
  { id: 'b-7', name: 'Streak Master', description: 'Maintain a 7-day streak', icon: 'star', earned: false },
  { id: 'b-8', name: 'Graduate', description: 'Complete all modules and exams', icon: 'award', earned: false },
]

export const leaderboardData = [
  { rank: 1, name: 'Sarah M.', xp: 720, streak: 12, isCurrentUser: false },
  { rank: 2, name: 'Marcus T.', xp: 680, streak: 7, isCurrentUser: false },
  { rank: 3, name: 'Ali K.', xp: 640, streak: 5, isCurrentUser: false },
  { rank: 4, name: 'Priya S.', xp: 390, streak: 4, isCurrentUser: false },
  { rank: 5, name: 'James O.', xp: 370, streak: 2, isCurrentUser: false },
  { rank: 6, name: 'Nina R.', xp: 320, streak: 3, isCurrentUser: false },
  { rank: 7, name: 'David L.', xp: 280, streak: 0, isCurrentUser: false },
  { rank: 8, name: 'Emma W.', xp: 240, streak: 1, isCurrentUser: false },
]

export function getLessonContent(lessonId: string) {
  return lessonContentById[lessonId] ?? defaultLessonContent
}

export function getLessonQuiz(lessonId: string) {
  return lessonQuizById[lessonId] ?? sampleQuiz
}

export function getScenarioForLesson(lessonId: string) {
  return lessonScenariosById[lessonId] ?? null
}

export function getTranslationForTerm(term: KeyTerm, language: LanguageCode) {
  return term.translations?.[language] ?? term.translated ?? term.english
}

export function getLanguageLabel(code: LanguageCode | string) {
  return getLanguageByCode(code).name
}

export function getLanguageFlag(code: LanguageCode | string) {
  return getLanguageByCode(code).flag
}
