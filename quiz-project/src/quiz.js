let questions = [], order = [], currentIndex = 0, userAnswers = [];
let qDiv, optsRadio, btnPrev, btnNext, progressDiv, resultDiv, startDiv;
const MAX_QUESTIONS = 10;
let isQuizActive = false;

function preload(){ /* 不載入外部字型以避免載入錯誤 */ }

function setup(){
  createCanvas(windowWidth, windowHeight).position(0,0).style('display','block');

  // DOM
  startDiv = createDiv('<h1>測驗系統</h1><button id="startQuiz" class="quiz-ui">開始測驗</button>').addClass('quiz-ui').style('color','#fff').style('text-align', 'center').style('margin-top', '200px');
  qDiv = createDiv('').addClass('quiz-ui').style('color','#fff').hide();
  optsRadio = createRadio().addClass('quiz-ui').hide();
  btnPrev = createButton('上一題').addClass('quiz-ui').mousePressed(onPrev).attribute('disabled', true).hide();
  btnNext = createButton('下一題').addClass('quiz-ui').mousePressed(onNext).attribute('disabled', true).hide();
  progressDiv = createDiv('').addClass('quiz-ui').style('color','#fff').hide();
  resultDiv = createDiv('').addClass('quiz-ui').hide().addClass('result-box');

  layoutUI();

  // 監聽開始測驗按鈕
  select('#startQuiz').mousePressed(startQuiz);

  // 載入題庫
  loadQuestions('questions.csv').then(qs => {
    questions = qs || [];
    if (questions.length && questions[0].question === undefined && typeof mapRowsToQuestions === 'function') {
      questions = mapRowsToQuestions(questions);
    }
    questions = questions.filter(q => q && q.question && !q.question.includes('在 HTML 文件中，哪一個標籤包含您網頁上真正會顯示給使用者看的所有內容'));
    if (!questions.length) {
      qDiv.html('題庫空或被過濾');
      console.error('questions empty after load/filter', questions);
      return;
    }
  }).catch(err => {
    const msg = err && err.message ? err.message : String(err);
    qDiv.html('題庫載入失敗：' + msg);
    console.error('load questions error:', err);
  });
}

function draw(){
  background('#0b1020');
  fill(255); textAlign(CENTER, TOP); textSize(28);
  if (isQuizActive) {
    text('測驗系統', width/2, 70);
    if (isMenuActive(mouseX, mouseY)) drawCommonMenu();
  }
}

function layoutUI(){
  const left = width * 0.08, w = width * 0.84;
  startDiv.position(left, 140).style('width', w + 'px').style('font-size','18px');
  qDiv.position(left, 140).style('width', w + 'px').style('font-size','18px').hide();
  optsRadio.position(left, 200).style('display','block').style('padding','6px').hide();
  btnPrev.position(left, 380).hide();
  btnNext.position(left + 140, 380).hide();
  progressDiv.position(left, 430).hide();
  resultDiv.position(left, 470).style('width', w + 'px').hide();
}

function startQuiz() {
  startDiv.hide();
  isQuizActive = true;
  pickRandomQuestions();
  showQuestion(0);
}

function pickRandomQuestions(){
  const idx = questions.map((_,i)=>i);
  for (let i=idx.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [idx[i],idx[j]] = [idx[j],idx[i]]; }
  order = idx.slice(0, Math.min(MAX_QUESTIONS, idx.length));
  userAnswers = new Array(order.length).fill('');
  currentIndex = 0;
}

function showQuestion(i){
  if (i < 0 || i >= order.length) return showResults();
  currentIndex = i;
  resultDiv.hide();
  document.body.style.background = ''; 
  const q = questions[order[i]];
  qDiv.html(`<strong>第 ${i+1} 題：</strong> ${escapeHtml(q.question)}`);
  optsRadio.elt.innerHTML = '';
  const letters = ['A','B','C','D'];
  for (let k=0;k<4;k++) optsRadio.option(letters[k], q.options[k] || '');
  const labels = optsRadio.elt.querySelectorAll('label');
  labels.forEach(l => { l.style.display='block'; l.style.marginBottom='12px'; l.style.whiteSpace='pre-wrap'; });

  if (userAnswers[i]) { optsRadio.selected(userAnswers[i]); btnNext.removeAttribute('disabled'); }
  else { optsRadio.selected(''); btnNext.attribute('disabled', true); }
  if (i > 0) btnPrev.removeAttribute('disabled'); else btnPrev.attribute('disabled', true);

  btnNext.html(i === order.length - 1 ? '完成測驗' : '下一題');

  optsRadio.changed(()=> btnNext.removeAttribute('disabled'));
  progressDiv.html(`進度：${i+1} / ${order.length}`);
}

function onNext(){
  userAnswers[currentIndex] = optsRadio.value() || '';
  if (currentIndex < order.length - 1) showQuestion(currentIndex + 1);
  else showResults();
}
function onPrev(){
  userAnswers[currentIndex] = optsRadio.value() || '';
  if (currentIndex > 0) showQuestion(currentIndex - 1);
}

function showResults(){
  document.body.style.background = '#000';
  resultDiv.show();
  let correct = 0; const details = [];
  for (let i=0;i<order.length;i++){
    const q = questions[order[i]];
    const user = userAnswers[i] || '';
    const ans = q.answer || '';
    let ok = false;
    if (/^[A-D]$/.test(ans)) ok = (user === ans);
    else if (ans) { const idx = ['A','B','C','D'].indexOf(user); if (idx>=0 && q.options[idx].trim() === ans.trim()) ok = true; }
    if (ok) correct++;
    details.push({ q: q.question, options: q.options, selected: user, answer: ans, explanation: q.explanation || '' });
  }
  const score = correct * 10;
  let html = `<div style="font-size:20px;color:#fff;margin-bottom:12px;">完成！得分： <strong style="font-size:28px;">${score} / 100</strong></div>`;
  html += `<div style="overflow:auto; max-height:60vh;">`;
  details.forEach((d, idx) => {
    const ansText = /^[A-D]$/.test(d.answer) ? (d.options[['A','B','C','D'].indexOf(d.answer)] || '') : d.answer || '';
    html += `<div style="margin-bottom:18px;color:#fff;"><div style="font-weight:600;">${idx+1}. ${escapeHtml(d.q)}</div>`;
    html += `<div style="margin-top:6px;">你的答案： <span style="color:#ffd;">${d.selected||'未作答'}</span></div>`;
    html += `<div>正確答案： <span style="color:#8f8;">${d.answer}${ansText ? ' — ' + escapeHtml(ansText) : ''}</span></div>`;
    if (d.explanation) html += `<div style="margin-top:8px;color:#ccc;">解析： ${escapeHtml(d.explanation)}</div>`;
    html += `</div>`;
  });
  html += `</div><div style="margin-top:12px;"><button id="restart">重新作答</button></div>`;
  resultDiv.html(html);
  select('#restart').mousePressed(()=> { pickRandomQuestions(); showQuestion(0); document.body.style.background = ''; });
}

function windowResized(){ resizeCanvas(windowWidth, windowHeight); layoutUI(); }

function mousePressed(){ 
  if (isQuizActive && isMenuActive(mouseX, mouseY)) handleCommonMenuPressed(mouseX, mouseY); 
  else if (!isQuizActive && isMenuActive(mouseX, mouseY)) drawCommonMenu();
}

if (typeof escapeHtml !== 'function') {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}