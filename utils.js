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

var intermediateExample = ">>> sentence_analyzer(inp7o,log=1)\n	Input Sentence = John gave Mary a book.\n	SUBJECT : 1 gave, 0 John\n	ROOT : -1 , 1 gave\n	INDIRECTOBJECT : 1 gave, 2 Mary\n	ART : 4 book, 3 a\n	DIRECTOBJECT : 1 gave, 4 book\nWord = GIVE is found in Lexicon, number of senses = 31\nWord = GIVE is found in 2 sense(s) as a synonym.\nSemantic constraint CRIMINAL-ROLE for HUMAN in SUBJECT had failed.\n	Skipping GIVE-V4 - JOHN-N1 pair.\nRequired word(s) UP does NOT match input MARY\nRequired word(s) UP does NOT match input A\nRequired word(s) UP does NOT match input BOOK\n	Skipping GIVE-V21 - JOHN-N1 pair.\nRequired word(s) OUT does NOT match input MARY\nRequired word(s) OUT does NOT match input A\nRequired word(s) OUT does NOT match input BOOK\n	Skipping GIVE-V32 - JOHN-N1 pair.\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V13\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V30\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V24\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V9\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V20\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V18\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V7\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V14\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V17\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V15\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V10\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V11\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V5\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC \n	Skipping GIVE-V6\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping GIVE-V22\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping ADMINISTER-V1\ninput syn element INDIRECTOBJECT not found in lex entry SYN-STRUC\n	Skipping PROVIDE-V1\nWord = BOOK is found in Lexicon, number of senses = 5\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) ADVICE does NOT match input BOOK\n	Skipping GIVE-V25 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) INSTRUCTION does NOT match input BOOK\n	Skipping GIVE-V19 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) ADVICE does NOT match input BOOK\n	Skipping GIVE-V29 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V ) \n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nSemantic constraint EVENT for BOOK in DIRECTOBJECT had failed.\n	Skipping GIVE-V2 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) ['OR', 'MYSELF', 'YOURSELF', 'HIMSELF', 'HERSELF', 'OURSELVES', 'YOURSELVES', 'THEMSELVES', 'ONESELF'] does NOT match input BOOK\n	Skipping GIVE-V12 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) ['OR', 'ADVICE', 'RECOMMENDATION', 'SUGGESTION'] does NOT match input BOOK\n	Skipping GIVE-V31 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nSemantic constraint COMMUNICABLE-DISEASE for BOOK in DIRECTOBJECT had failed.\n	Skipping GIVE-V16 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) CALL does NOT match input BOOK\n	Skipping GIVE-V27 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V ) \n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nSemantic constraint EVENT for BOOK in DIRECTOBJECT had failed.\n	Skipping GIVE-V1 - BOOK-N1 pair.\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V1\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V2\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V4\nPOS of the word BOOK ( N ) does NOT match POS of lexicon entry ( V )\n	Skipping BOOK-V3\nRequired word(s) ['OR', 'ADVICE', 'RECOMMENDATION', 'SUGGESTION'] does NOT match input BOOK\n	Skipping GIVE-V28 - BOOK-N1 pair.\nSense GIVE-V8 : required syntactic role ( COMP ) is missing in the input sentence\nRemoving a false positive result: {0: 'JOHN-N1', 1: 'GIVE-V8', 2: 'MARY-N1', 4: 'BOOK-N1'}\n-- Final result: Length= 2\n{\n\t'Step': 'final',\n\t'results': [\n\t\t{\n\t\t\t'TMR': {\n\t\t\t\t'BOOK-1': {\n\t\t\t\t\t'THEME-OF': 'INFORM-1',\n\t\t\t\t\t'concept': 'BOOK',\n\t\t\t\t\t'from-sense': 'BOOK-N1',\n\t\t\t\t\t'token': 'book',\n\t\t\t\t\t'word-ind': 4\n\t\t\t\t},\n\t\t\t\t'HUMAN-1': {\n\t\t\t\t\t'AGENT-OF': 'INFORM-1',\n\t\t\t\t\t'concept': 'HUMAN',\n\t\t\t\t\t'from-sense': 'JOHN-N1',\n\t\t\t\t\t'lex-source': 'NER',\n\t\t\t\t\t'token': 'John',\n\t\t\t\t\t'word-ind': 0\n\t\t\t\t},\n\t\t\t\t'HUMAN-2': {\n\t\t\t\t\t'BENEFICIARY-OF': 'INFORM-1',\n\t\t\t\t\t'concept': 'HUMAN',\n\t\t\t\t\t'from-sense': 'MARY-N1',\n\t\t\t\t\t'lex-source': 'NER',\n\t\t\t\t\t'token': 'Mary',\n\t\t\t\t\t'word-ind': 2\n\t\t\t\t},\n\t\t\t\t'INFORM-1': {\n\t\t\t\t\t'AGENT': 'HUMAN-1',\n\t\t\t\t\t'BENEFICIARY': 'HUMAN-2',\n\t\t\t\t\t'THEME': 'BOOK-1',\n\t\t\t\t\t'TIME': [\n\t\t\t\t\t\t'<',\n\t\t\t\t\t\t'FIND-ANCHOR-TIME'\n\t\t\t\t\t],\n\t\t\t\t\t'concept': 'INFORM',\n\t\t\t\t\t'from-sense': 'GIVE-V26',\n\t\t\t\t\t'syn-roles': [\n\t\t\t\t\t\t'SUBJECT',\n\t\t\t\t\t\t'INDIRECTOBJECT',\n\t\t\t\t\t\t'DIRECTOBJECT'\n\t\t\t\t\t],\n\t\t\t\t\t'token': 'gave',\n\t\t\t\t\t'word-ind': 1\n\t\t\t\t}\n\t\t\t},\n\t\t\t'concept_counts': {\n\t\t\t\t'BOOK': {\n\t\t\t\t\t'count': 1,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t4\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t'HUMAN': {\n\t\t\t\t\t'count': 2,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t0,\n\t\t\t\t\t\t2\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t'INFORM': {\n\t\t\t\t\t'count': 1,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t1\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t},\n\t\t\t'words': {\n\t\t\t\t'0': 'JOHN-N1',\n\t\t\t\t'1': 'GIVE-V26',\n\t\t\t\t'2': 'MARY-N1',\n\t\t\t\t'4': 'BOOK-N1'\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t'TMR': {\n\t\t\t\t'BOOK-1': {\n\t\t\t\t\t'THEME-OF': 'GIVE-1',\n\t\t\t\t\t'concept': 'BOOK',\n\t\t\t\t\t'from-sense': 'BOOK-N1',\n\t\t\t\t\t'token': 'book',\n\t\t\t\t\t'word-ind': 4\n\t\t\t\t},\n\t\t\t\t'GIVE-1': {\n\t\t\t\t\t'AGENT': 'HUMAN-1',\n\t\t\t\t\t'BENEFICIARY': 'HUMAN-2',\n\t\t\t\t\t'THEME': 'BOOK-1',\n\t\t\t\t\t'TIME': [\n\t\t\t\t\t\t'<',\n\t\t\t\t\t\t'FIND-ANCHOR-TIME'\n\t\t\t\t\t],\n\t\t\t\t\t'concept': 'GIVE',\n\t\t\t\t\t'from-sense': 'GIVE-V3',\n\t\t\t\t\t'syn-roles': [\n\t\t\t\t\t\t'SUBJECT',\n\t\t\t\t\t\t'INDIRECTOBJECT',\n\t\t\t\t\t\t'DIRECTOBJECT'\n\t\t\t\t\t],\n\t\t\t\t\t'token': 'gave',\n\t\t\t\t\t'word-ind': 1\n\t\t\t\t},\n\t\t\t\t'HUMAN-1': {\n\t\t\t\t\t'AGENT-OF': 'GIVE-1',\n\t\t\t\t\t'concept': 'HUMAN',\n\t\t\t\t\t'from-sense': 'JOHN-N1',\n\t\t\t\t\t'lex-source': 'NER',\n\t\t\t\t\t'token': 'John',\n\t\t\t\t\t'word-ind': 0\n\t\t\t\t},\n\t\t\t\t'HUMAN-2': {\n\t\t\t\t\t'BENEFICIARY-OF': 'GIVE-1',\n\t\t\t\t\t'concept': 'HUMAN',\n\t\t\t\t\t'from-sense': 'MARY-N1',\n\t\t\t\t\t'lex-source': 'NER',\n\t\t\t\t\t'token': 'Mary',\n\t\t\t\t\t'word-ind': 2\n\t\t\t\t}\n\t\t\t},\n\t\t\t'concept_counts': {\n\t\t\t\t'BOOK': {\n\t\t\t\t\t'count': 1,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t4\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t'GIVE': {\n\t\t\t\t\t'count': 1,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t1\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t'HUMAN': {\n\t\t\t\t\t'count': 2,\n\t\t\t\t\t'word-ind': [\n\t\t\t\t\t\t0,\n\t\t\t\t\t\t2\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t},\n\t\t\t'words': {\n\t\t\t\t'0': 'JOHN-N1',\n\t\t\t\t'1': 'GIVE-V3',\n\t\t\t\t'2': 'MARY-N1',\n\t\t\t\t'4': 'BOOK-N1'\n\t\t\t}\n\t\t}\n\t],\n\t'sent-num': 1,\n\t'sentence': 'John gave Mary a book.',\n\t'timestamp': '2016-Jan-25 13:40:18'\n}\n[True, 2]\n>>>";

module.exports = {
  port: 3000,
  exampleData: exampleTMR,
  exampleIntermediate: intermediateExample,
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
