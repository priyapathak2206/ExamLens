/**
 * Sample Technical Question Bank for B.Tech IT Online Assessment
 */
export const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctAnswer: 1, // Stack
  },
  {
    id: 2,
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 2, // O(n²)
  },
  {
    id: 3,
    question: 'Which SQL command is used to retrieve data from a relational database table?',
    options: ['FETCH', 'GET', 'SELECT', 'EXTRACT'],
    correctAnswer: 2, // SELECT
  },
  {
    id: 4,
    question: 'In object-oriented programming, what concept allows a subclass to provide a specific implementation of a method already defined in its superclass?',
    options: ['Method Overloading', 'Method Overriding', 'Encapsulation', 'Abstraction'],
    correctAnswer: 1, // Method Overriding
  },
  {
    id: 5,
    question: 'Which layer of the OSI model is responsible for routing IP packets across network boundaries?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctAnswer: 1, // Network Layer
  },
  {
    id: 6,
    question: 'What process occurs when a CPU switches execution from one process thread to another, saving and restoring state?',
    options: ['Paging', 'Context Switching', 'Thrashing', 'Deadlock Detection'],
    correctAnswer: 1, // Context Switching
  },
  {
    id: 7,
    question: 'In HTTP protocol, which status code represents "404"?',
    options: ['OK', 'Unauthorized', 'Forbidden', 'Not Found'],
    correctAnswer: 3, // Not Found
  },
  {
    id: 8,
    question: 'Which storage mechanism in modern web browsers persists key-value data with no expiration time across sessions?',
    options: ['sessionStorage', 'Cookies', 'localStorage', 'IndexedDB Memory'],
    correctAnswer: 2, // localStorage
  },
  {
    id: 9,
    question: 'In Git version control, which command creates a new branch and immediately switches to it?',
    options: ['git branch <name>', 'git checkout -b <name>', 'git merge <name>', 'git commit -b <name>'],
    correctAnswer: 1, // git checkout -b <name>
  },
  {
    id: 10,
    question: 'What is the main advantage of using a Hash Table for key lookups?',
    options: ['Guaranteed sorted order', 'O(1) average time complexity', 'Minimal memory usage', 'No collision handling required'],
    correctAnswer: 1, // O(1) average time complexity
  },
];

/**
 * Fisher-Yates Shuffle helper
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a fresh randomized exam attempt with shuffled questions and shuffled options.
 */
export function generateRandomizedExam(questionsBank = SAMPLE_QUESTIONS) {
  const shuffledQuestions = shuffleArray(questionsBank);

  return shuffledQuestions.map((q) => {
    const correctAnswerText = q.options[q.correctAnswer];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
    };
  });
}
