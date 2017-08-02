const ObjectId = require('mongoose').Types.ObjectId;

const User = [
  {
    _id : new ObjectId(),
    username: 't',
    password: 'Tt123456',
    firstname: 't',
    lastname: 't',
    regComplete: true
  }
]

const Slideshow = [
  {
    _id: new ObjectId(),
    title: 'samplepresentation',
    owner: User[0]._id,
    conversionStatus: 'done',
    pdfFile: '',
    settings: [
      {
        key: 'maxNumSubmissions',
        value: '2',
        kind: 'number',
        level: 'presentation',
      },
      {
        key: 'assessment',
        value: 'none',
        kind: 'select',
        params: {
          options: [
            'peer',
            'auto',
            'self',
            'none'
          ]
        },
        level: 'presentation',
      },
      {
        key: 'slideflow',
        value: 'ctrl',
        kind: 'select',
        params: {
          options: [
            'ctrl',
            'self'
          ]
        },
        level: 'presentation',
      }
    ],
    lastSession: null,
    exercises: [
      ObjectId('5858f2f5ce59a491084d2750'),
      ObjectId('5858f2f5ce59a491084d2751'),
      ObjectId('5858f2f5ce59a491084d2752'),
      ObjectId('5858f2f5ce59a491084d2753'),
      ObjectId('5858f2f5ce59a491084d2754'),
      ObjectId('5858f2f5ce59a491084d2755'),
      ObjectId('5858f2f5ce59a491084d2756'),
      ObjectId('5858f2f5ce59a491084d2757'),
      ObjectId('5858f2f5ce59a491084d2758'),
      ObjectId('5858f2f5ce59a491084d2759'),
      ObjectId('5858f2f5ce59a491084d275a')
    ],
    presentationFramework: 'impress.js',
    asqFile: 'index.asq.dust',
    originalFile: 'index.html',
    course: 'General',
    exercisesPerSlide: {
      'asq-rating-q': [
        '5858f2f5ce59a491084d275a'
      ],
      'asq-sqlite-q': [
        '5858f2f5ce59a491084d2759'
      ],
      'asq-fiddle-q': [
        '5858f2f5ce59a491084d2758'
      ],
      'asq-highlight-q': [
        '5858f2f5ce59a491084d2757'
      ],
      'asq-code-q': [
        '5858f2f5ce59a491084d2756'
      ],
      'asq-order-q': [
        '5858f2f5ce59a491084d2755'
      ],
      'asq-buckets-q': [
        '5858f2f5ce59a491084d2754'
      ],
      'asq-js-function-body': [
        '5858f2f5ce59a491084d2753'
      ],
      'asq-css-select-q': [
        '5858f2f5ce59a491084d2752'
      ],
      'asq-text-input-q': [
        '5858f2f5ce59a491084d2751'
      ],
      'asq-multi-choice-q': [
        '5858f2f5ce59a491084d2750'
      ]
    },
    slidesTree: {
      steps: [
        'intro',
        'asq-multi-choice-q',
        'asq-text-input-q',
        'asq-text-input-q-stats',
        'asq-css-select-q',
        'asq-js-function-body',
        'asq-buckets-q',
        'asq-order-q',
        'asq-code-q',
        'asq-highlight-q',
        'asq-fiddle-q',
        'asq-sqlite-q',
        'asq-rating-q',
        'asq-canvas'
      ],
      allSubsteps: {
        'asq-canvas': {
          active: -1,
          substeps: []
        },
        'asq-rating-q': {
          active: -1,
          substeps: []
        },
        'asq-sqlite-q': {
          active: -1,
          substeps: []
        },
        'asq-fiddle-q': {
          active: -1,
          substeps: []
        },
        'asq-highlight-q': {
          active: -1,
          substeps: []
        },
        'asq-code-q': {
          active: -1,
          substeps: []
        },
        'asq-order-q': {
          active: -1,
          substeps: []
        },
        'asq-buckets-q': {
          active: -1,
          substeps: []
        },
        'asq-js-function-body': {
          active: -1,
          substeps: []
        },
        'asq-css-select-q': {
          active: -1,
          substeps: []
        },
        'asq-text-input-q-stats': {
          active: -1,
          substeps: []
        },
        'asq-text-input-q': {
          active: -1,
          substeps: []
        },
        'asq-multi-choice-q': {
          active: -1,
          substeps: []
        },
        'intro': {
          active: -1,
          substeps: []
        }
      }
    }
  }
]

const Session = [
  {
    _id: new ObjectId(),
    slides: Slideshow[0]._id,
    presenter: User[0]._id,
    activeStatsQuestions: [

    ],
    activeQuestions: [

    ],
    activeExercises: [

    ],
    started: false,
    endDate: null,
    startDate: new Date(),
    activeSlide: 'intro',
    authLevel: 'public',
    flow: 'ctrl',
  }
]

const WhitelistEntry = [
  {
    _id: new ObjectId(),
    screenName: 'Test User',
    user: User[0]._id,
    session: Session[0]._id,
    role: 'presenter',
    sessionData: {}
  }
]

module.exports = {
  User,
  Slideshow,
  Session,
  WhitelistEntry
}