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

const QUESTION_CLOUD_PREFIX = 'cloud://cloud1-7guzclow2433464f.636c-cloud1-7guzclow2433464f-1258107587/images/questions/'

const BATTLE_QUESTIONS = QUESTION_ANSWERS.map((answer, index) => ({
  id: `q${index + 1}`,
  picture: `${QUESTION_CLOUD_PREFIX}${index + 1}.png`,
  options: ['A', 'B', 'C', 'D'],
  answer
}))

function getBattleQuestionMap() {
  return BATTLE_QUESTIONS.reduce((map, question) => {
    map[question.id] = { ...question }
    return map
  }, {})
}

module.exports = {
  BATTLE_QUESTIONS,
  getBattleQuestionMap
}
