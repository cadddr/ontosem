var colors = require('colors');

var exampleTMR = {'Step': 'final',
'results': [{'TMR': {'ANIMAL-1': {'EXPERIENCER-OF': 'BEAR-OFFSPRING-1',
 'GENDER': 'FEMALE',
'concept': 'ANIMAL',
'from-sense': 'SHE-N1',
 'token': 'She',
 'word-ind': 0},
 'BEAR-OFFSPRING-1': {'EXPERIENCER': 'ANIMAL-1',
 'THEME': 'OFFSPRING-1',
 'concept': 'BEAR-OFFSPRING',
 'from-sense': 'BEAR-V1',
 'syn-roles': ['SUBJECT',
 'DIRECTOBJECT'],
 'token': 'bears',
 'word-ind': 1},
 'BEAR-OFFSPRING-3': {'EXPERIENCER': 'ANIMAL-1',
 'THEME': 'OFFSPRING-1',
 'concept': 'BEAR-OFFSPRING',
 'from-sense': 'BEAR-V1',
 'syn-roles': ['SUBJECT',
 'DIRECTOBJECT'],
 'token': 'bears',
 'word-ind': 1},
 'BEAR-OFFSPRING-2': {'EXPERIENCER': 'ANIMAL-1',
 'THEME': 'OFFSPRING-1',
 'concept': 'BEAR-OFFSPRING',
 'from-sense': 'BEAR-V1',
 'syn-roles': ['SUBJECT',
 'DIRECTOBJECT'],
 'token': 'bears',
 'word-ind': 1},
 'OFFSPRING-1': {'GENDER': 'MALE',
 'THEME-OF': 'BEAR-OFFSPRING-1',
 'concept': 'OFFSPRING',
 'from-sense': 'SON-N1',
 'token': 'son',
'word-ind': 3}},
 'concept_counts': {'ANIMAL': {'count': 1,
 'word-ind': [0]},
 'BEAR-OFFSPRING': {'count': 1,
 'word-ind': [1]},
 'OFFSPRING': {'count': 1,
 'word-ind': [3]}},
 'words': {0: 'SHE-N1', 1: 'BEAR-V1', 3: 'SON-N1'}}],
'sent-num': 1,
'sentence': 'She bears a son.',
'timestamp': '2016-Jan-20 18:44:13'};

module.exports = {
  port: 3000,
  exampleData: exampleTMR,
  isCapitalized: function(str) {
    return str == str.toUpperCase();
  },
  richLogging: {
    info: function(message) {
      console.log(message || "-");
    },
    attn: function(message) {
      console.log((message || "-").cyan);
    },
    success: function(message) {
      console.log((message || "-").green);
    },
    error: function(message) {
      console.log((message || "-").red);
    },
    warning: function(message) {
      console.log((message || "-").orange);
    }
  }
};
