let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

function loadQuestions(data) {
  const rows = data.split('\n');
  rows.forEach(row => {
    const cols = row.split(',');
    if (cols.length > 1) {
      const question = {
        question: cols[0],
        options: cols.slice(1, -1),
        answer: cols[cols.length - 1]
      };
      questions.push(question);
    }
  });
}

function displayQuestion() {
  if (currentQuestionIndex < questions.length) {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const currentQuestion = questions[currentQuestionIndex];

    questionElement.textContent = currentQuestion.question;
    optionsElement.innerHTML = '';

    currentQuestion.options.forEach((option, index) => {
      const optionButton = document.createElement('button');
      optionButton.textContent = option;
      optionButton.onclick = () => selectAnswer(option);
      optionsElement.appendChild(optionButton);
    });
  } else {
    displayResults();
  }
}

function selectAnswer(selectedOption) {
  userAnswers[currentQuestionIndex] = selectedOption;
  currentQuestionIndex++;
  displayQuestion();
}

function displayResults() {
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  questionElement.textContent = '測驗結束！';
  optionsElement.innerHTML = '';

  userAnswers.forEach((answer, index) => {
    const result = document.createElement('div');
    result.textContent = `問題 ${index + 1}: 你的答案是 "${answer}"`;
    optionsElement.appendChild(result);
  });
}

function startQuiz() {
  fetch('questions.csv')
    .then(response => response.text())
    .then(data => {
      loadQuestions(data);
      displayQuestion();
    });
}

document.addEventListener('DOMContentLoaded', startQuiz);