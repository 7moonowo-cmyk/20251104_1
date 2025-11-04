// 測驗頁面：依賴 common.js 的 preloadCommon / loadQuestions / menu

let questions = [], order = [], currentIndex = 0, userAnswers = [];
let qDiv, optsRadio, btnPrev, btnNext, progressDiv, resultDiv;
let introDiv, startBtn;                 // 新增：開始頁面 UI
let menuAllowed = true;                 // 新增：控制選單是否可見 / 可互動
let questionsLoaded = false;            // 新增：題庫是否已載入
const MAX_QUESTIONS = 10;

function preload(){ /* 不載入外部字型以避免載入錯誤 */ }

function setup(){
  createCanvas(windowWidth, windowHeight).position(0,0).style('display','block');
  // 不設定外部字型，使用瀏覽器系統字型

  // DOM
  qDiv = createDiv('').addClass('quiz-ui').style('color','#fff');
  optsRadio = createRadio().addClass('quiz-ui');
  btnPrev = createButton('上一題').addClass('quiz-ui').mousePressed(onPrev).attribute('disabled', true);
  btnNext = createButton('下一題').addClass('quiz-ui').mousePressed(onNext).attribute('disabled', true);
  progressDiv = createDiv('').addClass('quiz-ui').style('color','#fff');
  resultDiv = createDiv('').addClass('quiz-ui').hide().addClass('result-box');

  layoutUI();

  // --- 新增：建立開始畫面（初始顯示），開始按鈕在題庫載入完成後啟用 ---
  introDiv = createDiv('').addClass('quiz-ui')
    .html('<h1 style="margin:0 0 12px 0;">測驗系統</h1><div style="color:#ddd;">按下開始進入測驗</div>')
    .style('position','absolute').style('left','50%').style('top','30%')
    .style('transform','translate(-50%,0)').style('text-align','center')
    .style('background','rgba(0,0,0,0.6)').style('padding','24px').style('border-radius','8px');
  startBtn = createButton('開始測驗').parent(introDiv).mousePressed(startQuiz).attribute('disabled', true).style('margin-top','12px');
  // 隱藏題目 UI，直到按開始
  qDiv.hide(); optsRadio.hide(); btnPrev.hide(); btnNext.hide(); progressDiv.hide();
  // --- end 新增 ---

  // 載入題庫：優先使用共用 loadQuestions，若不存在則使用內建 fetch+XHR fallback
  const loader = (typeof loadQuestions === 'function') ? loadQuestions : function(path='questions.csv') {
    return fetch(path).then(r => {
      if (!r.ok) throw new Error('fetch failed: ' + r.status);
      return r.text();
    }).then(txt => {
      if (typeof parseCSV === 'function' && typeof mapRowsToQuestions === 'function') {
        return mapRowsToQuestions(parseCSV(txt));
      } else {
        // 簡單解析：每行逗號分隔（最後手動處理）
        const rows = txt.split(/\r?\n/).map(l => l.split(',').map(c=>c.trim()));
        return rows;
      }
    }).catch(fetchErr => {
      // XHR fallback
      return new Promise((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', path, true);
          xhr.onload = function() {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
              try {
                const rows = (typeof parseCSV === 'function') ? mapRowsToQuestions(parseCSV(xhr.responseText)) : xhr.responseText.split(/\r?\n/).map(l=>l.split(','));
                resolve(rows);
              } catch (e) { reject(e); }
            } else {
              reject(new Error('XHR failed: ' + xhr.status));
            }
          };
          xhr.onerror = function() { reject(new Error('XHR network error')); };
          xhr.send();
        } catch (e) {
          reject(new Error('both fetch and XHR failed: ' + (fetchErr && fetchErr.message ? fetchErr.message : e.message)));
        }
      });
    });
  };

  // 修改：載入完成後不自動跳題，僅標記載入完成並啟用開始按鈕
  loader('questions.csv').then(qs => {
    questions = qs || [];
    if (questions.length && questions[0].question === undefined && typeof mapRowsToQuestions === 'function') {
      questions = mapRowsToQuestions(questions);
    }
    questions = questions.filter(q => q && q.question && !q.question.includes('在 HTML 文件中，哪一個標籤包含您網頁上真正會顯示給使用者看的所有內容'));
    if (!questions.length) {
      // 顯示錯誤於題目區並啟用開始按鈕為不可用
      qDiv.html('題庫空或被過濾'); qDiv.show();
      console.error('questions empty after load/filter', questions);
      startBtn.attribute('disabled', true);
      questionsLoaded = false;
      return;
    }
    // 只標記題庫可用，並啟用開始按鈕（由使用者按下開始）
    questionsLoaded = true;
    startBtn.removeAttribute('disabled');
  }).catch(err => {
    const msg = err && err.message ? err.message : String(err);
    qDiv.html('題庫載入失敗：' + msg + '。請使用本機 HTTP 伺服器（例如：在專案資料夾執行 python -m http.server 8000），並在開發者工具查看詳細錯誤。');
    qDiv.show();
    console.error('load questions error:', err);
    startBtn.attribute('disabled', true);
  });
}

function draw(){
  background('#0b1020');
  fill(255); textAlign(CENTER, TOP); textSize(28);
  text('測驗系統', width/2, 70);
  // 修改：只有當 menuAllowed 為 true 時，才根據 isMenuActive 顯示選單
  if (menuAllowed && isMenuActive(mouseX, mouseY)) drawCommonMenu();
}

function layoutUI(){
  const left = width * 0.08, w = width * 0.84;
  qDiv.position(left, 140).style('width', w + 'px').style('font-size','18px');
  optsRadio.position(left, 200).style('display','block').style('padding','6px');
  btnPrev.position(left, 380);
  btnNext.position(left + 140, 380);
  progressDiv.position(left, 430);
  resultDiv.position(left, 470).style('width', w + 'px');
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
  document.body.style.background = ''; // 非結果頁恢復
  const q = questions[order[i]];
  qDiv.html(`<strong>第 ${i+1} 題：</strong> ${escapeHtml(q.question)}`);
  optsRadio.elt.innerHTML = '';
  const letters = ['A','B','C','D'];
  for (let k=0;k<4;k++) optsRadio.option(letters[k], q.options[k] || '');
  // 每選項間加空行與套字型
  const labels = optsRadio.elt.querySelectorAll('label');
  labels.forEach(l => { l.style.display='block'; l.style.marginBottom='12px'; l.style.whiteSpace='pre-wrap'; }); // 使用系統字型

  // 恢復先前答案
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
  // 設定頁面背景黑色（並確保下拉到最下方仍為黑）
  document.body.style.background = '#000';
  resultDiv.show();
  // 測驗結束後允許再次顯示選單
  menuAllowed = true;
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

// 若滑鼠點擊選單，交給共用處理（且僅在 menuAllowed 時）
function mousePressed(){ if (menuAllowed && isMenuActive(mouseX, mouseY)) handleCommonMenuPressed(mouseX, mouseY); }

// 新增：開始按鈕處理，按下後關閉開始畫面並進入測驗（測驗進行時關閉選單）
function startQuiz(){
  if (!questionsLoaded) return;
  // 隱藏開始畫面，顯示題目 UI
  introDiv.hide();
  qDiv.show(); optsRadio.show(); btnPrev.show(); btnNext.show(); progressDiv.show();
  // 開始測驗，啟用題目順序，並暫時禁止選單出現
  menuAllowed = false;
  pickRandomQuestions();
  showQuestion(0);
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