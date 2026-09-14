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

const QUESTION_MAP = QUESTION_ANSWERS.reduce((map, answer, index) => {
  map[`q${index + 1}`] = { answer }
  return map
}, {})

module.exports = {
  QUESTION_MAP
}
