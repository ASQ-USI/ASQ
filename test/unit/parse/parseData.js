"use strict";

module.exports = {
  exercises: [{
    htmlId : 'ex-1',
    questions: [
      {
        stem : "HELLO?",
        stemText: "HELLO?",
        htmlId: 'q-1',
        slideHtmlId : 's-1',
        questionType: 'multi-choice',
        formButtonType : "radio",
        questionOptions : [
          {
            text: "Hello back!",
            classList: 'asq-option',
            correct: true
          },
          {
            text: "I don't know you!",
            classList: 'asq-option',
            correct: false
          }
        ]
      },
      {
        stem : "HELLO2?",
        stemText: "HELLO2?",
        htmlId: 'q-2',
        slideHtmlId : 's-3',
        questionType: 'multi-choice',
        formButtonType : "radio",
        questionOptions : [
          {
            text: "Hello back!",
            classList: 'asq-option',
            correct: true
          },
          {
            text: "I don't know you!",
            classList: 'asq-option',
            correct: false
          }
        ]
      }
    ] 
  }],
  rubrics: [
    {
      stem: "Rubric1",
      stemText: "Rubric1",
      htmlId: 'r-1',
      question: 'q-1',
      questionType: 'multi-choice',
      criteria: [
        {
          points: "100",
          label: "Correct",
          desc: "The answer is correct"
        },
        {
          points: "0",
          label: "Incorrect",
          desc: "The answer is NOT correct"
        }
      ],
      maxScore: 100,
      deductPoints: true,
      formButtonType: "radio",
      statTypes: ['rubric-mcq']
    },
     {
      stem: "Rubric2",
      stemText: "Rubric2",
      htmlId: 'r-2',
      question: 'q-2',
      questionType: 'multi-choice',
      criteria: [
        {
          points: "100",
          label: "Correct",
          desc: "The answer is correct"
        },
        {
          points: "0",
          label: "Incorrect",
          desc: "The answer is NOT correct"
        }
      ],
      maxScore: 100,
      deductPoints: true,
      formButtonType: "radio",
      statTypes: ['rubric-mcq']
    }
  ],
  stats: [
    {
      questionHtmlId: 'q-1',
      slideHtmlId: 's-2'
    },
    {
      questionHtmlId: 'q-2',
      slideHtmlId: 's-4'
    }
  ]
}
