export const curriculum = {
  Biology: ['Characteristics and classification of living organisms', 'Organisation of the organism', 'Movement in and out of cells', 'Biological molecules', 'Enzymes', 'Plant nutrition', 'Human nutrition', 'Transport in plants', 'Transport in animals', 'Diseases and immunity', 'Gas exchange', 'Respiration', 'Excretion in humans', 'Coordination and response', 'Drugs', 'Reproduction', 'Organisms and their environment', 'Human influences on ecosystems', 'Biotechnology and genetic engineering'],
  Mathematics: ['Number', 'Algebra and graphs', 'Coordinate geometry', 'Geometry', 'Mensuration', 'Trigonometry', 'Vectors and transformations', 'Probability', 'Statistics'],
  'Computer Science': ['Data representation', 'Data transmission', 'Hardware', 'Software', 'The internet and its uses', 'Automated and emerging technologies', 'Algorithms and problem-solving', 'Programming', 'Databases'],
  Physics: ['Motion, forces and energy', 'Thermal physics', 'Waves', 'Electricity and magnetism', 'Nuclear physics', 'Space physics'],
  Chemistry: ['The particulate nature of matter', 'Experimental techniques', 'Atoms, elements and compounds', 'Stoichiometry', 'Electricity and chemistry', 'Chemical energetics', 'Chemical reactions', 'Acids, bases and salts', 'The Periodic Table', 'Metals', 'Air and water', 'Sulfur', 'Carbonates', 'Organic chemistry'],
  'Additional Maths': ['Functions', 'Quadratic functions', 'Equations, inequalities and graphs', 'Indices and logarithms', 'Coordinate geometry', 'Circular measure', 'Trigonometry', 'Permutations and combinations', 'Vectors', 'Differentiation', 'Integration'],
  Accounting: ['The purpose of accounting', 'The accounting equation', 'Double entry bookkeeping', 'Recording transactions', 'Bank reconciliation statements', 'Trial balance and errors', 'Financial statements for sole traders', 'Partnership accounts', 'Company accounts', 'Analysis and interpretation'],
  Economics: ['The basic economic problem', 'The allocation of resources', 'Microeconomic decision makers', 'Government and the macroeconomy', 'Economic development', 'International trade and globalisation', 'The balance of payments', 'Exchange rates'],
  'Business Studies': ['Understanding business activity', 'People in business', 'Marketing', 'Operations management', 'Financial information and decisions', 'External influences on business activity'],
  English: ['Reading comprehension', 'Writer\'s effects', 'Summary writing', 'Directed writing', 'Descriptive and narrative writing', 'Speaking and listening practice']
};

export function getLesson(subject, chapterIndex) {
  const chapter = curriculum[subject]?.[chapterIndex] || curriculum.Biology[0];
  const introductions = {
    Biology: 'Biology explains living systems by connecting what you can observe to the small processes happening inside organisms.',
    Mathematics: 'Mathematics is about noticing patterns, choosing a method, and checking that your answer makes sense.',
    'Computer Science': 'Computer Science turns problems into precise instructions that people and computers can follow.',
    Physics: 'Physics uses measurements, models and evidence to explain how the physical world behaves.',
    Chemistry: 'Chemistry connects the substances you can see with particles, structure and reactions you cannot see directly.',
    'Additional Maths': 'Additional Maths builds powerful ways to describe patterns and solve problems step by step.',
    Accounting: 'Accounting gives a clear, organised picture of where money comes from, where it goes, and what it means.',
    Economics: 'Economics studies choices made when people, businesses and countries have limited resources.',
    'Business Studies': 'Business Studies looks at how organisations make decisions to meet customer needs and achieve their aims.',
    English: 'English helps you understand what a writer means, how they create an effect, and how to express your own ideas clearly.'
  };
  return {
    chapter,
    explanation: `${introductions[subject]} In this unit, start by learning the main idea of ${chapter.toLowerCase()}, then practise using it in short questions before attempting harder exam-style problems.`,
    term: `Key idea: ${chapter}. Learn the definition in your own words, then use it in an example.`,
    example: `Study move: explain ${chapter.toLowerCase()} aloud in two simple sentences. If you cannot yet, ask the tutor for a smaller explanation.`
  };
}
