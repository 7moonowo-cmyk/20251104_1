# JavaScript Quiz Project

## 專案簡介
這是一個 JavaScript 測驗專案，旨在提供一個互動式的測驗體驗。使用者可以從 `questions.csv` 檔案中隨機顯示問題，並記錄他們的答案。專案包含多個 JavaScript 檔案，負責不同的功能模組，包括問題顯示、使用者介面更新和 CSV 檔案的讀取。

## 檔案結構
```
js-quiz-project
├── index.html          # 應用程式的入口點
├── questions.csv       # 儲存測驗問題、選項及正確答案
├── src
│   ├── main.js         # 應用程式的主要邏輯
│   ├── quiz.js         # 與測驗相關的功能
│   ├── csvLoader.js     # 讀取和解析 CSV 檔案
│   ├── ui.js           # 更新使用者介面的功能
│   └── styles.css      # 應用程式的樣式設定
├── package.json        # npm 的配置檔
├── .gitignore          # 版本控制中應忽略的檔案和資料夾
└── README.md           # 專案的說明和使用指南
```

## 使用指南
1. **安裝依賴**: 在專案根目錄下運行 `npm install` 以安裝所需的依賴項。
2. **啟動專案**: 使用本地伺服器來啟動 `index.html`，以便在瀏覽器中查看應用程式。
3. **編輯問題**: 可以通過編輯 `questions.csv` 檔案來添加或修改測驗問題和選項。

## 功能
- 隨機顯示測驗問題
- 記錄使用者的答案
- 切換題目
- 直觀的使用者介面

## 貢獻
歡迎任何形式的貢獻！請提交問題或拉取請求以幫助改善此專案。