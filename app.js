(function () {
  "use strict";

  const LEVELS = {
    "add-sub-20": "20以内加减法",
    "mul-div-20": "20以内乘除法",
    "mixed-100": "100以内四则混合",
  };

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateAddSub20() {
    if (Math.random() < 0.5) {
      const a = randomInt(0, 20);
      const b = randomInt(0, 20 - a);
      return { expression: `${a} + ${b}`, answer: a + b };
    }

    const a = randomInt(0, 20);
    const b = randomInt(0, a);
    return { expression: `${a} - ${b}`, answer: a - b };
  }

  function generateMulDiv20() {
    if (Math.random() < 0.5) {
      const a = randomInt(0, 10);
      const maxB = a === 0 ? 10 : Math.min(10, Math.floor(20 / a));
      const b = randomInt(0, maxB);
      return { expression: `${a} × ${b}`, answer: a * b };
    }

    const divisor = randomInt(1, 10);
    const quotient = randomInt(0, Math.min(10, Math.floor(20 / divisor)));
    const dividend = divisor * quotient;
    return { expression: `${dividend} ÷ ${divisor}`, answer: quotient };
  }

  function generateMixed100() {
    const template = randomInt(0, 4);

    if (template === 0) {
      const a = randomInt(0, 70);
      const b = randomInt(0, 100 - a);
      const c = randomInt(0, a + b);
      return { expression: `${a} + ${b} - ${c}`, answer: a + b - c };
    }

    if (template === 1) {
      const b = randomInt(1, 10);
      const c = randomInt(0, 10);
      const a = randomInt(0, 100 - b * c);
      return { expression: `${a} + ${b} × ${c}`, answer: a + b * c };
    }

    if (template === 2) {
      const a = randomInt(0, 10);
      const b = randomInt(0, 10);
      const product = a * b;
      const c = randomInt(0, 100 - product);
      return { expression: `${a} × ${b} + ${c}`, answer: product + c };
    }

    if (template === 3) {
      const divisor = randomInt(1, 10);
      const quotient = randomInt(1, 10);
      const total = divisor * quotient;
      const a = randomInt(0, total);
      const b = total - a;
      return {
        expression: `(${a} + ${b}) ÷ ${divisor}`,
        answer: quotient,
      };
    }

    const difference = randomInt(0, 10);
    const b = randomInt(0, 20 - difference);
    const a = b + difference;
    const c = difference === 0 ? randomInt(1, 10) : randomInt(1, Math.min(10, Math.floor(100 / difference)));
    return {
      expression: `(${a} - ${b}) × ${c}`,
      answer: difference * c,
    };
  }

  function generateQuestion(level) {
    if (level === "add-sub-20") return generateAddSub20();
    if (level === "mul-div-20") return generateMulDiv20();
    if (level === "mixed-100") return generateMixed100();
    throw new Error(`未知难度：${level}`);
  }

  function evaluateAnswer(input, expected) {
    if (String(input).trim() === "") return false;
    const value = Number(input);
    return Number.isFinite(value) && value === expected;
  }

  function summarizeRecords(records) {
    const total = records.length;
    const correct = records.filter((record) => record.correct).length;
    const wrong = total - correct;
    return {
      total,
      correct,
      wrong,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    };
  }

  const api = { LEVELS, generateQuestion, evaluateAnswer, summarizeRecords };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined") {
    window.MathPractice = api;
    window.addEventListener("DOMContentLoaded", setupApp);
  }

  function setupApp() {
    const storageKey = "math-practice-records-v1";
    const nameKey = "math-practice-child-name-v1";
    const levelSelect = document.querySelector("#level");
    const childName = document.querySelector("#child-name");
    const expression = document.querySelector("#expression");
    const answerInput = document.querySelector("#answer");
    const submitButton = document.querySelector("#submit-answer");
    const nextButton = document.querySelector("#next-question");
    const feedback = document.querySelector("#feedback");
    const progressText = document.querySelector("#progress-text");
    const progressBar = document.querySelector("#progress-bar");
    const sessionScore = document.querySelector("#session-score");
    const historyBody = document.querySelector("#history-body");
    const historyEmpty = document.querySelector("#history-empty");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const clearButton = document.querySelector("#clear-history");
    const exportButton = document.querySelector("#export-history");
    const tabs = document.querySelectorAll("[data-tab]");
    const panels = document.querySelectorAll("[data-panel]");

    let currentQuestion = null;
    let questionNumber = 1;
    let sessionCorrect = 0;
    let answered = false;
    let activeFilter = "all";

    childName.value = localStorage.getItem(nameKey) || "";

    childName.addEventListener("change", () => {
      localStorage.setItem(nameKey, childName.value.trim());
    });

    function readRecords() {
      try {
        const records = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(records) ? records : [];
      } catch {
        return [];
      }
    }

    function writeRecords(records) {
      localStorage.setItem(storageKey, JSON.stringify(records));
    }

    function showQuestion() {
      currentQuestion = generateQuestion(levelSelect.value);
      expression.textContent = `${currentQuestion.expression} = ?`;
      answerInput.value = "";
      answerInput.disabled = false;
      submitButton.hidden = false;
      nextButton.hidden = true;
      feedback.className = "feedback";
      feedback.textContent = "算好后，把答案填在下面。";
      answered = false;
      progressText.textContent = `第 ${questionNumber} / 10 题`;
      progressBar.style.width = `${(questionNumber - 1) * 10}%`;
      sessionScore.textContent = `本轮答对 ${sessionCorrect} 题`;
      answerInput.focus();
    }

    function resetSession() {
      questionNumber = 1;
      sessionCorrect = 0;
      showQuestion();
    }

    function submitAnswer() {
      if (answered) return;
      if (answerInput.value.trim() === "") {
        feedback.className = "feedback warning";
        feedback.textContent = "请先填写答案。";
        answerInput.focus();
        return;
      }

      const isCorrect = evaluateAnswer(answerInput.value, currentQuestion.answer);
      answered = true;
      if (isCorrect) sessionCorrect += 1;

      const record = {
        id: Date.now(),
        child: childName.value.trim() || "孩子",
        level: levelSelect.value,
        expression: currentQuestion.expression,
        submitted: answerInput.value.trim(),
        answer: currentQuestion.answer,
        correct: isCorrect,
        createdAt: new Date().toISOString(),
      };
      writeRecords([record, ...readRecords()]);

      answerInput.disabled = true;
      submitButton.hidden = true;
      nextButton.hidden = false;
      feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
      feedback.textContent = isCorrect
        ? "答对啦！"
        : `这次没答对。正确答案是 ${currentQuestion.answer}。`;
      progressBar.style.width = `${questionNumber * 10}%`;
      sessionScore.textContent = `本轮答对 ${sessionCorrect} 题`;
      nextButton.textContent = questionNumber === 10 ? "再练一组" : "下一题";
      renderHistory();
      nextButton.focus();
    }

    function nextQuestion() {
      if (questionNumber === 10) {
        resetSession();
        return;
      }
      questionNumber += 1;
      showQuestion();
    }

    function formatDate(iso) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    }

    function renderHistory() {
      const records = readRecords();
      const visible = activeFilter === "wrong"
        ? records.filter((record) => !record.correct)
        : records;
      const summary = summarizeRecords(records);

      document.querySelector("#total-count").textContent = summary.total;
      document.querySelector("#correct-count").textContent = summary.correct;
      document.querySelector("#wrong-count").textContent = summary.wrong;
      document.querySelector("#accuracy").textContent = `${summary.accuracy}%`;

      historyBody.replaceChildren();
      historyEmpty.hidden = visible.length !== 0;

      visible.forEach((record) => {
        const row = document.createElement("tr");
        const statusText = record.correct ? "正确" : "错误";
        row.innerHTML = `
          <td>${escapeHtml(formatDate(record.createdAt))}</td>
          <td>${escapeHtml(record.child)}</td>
          <td>${escapeHtml(LEVELS[record.level] || record.level)}</td>
          <td class="question-cell">${escapeHtml(record.expression)}</td>
          <td>${escapeHtml(record.submitted)}</td>
          <td>${escapeHtml(String(record.answer))}</td>
          <td><span class="status ${record.correct ? "ok" : "bad"}">${statusText}</span></td>
        `;
        historyBody.appendChild(row);
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function exportHistory() {
      const records = readRecords();
      if (records.length === 0) {
        window.alert("还没有练习记录可以导出。");
        return;
      }

      const rows = [
        ["时间", "姓名", "难度", "题目", "孩子答案", "正确答案", "结果"],
        ...records.map((record) => [
          new Date(record.createdAt).toLocaleString("zh-CN"),
          record.child,
          LEVELS[record.level] || record.level,
          record.expression,
          record.submitted,
          record.answer,
          record.correct ? "正确" : "错误",
        ]),
      ];
      const csv = rows.map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      ).join("\r\n");
      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `数学练习记录-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    submitButton.addEventListener("click", submitAnswer);
    nextButton.addEventListener("click", nextQuestion);
    answerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        answered ? nextQuestion() : submitAnswer();
      }
    });
    levelSelect.addEventListener("change", resetSession);

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.toggle("active", item === button));
        renderHistory();
      });
    });

    clearButton.addEventListener("click", () => {
      if (readRecords().length === 0) return;
      if (window.confirm("确定要清空全部练习记录吗？清空后无法恢复。")) {
        writeRecords([]);
        renderHistory();
      }
    });

    exportButton.addEventListener("click", exportHistory);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((item) => item.classList.toggle("active", item === tab));
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.panel !== target;
        });
        if (target === "history") renderHistory();
      });
    });

    showQuestion();
    renderHistory();
  }
})();
