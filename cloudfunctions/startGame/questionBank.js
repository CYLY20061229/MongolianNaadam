const QUESTION_ANSWERS = [
  2, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 3, 0, 0, 0,
  0, 0, 0, 0, 0, 2, 3, 0, 0, 1,
  0, 0, 0, 0, 0, 2, 1, 2, 0, 0,
  1, 0, 0, 0, 0, 3, 0, 0, 0, 0,
  0, 0, 1, 1, 0, 0, 2, 3, 1, 0,
  0, 0, 0, 2, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0
]

const BATTLE_QUESTIONS = QUESTION_ANSWERS.map((answer, index) => ({
  id: `q${index + 1}`,
  answer
}))

module.exports = {
  BATTLE_QUESTIONS
}
