let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

function initQuiz() {
  loadQuestions().then(() => {
    displayQuestion();
  });
}

function loadQuestions() {
  return fetch('questions.csv')
    .then(response => response.text())
    .then(data => {
      questions = parseCSV(data);
    });
}

function parseCSV(data) {
  const lines = data.split('\n');
  return lines.map(line => {
    const [question, ...options] = line.split(',');
    return {
      question,
      options: options.slice(0, -1), // Exclude the last element which is the answer
      answer: options[options.length - 1]
    };
  });
}

function displayQuestion() {
  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    updateUI(question);
  } else {
    endQuiz();
  }
}

function updateUI(question) {
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  
  questionElement.textContent = question.question;
  optionsElement.innerHTML = '';

  question.options.forEach((option, index) => {
    const optionButton = document.createElement('button');
    optionButton.textContent = option;
    optionButton.onclick = () => selectAnswer(option);
    optionsElement.appendChild(optionButton);
  });
}

function selectAnswer(selectedOption) {
  userAnswers.push(selectedOption);
  currentQuestionIndex++;
  displayQuestion();
}

function endQuiz() {
  const resultElement = document.getElementById('result');
  resultElement.textContent = '測驗結束！您的答案是：' + userAnswers.join(', ');
}

document.addEventListener('DOMContentLoaded', initQuiz);