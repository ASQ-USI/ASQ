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

const Exercise = [
  {
    _id: ObjectId("59835ef108c0bc751a2fa585"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "-1",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5ab"),
        updatedAt: new Date(1501781746435),
        createdAt: new Date(1501781746435)
      },
      {
        key: "assessment",
        value: "self",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5aa"),
        updatedAt: new Date(1501781746435),
        createdAt: new Date(1501781746435)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5a9"),
        updatedAt: new Date(1501781746435),
        createdAt: new Date(1501781746435)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa599"),
      ObjectId("59835ef108c0bc751a2fa59a")
    ],
    stem: "<h2>&lt;asq-multi-choice-q&gt; question</h2>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa586"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "8",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5ae"),
        updatedAt: new Date(1501781746478),
        createdAt: new Date(1501781746478)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5ad"),
        updatedAt: new Date(1501781746478),
        createdAt: new Date(1501781746478)
      },
      {
        key: "confidence",
        value: true,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5ac"),
        updatedAt: new Date(1501781746478),
        createdAt: new Date(1501781746478)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa59b")
    ],
    stem: "<h5>What's value of a[3]?</h5>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa587"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "9",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b1"),
        updatedAt: new Date(1501781746509),
        createdAt: new Date(1501781746509)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b0"),
        updatedAt: new Date(1501781746509),
        createdAt: new Date(1501781746509)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5af"),
        updatedAt: new Date(1501781746509),
        createdAt: new Date(1501781746509)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa592")
    ],
    stem: "<h3>Select all 'li' elements:</h3>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa588"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: 1,
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b4"),
        updatedAt: new Date(1501781746540),
        createdAt: new Date(1501781746540)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b3"),
        updatedAt: new Date(1501781746536),
        createdAt: new Date(1501781746536)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b2"),
        updatedAt: new Date(1501781746536),
        createdAt: new Date(1501781746536)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa595")
    ],
    stem: "<h4>Implement a function that wraps a given string with an HTML tag:</h4>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa589"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "2",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b7"),
        updatedAt: new Date(1501781746573),
        createdAt: new Date(1501781746573)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b6"),
        updatedAt: new Date(1501781746573),
        createdAt: new Date(1501781746573)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b5"),
        updatedAt: new Date(1501781746573),
        createdAt: new Date(1501781746573)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa590")
    ],
    stem: "<h4>Drag the labels (name of cites) to match the buckets.</h4>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58a"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "2",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5ba"),
        updatedAt: new Date(1501781746603),
        createdAt: new Date(1501781746603)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b9"),
        updatedAt: new Date(1501781746603),
        createdAt: new Date(1501781746603)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5b8"),
        updatedAt: new Date(1501781746602),
        createdAt: new Date(1501781746602)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa597")
    ],
    stem: "Specify the order of Polymer lifecycle methods.",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58b"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "3",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5bd"),
        updatedAt: new Date(1501781746639),
        createdAt: new Date(1501781746639)
      },
      {
        key: "assessment",
        value: "self",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5bc"),
        updatedAt: new Date(1501781746639),
        createdAt: new Date(1501781746639)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5bb"),
        updatedAt: new Date(1501781746639),
        createdAt: new Date(1501781746639)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa593")
    ],
    stem: "<h3>Write a simple for loop in JavaScript </h3>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58c"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "-1",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c0"),
        updatedAt: new Date(1501781746653),
        createdAt: new Date(1501781746653)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5bf"),
        updatedAt: new Date(1501781746651),
        createdAt: new Date(1501781746651)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5be"),
        updatedAt: new Date(1501781746651),
        createdAt: new Date(1501781746651)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa594")
    ],
    stem: "<h3>Highlight with the appropriate color the following:</h3>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58d"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "-1",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c3"),
        updatedAt: new Date(1501781746664),
        createdAt: new Date(1501781746664)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c2"),
        updatedAt: new Date(1501781746664),
        createdAt: new Date(1501781746664)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c1"),
        updatedAt: new Date(1501781746663),
        createdAt: new Date(1501781746663)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa596")
    ],
    stem: "\n              <h4>Try to recreate the following image using HTML5 and CSS</h4>\n            <asq-stem>\n            <img src=\"img/mockup.png\" width=\"200px\" alt=\"\">\n          </asq-stem>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58e"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "-1",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c6"),
        updatedAt: new Date(1501781746679),
        createdAt: new Date(1501781746679)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c5"),
        updatedAt: new Date(1501781746679),
        createdAt: new Date(1501781746679)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c4"),
        updatedAt: new Date(1501781746679),
        createdAt: new Date(1501781746679)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa59c")
    ],
    stem: "<h4>INSERT some valid data in the TABLE `Employee`</h4>",
    __v: 0
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa58f"),
    settings: [
      {
        key: "maxNumSubmissions",
        value: "-1",
        kind: "number",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c9"),
        updatedAt: new Date(1501781746693),
        createdAt: new Date(1501781746693)
      },
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c8"),
        updatedAt: new Date(1501781746693),
        createdAt: new Date(1501781746693)
      },
      {
        key: "confidence",
        value: false,
        kind: "boolean",
        level: "exercise",
        _id: ObjectId("59835ef208c0bc751a2fa5c7"),
        updatedAt: new Date(1501781746693),
        createdAt: new Date(1501781746693)
      }
    ],
    "questions": [
      ObjectId("59835ef108c0bc751a2fa598")
    ],
    stem: "<h4>An asq-rating-q question.</h4>",
    __v: 0
  }
]

const Question = [
  {
    _id: ObjectId("59835ef108c0bc751a2fa590"),
    type: "asq-buckets-q",
    data: {
      "objects": [

      ],
      "targets": [

      ],
      stem: "<h4>Drag the labels (name of cites) to match the buckets.</h4>",
      html: "<asq-buckets-q role=\"viewer\" mode=\"1-3\" x-matchable=\"div[buckets]\" y-matchable=\"div[labels]\" attr-for-matched=\"s-name\" matched-attribute=\"matched\" matched-class=\"label-success\" uid=\"59835ef108c0bc751a2fa590\">\n\n          <asq-stem><h4>Drag the labels (name of cites) to match the buckets.</h4></asq-stem>\n          <div buckets=\"\">\n            <div s-name=\"Europe\" class=\"bucket\"><b>Europe</b></div>\n            <div s-name=\"North America\" class=\"bucket\"><b>North America</b></div>\n            <div s-name=\"Middle East\" class=\"bucket\"><b>Middle East</b></div>\n          </div>\n          \n          <div labels=\"\">\n            <div s-name=\"New York\" class=\"label label-primary\">New York</div>\n            <div s-name=\"London\" class=\"label label-primary\">London</div>\n            <div s-name=\"Zurich\" class=\"label label-primary\">Zurich</div>\n            <div s-name=\"Jerusalem\" class=\"label label-primary\">Jerusalem</div>\n            <div s-name=\"Chicago\" class=\"label label-primary\">Chicago</div>\n            <div s-name=\"Lugano\" class=\"label label-primary\">Lugano</div>\n          </div>\n        </asq-buckets-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa592"),
    type: "asq-css-select-q",
    data: {
      code: "<ul><li class='aclass'><ul id='aid'><li></li><li></li></ul></li><div><p></p><p class='bclass'></p></div></li></ul>",
      stem: "<h3>Select all 'li' elements:</h3>",
      html: "<asq-css-select-q htmlcode=\"<ul><li class='aclass'><ul id='aid'><li></li><li></li></ul></li><div><p></p><p class='bclass'></p></div></li></ul>\" uid=\"59835ef108c0bc751a2fa592\">\n            <asq-stem><h3>Select all 'li' elements:</h3></asq-stem>\n          </asq-css-select-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa593"),
    type: "asq-code-q",
    data: {
      code: "public class C {      \n  public void m() {\n    int i = i + 5 + ((int)5.0) + ((int)5f);\n  }\n}",
      stem: "<h3>Write a simple for loop in JavaScript </h3>",
      html: "<asq-code-q theme=\"monokai\" mode=\"javascript\" font-size=\"0.8em\" uid=\"59835ef108c0bc751a2fa593\">\n               <asq-stem><h3>Write a simple for loop in JavaScript </h3></asq-stem>\n<code>public class C {      \n  public void m() {\n    int i = i + 5 + ((int)5.0) + ((int)5f);\n  }\n}</code>\n             </asq-code-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa594"),
    type: "asq-highlight-q",
    data: {
      solution: {
        "f0ad4e": [
          {
            "id": 236,
            "end": {
              "column": 12,
              "row": 0
            },
            "start": {
              "column": 7,
              "row": 0
            }
          },
          {
            "id": 243,
            "end": {
              "column": 13,
              "row": 1
            },
            "start": {
              "column": 9,
              "row": 1
            }
          },
          {
            "id": 250,
            "end": {
              "column": 25,
              "row": 2
            },
            "start": {
              "column": 22,
              "row": 2
            }
          },
          {
            "id": 256,
            "end": {
              "column": 38,
              "row": 2
            },
            "start": {
              "column": 35,
              "row": 2
            }
          }
        ],
        "428bca": [
          {
            "id": 229,
            "end": {
              "column": 7,
              "row": 2
            },
            "start": {
              "column": 4,
              "row": 2
            }
          }
        ],
        "d9534f": [
          {
            "id": 216,
            "end": {
              "column": 8,
              "row": 1
            },
            "start": {
              "column": 2,
              "row": 1
            }
          },
          {
            "id": 222,
            "end": {
              "column": 6,
              "row": 0
            },
            "start": {
              "column": 0,
              "row": 0
            }
          }
        ]
      },
      "tasks": [
        {
          html: "Visibility Modifiers",
          "colorName": "",
          "color": "d9534f",
          _id: ObjectId("59835ef222aea4751ad6337e")
        },
        {
          html: "Variable Declarations",
          "colorName": "",
          "color": "428bca",
          _id: ObjectId("59835ef222aea4751ad6337f")
        },
        {
          html: "Other keywords",
          "colorName": "",
          "color": "f0ad4e",
          _id: ObjectId("59835ef222aea4751ad63380")
        }
      ],
      stem: "<h3>Highlight with the appropriate color the following:</h3>",
      html: "<asq-highlight-q theme=\"textmate\" mode=\"java\" font-size=\"0.65em\" uid=\"59835ef108c0bc751a2fa594\">\n            \n              <asq-stem><h3>Highlight with the appropriate color the following:</h3></asq-stem>\n              <asq-hl-color-task color=\"d9534f\" uid=\"59835ef222aea4751ad6337e\">Visibility Modifiers</asq-hl-color-task>\n                <asq-hl-color-task color=\"428bca\" uid=\"59835ef222aea4751ad6337f\">Variable Declarations</asq-hl-color-task>\n                <asq-hl-color-task color=\"f0ad4e\" uid=\"59835ef222aea4751ad63380\">Other keywords</asq-hl-color-task>\n    <code>public class C {      \n  public void m() {\n    int i = i + 5 + ((int)5.0) + ((int)5f);\n  }\n}</code>\n            </asq-highlight-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa595"),
    type: "asq-js-function-body-q",
    data: {
      html: "<asq-js-function-body-q function-name=\"wrap(str, tagName)\" test-exp=\"wrap('hello World', 'div');\" uid=\"59835ef108c0bc751a2fa595\">\n            <asq-stem><h4>Implement a function that wraps a given string with an HTML tag:</h4></asq-stem>\n          </asq-js-function-body-q>",
      stem: "<h4>Implement a function that wraps a given string with an HTML tag:</h4>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa596"),
    type: "asq-fiddle-q",
    data: {
      stem: "\n              <h4>Try to recreate the following image using HTML5 and CSS</h4>\n            <asq-stem>\n            <img src=\"img/mockup.png\" width=\"200px\" alt=\"\">\n          </asq-stem>",
      html: "<asq-fiddle-q uid=\"59835ef108c0bc751a2fa596\">\n            <asq-stem>\n              <h4>Try to recreate the following image using HTML5 and CSS</h4>\n            <asq-stem>\n            <img src=\"img/mockup.png\" width=\"200px\" alt=\"\">\n          </asq-stem></asq-stem></asq-fiddle-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa597"),
    type: "asq-order-q",
    data: {
      "items": [
        "ready",
        "attached",
        "created",
        "detached"
      ],
      stem: "Specify the order of Polymer lifecycle methods.",
      html: "<asq-order-q sortable=\"[label]\" uid=\"59835ef108c0bc751a2fa597\">\n            <asq-stem>Specify the order of Polymer lifecycle methods.</asq-stem>\n            <div label=\"\" class=\"static\" name=\"ready\">ready</div>\n            <div label=\"\" class=\"static\" name=\"attached\">attached</div>\n            <div label=\"\" class=\"static\" name=\"created\">created</div>\n            <div label=\"\" class=\"static\" name=\"detached\">detached</div>\n          </asq-order-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa598"),
    type: "asq-rating-q",
    data: {
      "ratingItems": [
        {
          type: "stars",
          html: "Item to rate #1",
          _id: ObjectId("59835ef23808a71a7583391f")
        },
        {
          type: "stars",
          html: "Item to rate #2",
          _id: ObjectId("59835ef23808a71a75833920")
        },
        {
          type: "stars",
          html: "Item to rate #3",
          _id: ObjectId("59835ef23808a71a75833921")
        },
        {
          type: "stars",
          html: "Item to rate #4",
          _id: ObjectId("59835ef23808a71a75833922")
        }
      ],
      stem: "<h4>An asq-rating-q question.</h4>",
      html: "<asq-rating-q type=\"stars\" uid=\"59835ef108c0bc751a2fa598\">\n            <asq-stem><h4>An asq-rating-q question.</h4></asq-stem>\n            <asq-rating-item name=\"item-1\" uid=\"59835ef23808a71a7583391f\">Item to rate #1</asq-rating-item>\n            <asq-rating-item name=\"item-2\" uid=\"59835ef23808a71a75833920\">Item to rate #2</asq-rating-item>\n            <asq-rating-item name=\"item-3\" uid=\"59835ef23808a71a75833921\">Item to rate #3</asq-rating-item>\n            <asq-rating-item name=\"item-4\" uid=\"59835ef23808a71a75833922\">Item to rate #4</asq-rating-item>\n          </asq-rating-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa599"),
    type: "asq-multi-choice-q",
    data: {
      "options": [
        {
          "correct": false,
          html: "Option 0",
          _id: ObjectId("59835ef108c0bc751a2fa59f")
        },
        {
          "correct": false,
          html: "Option 1",
          _id: ObjectId("59835ef108c0bc751a2fa5a0")
        },
        {
          "correct": false,
          html: "Option 2",
          _id: ObjectId("59835ef108c0bc751a2fa5a1")
        },
        {
          "correct": false,
          html: "Option 3",
          _id: ObjectId("59835ef108c0bc751a2fa5a2")
        }
      ],
      stem: "<h3>Here you can pick just one answer:</h3>",
      html: "<asq-multi-choice-q selected=\"op3\" uid=\"59835ef108c0bc751a2fa599\" assessment=\"none\">\n            <asq-stem><h3>Here you can pick just one answer:</h3></asq-stem>\n            <asq-option name=\"op0\" uid=\"59835ef108c0bc751a2fa59f\">Option 0</asq-option>\n            <asq-option name=\"op1\" uid=\"59835ef108c0bc751a2fa5a0\">Option 1</asq-option>\n            <asq-option name=\"op2\" uid=\"59835ef108c0bc751a2fa5a1\">Option 2</asq-option>\n            <asq-option name=\"op3\" uid=\"59835ef108c0bc751a2fa5a2\">Option 3</asq-option>\n          </asq-multi-choice-q>"
    },
    settings: [
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "question",
        _id: ObjectId("59835ef108c0bc751a2fa5a7"),
        updatedAt: new Date(1501781745937),
        createdAt: new Date(1501781745937)
      }
    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa59a"),
    type: "asq-multi-choice-q",
    data: {
      "options": [
        {
          "correct": false,
          html: "Option 0",
          _id: ObjectId("59835ef108c0bc751a2fa5a3")
        },
        {
          "correct": false,
          html: "Option 1",
          _id: ObjectId("59835ef108c0bc751a2fa5a4")
        },
        {
          "correct": false,
          html: "Option 2",
          _id: ObjectId("59835ef108c0bc751a2fa5a5")
        },
        {
          "correct": false,
          html: "Option 3",
          _id: ObjectId("59835ef108c0bc751a2fa5a6")
        }
      ],
      stem: "<h3>Here you can pick as many as you want</h3>",
      html: "<asq-multi-choice-q selected-values=\"[\" op1\",=\"\" \"op2\"]\"=\"\" multi=\"\" stats-layout=\"vertical\" uid=\"59835ef108c0bc751a2fa59a\" assessment=\"none\">\n            <asq-stem><h3>Here you can pick as many as you want</h3></asq-stem>\n            <asq-option name=\"op0\" uid=\"59835ef108c0bc751a2fa5a3\">Option 0</asq-option>\n            <asq-option name=\"op1\" uid=\"59835ef108c0bc751a2fa5a4\">Option 1</asq-option>\n            <asq-option name=\"op2\" uid=\"59835ef108c0bc751a2fa5a5\">Option 2</asq-option>\n            <asq-option name=\"op3\" uid=\"59835ef108c0bc751a2fa5a6\">Option 3</asq-option>\n          </asq-multi-choice-q>"
    },
    settings: [
      {
        key: "assessment",
        value: "none",
        kind: "select",
        params: {
          options: [
            "peer",
            "auto",
            "self",
            "none"
          ]
        },
        level: "question",
        _id: ObjectId("59835ef108c0bc751a2fa5a8"),
        updatedAt: new Date(1501781745938),
        createdAt: new Date(1501781745938)
      }
    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa59b"),
    type: "asq-text-input-q",
    data: {
      solution: "\\0",
      stem: "<h5>What's value of a[3]?</h5>",
      html: "<asq-text-input-q label=\"value\" id=\"text-q\" uid=\"59835ef108c0bc751a2fa59b\">\n            <asq-stem><h5>What's value of a[3]?</h5></asq-stem>\n            <pre><code>\n              char a[27];\n              char *b = \"abc\";\n              strcpy(a, b);</code></pre>\n            <asq-solution hidden>\\0</asq-solution>\n          </asq-text-input-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
  },
  {
    _id: ObjectId("59835ef108c0bc751a2fa59c"),
    type: "asq-sqlite-q",
    data: {
      solution: "INSERT INTO `Employee` VALUES ()",
      code: "",
      stem: "<h4>INSERT some valid data in the TABLE `Employee`</h4>",
      html: "<asq-sqlite-q db-url=\"assets/Chinook_Sqlite.sqlite\" font-size=\"0.6em\" uid=\"59835ef108c0bc751a2fa59c\">\n              <asq-stem><h4>INSERT some valid data in the TABLE `Employee`</h4></asq-stem>\n              <code></code>\n              \n            </asq-sqlite-q>"
    },
    settings: [

    ],
    date_modified: new Date(1501781697975),
    date_created: new Date(1501781697975),
    __v: 0,
    author: ObjectId("59835cef97521f6ddae1fb0c")
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
      ObjectId("59835ef108c0bc751a2fa585"),
      ObjectId("59835ef108c0bc751a2fa586"),
      ObjectId("59835ef108c0bc751a2fa587"),
      ObjectId("59835ef108c0bc751a2fa588"),
      ObjectId("59835ef108c0bc751a2fa589"),
      ObjectId("59835ef108c0bc751a2fa58a"),
      ObjectId("59835ef108c0bc751a2fa58b"),
      ObjectId("59835ef108c0bc751a2fa58c"),
      ObjectId("59835ef108c0bc751a2fa58d"),
      ObjectId("59835ef108c0bc751a2fa58e"),
      ObjectId("59835ef108c0bc751a2fa58f")
    ],
    questions: [
      ObjectId("59835ef108c0bc751a2fa590"),
      ObjectId("59835ef108c0bc751a2fa592"),
      ObjectId("59835ef108c0bc751a2fa593"),
      ObjectId("59835ef108c0bc751a2fa594"),
      ObjectId("59835ef108c0bc751a2fa595"),
      ObjectId("59835ef108c0bc751a2fa596"),
      ObjectId("59835ef108c0bc751a2fa597"),
      ObjectId("59835ef108c0bc751a2fa598"),
      ObjectId("59835ef108c0bc751a2fa599"),
      ObjectId("59835ef108c0bc751a2fa59a"),
      ObjectId("59835ef108c0bc751a2fa59b"),
      ObjectId("59835ef108c0bc751a2fa59c")
    ],
    presentationFramework: 'impress.js',
    asqFile: 'index.asq.dust',
    originalFile: 'index.html',
    course: 'General',
    exercisesPerSlide: {
      "asq-rating-q": [
        "59835ef108c0bc751a2fa58f"
      ],
      "asq-sqlite-q": [
        "59835ef108c0bc751a2fa58e"
      ],
      "asq-fiddle-q": [
        "59835ef108c0bc751a2fa58d"
      ],
      "asq-highlight-q": [
        "59835ef108c0bc751a2fa58c"
      ],
      "asq-code-q": [
        "59835ef108c0bc751a2fa58b"
      ],
      "asq-order-q": [
        "59835ef108c0bc751a2fa58a"
      ],
      "asq-buckets-q": [
        "59835ef108c0bc751a2fa589"
      ],
      "asq-js-function-body": [
        "59835ef108c0bc751a2fa588"
      ],
      "asq-css-select-q": [
        "59835ef108c0bc751a2fa587"
      ],
      "asq-text-input-q": [
        "59835ef108c0bc751a2fa586"
      ],
      "asq-multi-choice-q": [
        "59835ef108c0bc751a2fa585"
      ]
    },
    questionsPerSlide: {
      "asq-rating-q": [
        "59835ef108c0bc751a2fa598"
      ],
      "asq-sqlite-q": [
        "59835ef108c0bc751a2fa59c"
      ],
      "asq-fiddle-q": [
        "59835ef108c0bc751a2fa596"
      ],
      "asq-highlight-q": [
        "59835ef108c0bc751a2fa594"
      ],
      "asq-code-q": [
        "59835ef108c0bc751a2fa593"
      ],
      "asq-order-q": [
        "59835ef108c0bc751a2fa597"
      ],
      "asq-buckets-q": [
        "59835ef108c0bc751a2fa590"
      ],
      "asq-js-function-body": [
        "59835ef108c0bc751a2fa595"
      ],
      "asq-css-select-q": [
        "59835ef108c0bc751a2fa592"
      ],
      "asq-text-input-q": [
        "59835ef108c0bc751a2fa59b"
      ],
      "asq-multi-choice-q": [
        "59835ef108c0bc751a2fa599",
        "59835ef108c0bc751a2fa59a"
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
  Question,
  Exercise,
  Slideshow,
  Session,
  WhitelistEntry
}