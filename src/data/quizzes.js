/**
 * Preguntas de los quizzes de las lecciones del sistema.
 * La clave coincide con el nombre de la ruta registrada en AppNavigator.
 */
export const CATEGORY_QUIZZES = {
  Greetings: {
    heading: 'Greetings',
    questions: [
    {
      id: 1,
      question: 'Hola',
      options: [
        { id: 1, text: 'Hello', correct: true },
        { id: 2, text: 'Bye', correct: false },
        { id: 3, text: 'Good Morning', correct: false },
        { id: 4, text: 'See you soon', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Adiós',
      options: [
        { id: 1, text: 'Hello', correct: false },
        { id: 2, text: 'Goodbye', correct: true },
        { id: 3, text: 'Thanks', correct: false },
        { id: 4, text: 'Please', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Buenos días',
      options: [
        { id: 1, text: 'Hello', correct: false },
        { id: 2, text: 'Please', correct: false },
        { id: 3, text: 'Good Morning', correct: true },
        { id: 4, text: 'Excuse me', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Buenas tardes',
      options: [
        { id: 1, text: 'Hello', correct: false },
        { id: 2, text: 'Good Afternoon', correct: true },
        { id: 3, text: 'Thank you', correct: false },
        { id: 4, text: 'Excuse me', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Buenas noches',
      options: [
        { id: 1, text: 'Hello', correct: false },
        { id: 2, text: 'Good Night', correct: true },
        { id: 3, text: 'Thank you', correct: false },
        { id: 4, text: 'Excuse me', correct: false }
      ]
    }
  ],
  },
  Fruits: {
    heading: 'Fruits',
    questions: [
    {
      id: 1,
      question: 'Manzana',
      options: [
        { id: 1, text: 'Apple', correct: true },
        { id: 2, text: 'Banana', correct: false },
        { id: 3, text: 'Cherry', correct: false },
        { id: 4, text: 'Orange', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Cambur - Banano',
      options: [
        { id: 1, text: 'Apple', correct: false },
        { id: 2, text: 'Banana', correct: true },
        { id: 3, text: 'Cherry', correct: false },
        { id: 4, text: 'Orange', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Naranja',
      options: [
        { id: 1, text: 'Watermelon', correct: false },
        { id: 2, text: 'Pineapple', correct: false },
        { id: 3, text: 'Orange', correct: true },
        { id: 4, text: 'Elderberry', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Patilla - Sandia',
      options: [
        { id: 1, text: 'Grapes', correct: false },
        { id: 2, text: 'Watermelon', correct: true },
        { id: 3, text: 'Peach', correct: false },
        { id: 4, text: 'Mango', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Cereza',
      options: [
        { id: 1, text: 'Grapes', correct: false },
        { id: 2, text: 'Cherry', correct: true },
        { id: 3, text: 'Kiwi', correct: false },
        { id: 4, text: 'Mandarin', correct: false }
      ]
    }
  ],
  },
  Family: {
    heading: 'Family',
    questions: [
    {
      id: 1,
      question: 'Padre',
      options: [
        { id: 1, text: 'Father', correct: true },
        { id: 2, text: 'Mother', correct: false },
        { id: 3, text: 'Brother', correct: false },
        { id: 4, text: 'Sister', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Madre',
      options: [
        { id: 1, text: 'Father', correct: false },
        { id: 2, text: 'Mother', correct: true },
        { id: 3, text: 'Uncle', correct: false },
        { id: 4, text: 'Aunt', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Hermano',
      options: [
        { id: 1, text: 'Cousin', correct: false },
        { id: 2, text: 'Brother', correct: true },
        { id: 3, text: 'Sister', correct: false },
        { id: 4, text: 'Son', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Abuelo',
      options: [
        { id: 1, text: 'Grandmother', correct: false },
        { id: 2, text: 'Grandfather', correct: true },
        { id: 3, text: 'Nephew', correct: false },
        { id: 4, text: 'Niece', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Hijo',
      options: [
        { id: 1, text: 'Daughter', correct: false },
        { id: 2, text: 'Son', correct: true },
        { id: 3, text: 'Child', correct: false },
        { id: 4, text: 'Parent', correct: false }
      ]
    }
  ],
  },
  Work: {
    heading: 'Work',
    questions: [
    {
      id: 1,
      question: 'Trabajo',
      options: [
        { id: 1, text: 'Job', correct: true },
        { id: 2, text: 'School', correct: false },
        { id: 3, text: 'Park', correct: false },
        { id: 4, text: 'Home', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Médico',
      options: [
        { id: 1, text: 'Teacher', correct: false },
        { id: 2, text: 'Doctor', correct: true },
        { id: 3, text: 'Engineer', correct: false },
        { id: 4, text: 'Nurse', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Profesor',
      options: [
        { id: 1, text: 'Student', correct: false },
        { id: 2, text: 'Teacher', correct: true },
        { id: 3, text: 'Boss', correct: false },
        { id: 4, text: 'Clerk', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Oficina',
      options: [
        { id: 1, text: 'Factory', correct: false },
        { id: 2, text: 'Office', correct: true },
        { id: 3, text: 'Store', correct: false },
        { id: 4, text: 'Hospital', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Dinero',
      options: [
        { id: 1, text: 'Credit', correct: false },
        { id: 2, text: 'Money', correct: true },
        { id: 3, text: 'Price', correct: false },
        { id: 4, text: 'Check', correct: false }
      ]
    }
  ],
  },
  School: {
    heading: 'School',
    questions: [
    {
      id: 1,
      question: 'Escuela',
      options: [
        { id: 1, text: 'School', correct: true },
        { id: 2, text: 'Library', correct: false },
        { id: 3, text: 'Classroom', correct: false },
        { id: 4, text: 'College', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Estudiante',
      options: [
        { id: 1, text: 'Principal', correct: false },
        { id: 2, text: 'Student', correct: true },
        { id: 3, text: 'Member', correct: false },
        { id: 4, text: 'Player', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Lápiz',
      options: [
        { id: 1, text: 'Pen', correct: false },
        { id: 2, text: 'Pencil', correct: true },
        { id: 3, text: 'Eraser', correct: false },
        { id: 4, text: 'Book', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Libro',
      options: [
        { id: 1, text: 'Paper', correct: false },
        { id: 2, text: 'Book', correct: true },
        { id: 3, text: 'Notebook', correct: false },
        { id: 4, text: 'Bag', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Examen',
      options: [
        { id: 1, text: 'Grade', correct: false },
        { id: 2, text: 'Test', correct: true },
        { id: 3, text: 'Homework', correct: false },
        { id: 4, text: 'Lesson', correct: false }
      ]
    }
  ],
  },
  Travel: {
    heading: 'Travel',
    questions: [
    {
      id: 1,
      question: 'Viaje',
      options: [
        { id: 1, text: 'Trip', correct: true },
        { id: 2, text: 'Road', correct: false },
        { id: 3, text: 'Flight', correct: false },
        { id: 4, text: 'Bus', correct: false }
      ]
    },
    {
      id: 2,
      question: 'Avión',
      options: [
        { id: 1, text: 'Boat', correct: false },
        { id: 2, text: 'Airplane', correct: true },
        { id: 3, text: 'Train', correct: false },
        { id: 4, text: 'Car', correct: false }
      ]
    },
    {
      id: 3,
      question: 'Hotel',
      options: [
        { id: 1, text: 'House', correct: false },
        { id: 2, text: 'Hotel', correct: true },
        { id: 3, text: 'Beach', correct: false },
        { id: 4, text: 'Mountain', correct: false }
      ]
    },
    {
      id: 4,
      question: 'Pasaporte',
      options: [
        { id: 1, text: 'Ticket', correct: false },
        { id: 2, text: 'Passport', correct: true },
        { id: 3, text: 'Id card', correct: false },
        { id: 4, text: 'Visa', correct: false }
      ]
    },
    {
      id: 5,
      question: 'Maleta',
      options: [
        { id: 1, text: 'Bag', correct: false },
        { id: 2, text: 'Suitcase', correct: true },
        { id: 3, text: 'Backpack', correct: false },
        { id: 4, text: 'Wallet', correct: false }
      ]
    }
  ],
  },
};
