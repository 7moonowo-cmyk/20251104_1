let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

function displayQuestion() {
  const questionContainer = document.getElementById('question-container');
  const optionsContainer = document.getElementById('options-container');
  
  // Clear previous question
  questionContainer.innerHTML = '';
  optionsContainer.innerHTML = '';

  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    
    // Display question
    const questionElement = document.createElement('h2');
    questionElement.textContent = question.question;
    questionContainer.appendChild(questionElement);
    
    // Display options
    question.options.forEach((option, index) => {
      const optionElement = document.createElement('button');
      optionElement.textContent = option;
      optionElement.onclick = () => selectAnswer(index);
      optionsContainer.appendChild(optionElement);
    });
  } else {
    displayResults();
  }
}

function selectAnswer(selectedIndex) {
  userAnswers[currentQuestionIndex] = selectedIndex;
  currentQuestionIndex++;
  displayQuestion();
}

function displayResults() {
  const questionContainer = document.getElementById('question-container');
  const optionsContainer = document.getElementById('options-container');
  
  questionContainer.innerHTML = '<h2>測驗結束！</h2>';
  optionsContainer.innerHTML = '';

  // Display user answers and correct answers
  questions.forEach((question, index) => {
    const resultElement = document.createElement('p');
    const userAnswer = userAnswers[index] !== undefined ? question.options[userAnswers[index]] : '未回答';
    const correctAnswer = question.correctAnswer;
    resultElement.textContent = `問題 ${index + 1}: ${question.question} - 你的答案: ${userAnswer} - 正確答案: ${correctAnswer}`;
    optionsContainer.appendChild(resultElement);
  });
}

function resetQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  displayQuestion();
}

function setQuestions(newQuestions) {
  questions = newQuestions;
  resetQuiz();
}