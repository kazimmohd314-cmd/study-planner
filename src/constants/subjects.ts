export interface SubjectInfo {
  code: string;
  title: string;
  category: 'semester_v' | 'additional_theory' | 'gate' | 'placement';
  accentColor: string;
}

export const KNOWN_SUBJECTS: SubjectInfo[] = [
  { code: 'CS301', title: 'Design and Analysis of Algorithm', category: 'semester_v', accentColor: '#4f46e5' },
  { code: 'CS339', title: 'Introduction to Artificial Intelligence', category: 'semester_v', accentColor: '#0284c7' },
  { code: 'CS334', title: 'Cloud Computing', category: 'semester_v', accentColor: '#0d9488' },
  { code: 'CS312', title: 'Digital Image Processing', category: 'semester_v', accentColor: '#9333ea' },
  { code: 'CG303', title: 'Career Development and Soft Skills', category: 'semester_v', accentColor: '#e11d48' },
  { code: 'CS336', title: 'Full Stack Development - Backend', category: 'additional_theory', accentColor: '#059669' },
];
