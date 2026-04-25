import type { ModuleData } from '@/components/map/module-header'
import type { NodeState } from '@/components/map/path-node'
import type { Badge } from '@/components/gamification/badge-display'

export interface LessonData {
  id: string
  moduleId: string
  number: string
  title: string
  state: NodeState
  xp: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  reference?: string
}

export interface LessonContentSection {
  heading: string
  content: string
}

export interface LessonContent {
  title: string
  moduleLabel: string
  lessonLabel: string
  sections: LessonContentSection[]
  keyTerms: { english: string; translated: string }[]
}

export const lessonsForModule: Record<string, LessonData[]> = {
  'mod-1': [
    { id: 'l-1-1', moduleId: 'mod-1', number: '1.1', title: 'Roles and Responsibilities of Security Professionals', state: 'completed', xp: 10 },
    { id: 'l-1-2', moduleId: 'mod-1', number: '1.2', title: 'Legislation and the Licensing of Security Professionals in Alberta', state: 'current', xp: 12 },
    { id: 'l-1-3', moduleId: 'mod-1', number: '1.3', title: 'Appearance and Conduct for Security Professionals', state: 'upcoming', xp: 10 },
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

export const sampleQuiz: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Under the Criminal Code of Canada, a security guard may arrest a person without a warrant if:',
    options: [
      { id: 'a', text: 'The person is suspected of planning a crime' },
      { id: 'b', text: 'The person is found committing an indictable offence' },
      { id: 'c', text: 'The guard has a reasonable suspicion' },
      { id: 'd', text: 'The property owner requests it' },
    ],
    correctId: 'b',
    explanation: 'Section 494 of the Criminal Code allows any person to arrest another person they find committing an indictable offence or escaping from lawful custody.',
    reference: 'Criminal Code s.494(1)',
  },
  {
    id: 'q2',
    question: 'The primary purpose of the use of force continuum is to:',
    options: [
      { id: 'a', text: 'Maximize the force available to security personnel' },
      { id: 'b', text: 'Ensure legal protection for the security company' },
      { id: 'c', text: 'Guide the appropriate level of force based on the threat' },
      { id: 'd', text: 'Eliminate the need for verbal communication' },
    ],
    correctId: 'c',
    explanation: 'The use of force continuum provides a framework for matching the level of response to the level of threat, starting with presence and verbal commands before escalating to physical options.',
    reference: 'ABST Manual, Chapter 3',
  },
  {
    id: 'q3',
    question: 'When conducting a patrol, what should a security guard document?',
    options: [
      { id: 'a', text: 'Only incidents involving physical altercations' },
      { id: 'b', text: 'Personal opinions about suspicious individuals' },
      { id: 'c', text: 'Observations, times, and any irregularities noted' },
      { id: 'd', text: 'Names of all employees seen during the patrol' },
    ],
    correctId: 'c',
    explanation: 'Documentation should include factual observations, specific times, locations, and any irregularities or incidents encountered during the patrol.',
    reference: 'ABST Manual, Chapter 5',
  },
]

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
  { rank: 1, name: 'Sarah M.', xp: 720, streak: 12 },
  { rank: 2, name: 'Marcus T.', xp: 680, streak: 7 },
  { rank: 3, name: 'Ali K.', xp: 640, streak: 5 },
  { rank: 4, name: 'Priya S.', xp: 390, streak: 4 },
  { rank: 5, name: 'James O.', xp: 370, streak: 2 },
  { rank: 6, name: 'Nina R.', xp: 320, streak: 3 },
  { rank: 7, name: 'David L.', xp: 280, streak: 0 },
  { rank: 8, name: 'Emma W.', xp: 240, streak: 1 },
]

export const lessonContentById: Record<string, LessonContent> = {
  'l-1-1': {
    title: 'Roles and Responsibilities of Security Professionals',
    moduleLabel: 'Module 1',
    lessonLabel: '1.1',
    sections: [
      {
        heading: 'Section 1 - What Is a Security Professional?',
        content: `The Security Services and Investigators Act defines a security guard as an individual who protects an organization's property, personnel and information against fire, theft, vandalism and illegal entry.

This training uses the broader term security professional to reflect the variety of roles in the field. Related roles include security guard, loss prevention, executive security, private investigator, in-house investigator and locksmiths.

Across roles, the purpose of the Act is to set minimum standards of training, accountability and professionalism.`,
      },
      {
        heading: 'Section 2 - Common Activities',
        content: `Common duties include:
- patrolling premises and grounds
- monitoring alarm systems and responding appropriately
- controlling access to people and areas
- observing and reporting criminal activity
- directing traffic
- responding to emergencies
- documenting interactions and events
- presenting a professional image
- arresting persons found committing a crime

Primary role: OBSERVE - DETER - REPORT.`,
      },
      {
        heading: 'Sections 3-6 - Protecting Persons, Property and Information',
        content: `Security professionals may protect persons directly (for example, executive protection) or protect groups by identifying hazards at events.

Protection of property includes preventing and responding to vandalism, theft, disturbances, fights, fire and flooding.

You may also be required to protect confidential information. In practice, this means maintaining confidentiality and observing/reporting suspicious access to information systems.`,
      },
    ],
    keyTerms: [
      { english: 'Observe', translated: 'Observe' },
      { english: 'Deter', translated: 'Deter' },
      { english: 'Report', translated: 'Report' },
      { english: 'Confidentiality', translated: 'Confidentiality' },
    ],
  },
  'l-1-2': {
    title: 'Legislation and the Licensing of Security Professionals in Alberta',
    moduleLabel: 'Module 1',
    lessonLabel: '1.2',
    sections: [
      {
        heading: 'Sections 1-3 - SSIA and Licensing Classes',
        content: `Alberta introduced the Security Services and Investigators Act (SSIA) to establish industry-wide standards.

Under the Act, persons cannot provide or advertise security services without a licence. Licensing classes include Security Services, Loss Prevention and Executive Security categories as defined in the legislation.`,
      },
      {
        heading: 'Sections 4-8 - Application and Reporting Requirements',
        content: `Key individual application requirements include:
- minimum age of 18
- legal entitlement to work in Canada
- good character and competency
- no disqualifying criminal history or active criminal concerns
- approved training completion for the licence class

Licensees must report required updates (for example address or status changes) and comply with Registrar requests and timelines under the Act and Regulations.`,
      },
      {
        heading: 'Sections 9-13 - Compliance, Complaints and Review',
        content: `The SSIA sets out:
- circumstances for refusal, suspension or cancellation
- restrictions on titles and conduct
- a public complaint process with defined timelines
- review and appeal channels through the Registrar and Director

A core rule in this lesson: you are not permitted to work until you have received your licence.`,
      },
    ],
    keyTerms: [
      { english: 'SSIA', translated: 'SSIA' },
      { english: 'Licensee', translated: 'Licensee' },
      { english: 'Registrar', translated: 'Registrar' },
      { english: 'Compliance', translated: 'Compliance' },
    ],
  },
  'l-1-3': {
    title: 'Appearance and Conduct for Security Professionals',
    moduleLabel: 'Module 1',
    lessonLabel: '1.3',
    sections: [
      {
        heading: 'Sections 1-2 - Appearance and Professional Image',
        content: `Appearance directly affects credibility. Uniform and deportment influence whether the public trusts and respects your role.

Professional image expectations include clean and maintained uniform, proper grooming, suitable footwear, and safe, practical presentation consistent with employer policy and legislation.`,
      },
      {
        heading: 'Section 3 - Deportment and Demeanour',
        content: `Deportment describes conduct and behavior. Demeanour describes how you respond to people and situations.

Strong deportment supports:
- respectful public interaction
- safe teamwork
- consistent professionalism under stress`,
      },
      {
        heading: 'Section 4 - Code of Conduct',
        content: `While on duty, licensees are expected to act with honesty and integrity, comply with law, protect confidentiality, and follow employer code.

Licensees must not engage in disorderly behavior, unnecessary force, false statements, alcohol use, or prohibited controlled substance use while on duty.`,
      },
    ],
    keyTerms: [
      { english: 'Deportment', translated: 'Deportment' },
      { english: 'Integrity', translated: 'Integrity' },
      { english: 'Uniform', translated: 'Uniform' },
      { english: 'Code of Conduct', translated: 'Code of Conduct' },
    ],
  },
}

export const defaultLessonContent: LessonContent = {
  title: 'Lesson Coming Soon',
  moduleLabel: 'Module',
  lessonLabel: 'TBD',
  sections: [
    {
      heading: 'Content Not Yet Added',
      content: 'This lesson structure is available, but content for this chapter will be added in a future update.',
    },
  ],
  keyTerms: [{ english: 'Coming soon', translated: 'Coming soon' }],
}
