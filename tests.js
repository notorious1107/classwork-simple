const test = require("node:test");
const assert = require("node:assert/strict");
const {
  generateQuestion,
  evaluateAnswer,
  summarizeRecords,
} = require("./app.js");

test("20以内加减法的题目和答案都在0到20之间", () => {
  for (let i = 0; i < 100; i += 1) {
    const question = generateQuestion("add-sub-20");
    assert.match(question.expression, /^\d+ [+-] \d+$/);
    assert.ok(question.answer >= 0 && question.answer <= 20);
  }
});

test("20以内乘除法只生成整数答案", () => {
  for (let i = 0; i < 100; i += 1) {
    const question = generateQuestion("mul-div-20");
    assert.match(question.expression, /^\d+ [×÷] \d+$/);
    assert.ok(Number.isInteger(question.answer));
    assert.ok(question.answer >= 0 && question.answer <= 20);
  }
});

test("100以内混合运算结果保持为非负整数且不超过100", () => {
  for (let i = 0; i < 200; i += 1) {
    const question = generateQuestion("mixed-100");
    assert.match(question.expression, /^[\d ()+\-×÷]+$/);
    assert.ok(Number.isInteger(question.answer));
    assert.ok(question.answer >= 0 && question.answer <= 100);
  }
});

test("判题能忽略答案两边空格并拒绝空答案", () => {
  assert.equal(evaluateAnswer(" 12 ", 12), true);
  assert.equal(evaluateAnswer("", 0), false);
  assert.equal(evaluateAnswer("abc", 0), false);
  assert.equal(evaluateAnswer("13", 12), false);
});

test("记录统计返回总题数、正确数、错误数和正确率", () => {
  const summary = summarizeRecords([
    { correct: true },
    { correct: false },
    { correct: true },
  ]);

  assert.deepEqual(summary, {
    total: 3,
    correct: 2,
    wrong: 1,
    accuracy: 67,
  });
});

test("没有记录时正确率为0", () => {
  assert.deepEqual(summarizeRecords([]), {
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
  });
});
