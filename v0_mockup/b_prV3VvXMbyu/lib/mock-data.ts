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

export const modules: ModuleData[] = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Introduction to the Security Industry',
    lessonsCount: 4,
    completedLessons: 4,
    scenariosCount: 2,
    estimatedMinutes: 45,
    locked: false,
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'The Canadian Legal System',
    lessonsCount: 5,
    completedLessons: 3,
    scenariosCount: 2,
    estimatedMinutes: 60,
    locked: false,
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'Basic Security Procedures',
    lessonsCount: 8,
    completedLessons: 0,
    scenariosCount: 3,
    estimatedMinutes: 90,
    locked: true,
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Communication Skills',
    lessonsCount: 5,
    completedLessons: 0,
    scenariosCount: 2,
    estimatedMinutes: 50,
    locked: true,
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Documentation & Reports',
    lessonsCount: 4,
    completedLessons: 0,
    scenariosCount: 2,
    estimatedMinutes: 40,
    locked: true,
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Emergency Response',
    lessonsCount: 6,
    completedLessons: 0,
    scenariosCount: 3,
    estimatedMinutes: 70,
    locked: true,
  },
  {
    id: 'mod-7',
    number: 7,
    title: 'Health & Safety',
    lessonsCount: 5,
    completedLessons: 0,
    scenariosCount: 2,
    estimatedMinutes: 55,
    locked: true,
  },
]

export const lessonsForModule: Record<string, LessonData[]> = {
  'mod-1': [
    { id: 'l-1-1', moduleId: 'mod-1', number: '1.1', title: 'The Industry', state: 'completed', xp: 10 },
    { id: 'l-1-2', moduleId: 'mod-1', number: '1.2', title: 'Legal Framework', state: 'completed', xp: 10 },
    { id: 'l-1-3', moduleId: 'mod-1', number: '1.3', title: 'Types of Guards', state: 'completed', xp: 10 },
    { id: 'l-1-4', moduleId: 'mod-1', number: '1.4', title: 'Role of Security', state: 'completed', xp: 10 },
  ],
  'mod-2': [
    { id: 'l-2-1', moduleId: 'mod-2', number: '2.1', title: 'Legal Basics', state: 'completed', xp: 15 },
    { id: 'l-2-2', moduleId: 'mod-2', number: '2.2', title: 'Criminal Code', state: 'completed', xp: 15 },
    { id: 'l-2-3', moduleId: 'mod-2', number: '2.3', title: 'Arrest Powers', state: 'completed', xp: 15 },
    { id: 'l-2-4', moduleId: 'mod-2', number: '2.4', title: 'Use of Force', state: 'current', xp: 15 },
    { id: 'l-2-5', moduleId: 'mod-2', number: '2.5', title: 'Civil Liability', state: 'upcoming', xp: 15 },
  ],
  'mod-3': [
    { id: 'l-3-1', moduleId: 'mod-3', number: '3.1', title: 'Introduction to Patrols', state: 'locked', xp: 10 },
    { id: 'l-3-2', moduleId: 'mod-3', number: '3.2', title: 'Access Control Procedures', state: 'locked', xp: 10 },
    { id: 'l-3-3', moduleId: 'mod-3', number: '3.3', title: 'Searching Techniques', state: 'locked', xp: 10 },
    { id: 'l-3-4', moduleId: 'mod-3', number: '3.4', title: 'Use of Force Continuum', state: 'locked', xp: 10 },
    { id: 'l-3-5', moduleId: 'mod-3', number: '3.5', title: 'Observation Skills', state: 'locked', xp: 10 },
    { id: 'l-3-6', moduleId: 'mod-3', number: '3.6', title: 'Report Writing Basics', state: 'locked', xp: 10 },
    { id: 'l-3-7', moduleId: 'mod-3', number: '3.7', title: 'Incident Response', state: 'locked', xp: 10 },
    { id: 'l-3-8', moduleId: 'mod-3', number: '3.8', title: 'Working with Law Enforcement', state: 'locked', xp: 10 },
  ],
}

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

export const lessonContent = {
  title: 'Use of Force',
  sections: [
    {
      heading: 'Understanding Use of Force',
      content: `The ability to understand and appropriately apply force is one of the most critical skills a security guard can develop. Use of force refers to the amount of effort required by security personnel to compel compliance from an unwilling subject.

The use of force continuum provides a framework for security personnel to match their response to the level of threat they encounter. It emphasizes de-escalation and the use of the minimum force necessary to resolve a situation.`,
    },
    {
      heading: 'The Use of Force Continuum',
      content: `The continuum typically includes the following levels, from least to most forceful:

1. **Officer Presence** — The mere presence of a uniformed security officer can deter criminal activity.

2. **Verbal Commands** — Clear, calm verbal instructions to gain compliance.

3. **Soft Physical Control** — Guiding techniques, light restraint holds.

4. **Hard Physical Control** — Takedowns, strikes, defensive tactics.

5. **Intermediate Weapons** — If authorized: batons, OC spray.

6. **Lethal Force** — Only in situations where life is at immediate risk.`,
    },
    {
      heading: 'Legal Considerations',
      content: `Section 25 of the Criminal Code provides legal justification for the use of force by persons authorized or required by law to enforce the law. However, this force must be:

• **Reasonable** in the circumstances
• **Proportionate** to the threat
• **Necessary** to accomplish the lawful purpose

Using excessive force can result in criminal charges and civil liability.`,
    },
  ],
  keyTerms: [
    { english: 'Use of Force', translated: 'Paggamit ng Puwersa' },
    { english: 'Continuum', translated: 'Pagpapatuloy' },
    { english: 'De-escalation', translated: 'Pagpapa-kalma' },
    { english: 'Compliance', translated: 'Pagsunod' },
    { english: 'Reasonable', translated: 'Makatuwiran' },
    { english: 'Proportionate', translated: 'Proporsyonal' },
  ],
}
