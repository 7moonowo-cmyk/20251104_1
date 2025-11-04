// 共用：選單、字型 preload、CSV 解析、loadQuestions()

// 選單文字與連結（按需求調整）
const menuItems = [
  { label: '回到首頁', action: () => { window.location.href = 'index.html'; } },
  { label: '第一週筆記', action: () => { window.open('https://hackmd.io/@HH25BnHCRRaH9bobDmRjtQ/HJ0WY_1neg','_blank'); } },
  { label: '第一週作業', action: () => { window.open('https://7moonowo-cmyk.github.io/20251014_2/','_blank'); } },
  { label: '第二週筆記', action: () => { window.open('https://hackmd.io/@HH25BnHCRRaH9bobDmRjtQ/r11Kcbzalg','_blank'); } },
  { label: '測驗系統', action: () => { window.open('quiz.html','_blank'); } },
  { label: '淡江大學', action: () => { window.open('https://www.tku.edu.tw/','_blank'); } }
];

let menuX = 10, menuY = 10, menuW = 260, optionH = 48, menuExtraPadding = 30;

// 字型由 preloadCommon 載入（在 quiz.js preload() 呼叫）
let chironFont = null;
function preloadCommon() {
  try { chironFont = loadFont('Chiron_GoRound_TC/Chiron_GoRound_TC.ttf'); } catch (e) { chironFont = null; }
}

// 判斷選單是否該顯示（滑鼠位於左上或菜單區內）
function isMenuActive(mx, my) {
  const activation = mx >= 0 && my >= 0 && mx < 80 && my < 80;
  const menuH = optionH * menuItems.length + 10 + menuExtraPadding;
  const inside = mx >= menuX && mx <= menuX + menuW && my >= menuY && my <= menuY + menuH;
  return activation || inside;
}

// 在 p5 draw() 中呼叫以繪製選單
function drawCommonMenu() {
  push();
  rectMode(CORNER);
  translate(menuX, menuY);
  const menuH = optionH * menuItems.length + 10 + menuExtraPadding;
  noStroke();
  fill(30,220);
  rect(0, 0, menuW, menuH, 8);

  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  if (chironFont) textFont(chironFont);
  text('檢視選單', 12, 6);

  for (let i=0;i<menuItems.length;i++){
    let y = 34 + i * optionH;
    // 背景
    if (mouseX >= menuX && mouseX <= menuX + menuW && mouseY >= menuY + y && mouseY <= menuY + y + optionH) {
      fill(255,20); rect(8,y,menuW-16,optionH-6,6);
      cursor(HAND);
    } else {
      fill(255,8); rect(8,y,menuW-16,optionH-6,6);
    }
    fill(255); textSize(14); textAlign(LEFT, CENTER);
    text(menuItems[i].label, 20, y + (optionH-6)/2);
  }
  pop();
}

// 點擊選單時呼叫（使用 Math.floor，不依賴 p5 floor）
function handleCommonMenuPressed(mx, my) {
  const menuH = optionH * menuItems.length + 10 + menuExtraPadding;
  if (!(mx >= menuX && mx <= menuX + menuW && my >= menuY && my <= menuY + menuH)) return false;
  const localY = my - menuY - 34;
  const idx = Math.floor(localY / optionH);
  if (idx < 0 || idx >= menuItems.length) return false;
  const item = menuItems[idx];
  if (item && typeof item.action === 'function') item.action();
  return true;
}

// ---------- CSV / 題庫載入 ----------

// 輕量 CSV parser，支援 quoted fields 與 BOM
function parseCSV(text) {
  if (!text || typeof text !== 'string') return [];
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let cur = '', row = [], inQ = false;
  for (let i=0;i<text.length;i++){
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) { row.push(cur); cur = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQ) {
      if (ch === '\r' && text[i+1] === '\n') {}
      row.push(cur); cur = '';
      rows.push(row.map(s=>s.trim())); row = [];
      if (ch === '\r' && text[i+1] === '\n') i++;
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row.map(s=>s.trim())); }
  return rows.filter(r => r.length && r.some(c=>c!==''));
}

// 轉成標準 question 物件：{question, options:[A,B,C,D], answer, explanation}
function mapRowsToQuestions(rows) {
  if (!rows || !rows.length) return [];
  const header = rows[0].map(h => h ? h.replace(/^\uFEFF/, '') : h);
  const hasHeader = header.some(h => /question|題|問|option|答案|answer/i.test(h));
  const start = hasHeader ? 1 : 0;
  function find(regex){ for (let i=0;i<header.length;i++) if (regex.test(header[i])) return i; return -1; }
  const qIdx = find(/question|題|問|q/i);
  const aIdx = find(/^(A|option.?A|選項.?A)/i);
  const bIdx = find(/^(B|option.?B|選項.?B)/i);
  const cIdx = find(/^(C|option.?C|選項.?C)/i);
  const dIdx = find(/^(D|option.?D|選項.?D)/i);
  const ansIdx = find(/answer|答案|ans/i);
  const exIdx = find(/explan|解析|說明/i);

  const out = [];
  for (let r = start; r < rows.length; r++){
    const row = rows[r];
    if ((qIdx === -1 || aIdx === -1) && row.length >= 5) {
      out.push({ question: row[0], options: [row[1]||'', row[2]||'', row[3]||'', row[4]||''], answer: row[5]||'', explanation: row[6]||'' });
    } else if (qIdx !== -1 && aIdx !== -1) {
      out.push({ question: row[qIdx]||'', options: [row[aIdx]||'', row[bIdx]||'', row[cIdx]||'', row[dIdx]||''], answer: ansIdx !== -1 ? (row[ansIdx]||'') : '', explanation: exIdx !== -1 ? (row[exIdx]||'') : '' });
    }
  }
  return out.filter(q => q.question && q.options && q.options.length === 4).map(q => ({ question: q.question, options: q.options, answer: normalizeAnswer(q.answer), explanation: q.explanation||'' }));
}

function normalizeAnswer(a){ if(!a) return ''; a = a.toString().trim(); if(/^[A-Da-d]$/.test(a)) return a.toUpperCase(); return a; }

// loadQuestions: fetch then XHR fallback（避免 file:// 問題）
function loadQuestions(path='questions.csv') {
  return fetch(path).then(r => {
    if (!r.ok) throw new Error('fetch failed: ' + r.status);
    return r.text();
  }).then(txt => mapRowsToQuestions(parseCSV(txt)))
  .catch(fetchErr => {
    // XHR fallback
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onload = function(){
          if (xhr.status === 0 || (xhr.status >=200 && xhr.status < 300)) {
            resolve(mapRowsToQuestions(parseCSV(xhr.responseText)));
          } else reject(new Error('XHR failed: ' + xhr.status));
        };
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.send();
      } catch (e) {
        reject(new Error('both fetch and XHR failed: ' + (fetchErr && fetchErr.message)));
      }
    });
  });
}