export interface Word {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  definition: string;
  example: string;
  partOfSpeech: string;
}

export const oxford3000Words: Word[] = [
  // A1 Level Words
  { word: "about", level: "A1", definition: "on the subject of; concerning", example: "Tell me about your day.", partOfSpeech: "preposition" },
  { word: "above", level: "A1", definition: "in or to a higher position than something else", example: "The plane flew above the clouds.", partOfSpeech: "preposition" },
  { word: "across", level: "A1", definition: "from one side to the other of something", example: "We walked across the bridge.", partOfSpeech: "preposition" },
  { word: "after", level: "A1", definition: "following in time; later than", example: "We'll meet after lunch.", partOfSpeech: "preposition" },
  { word: "again", level: "A1", definition: "once more; another time", example: "Please say that again.", partOfSpeech: "adverb" },
  { word: "against", level: "A1", definition: "in opposition to", example: "He leaned against the wall.", partOfSpeech: "preposition" },
  { word: "all", level: "A1", definition: "the whole quantity or extent of", example: "All students must attend.", partOfSpeech: "determiner" },
  { word: "almost", level: "A1", definition: "not quite; very nearly", example: "I'm almost finished.", partOfSpeech: "adverb" },
  { word: "alone", level: "A1", definition: "having no one else present", example: "She lives alone.", partOfSpeech: "adjective" },
  { word: "along", level: "A1", definition: "in company with or at the same time as", example: "Come along with us.", partOfSpeech: "preposition" },
  { word: "already", level: "A1", definition: "before or by now or the time in question", example: "I've already eaten.", partOfSpeech: "adverb" },
  { word: "also", level: "A1", definition: "in addition; too", example: "She's also coming to the party.", partOfSpeech: "adverb" },
  { word: "although", level: "A1", definition: "in spite of the fact that", example: "Although it was raining, we went out.", partOfSpeech: "conjunction" },
  { word: "always", level: "A1", definition: "at all times; on all occasions", example: "She always arrives early.", partOfSpeech: "adverb" },
  { word: "among", level: "A1", definition: "situated more or less centrally in relation to several other things", example: "He was among friends.", partOfSpeech: "preposition" },
  { word: "and", level: "A1", definition: "used to connect words of the same part of speech", example: "Bread and butter.", partOfSpeech: "conjunction" },
  { word: "another", level: "A1", definition: "used to refer to an additional person or thing", example: "Would you like another cup of tea?", partOfSpeech: "determiner" },
  { word: "answer", level: "A1", definition: "a thing said, written, or done to deal with or as a reaction to a question", example: "What's your answer to the question?", partOfSpeech: "noun" },
  { word: "any", level: "A1", definition: "used to refer to one or some of a thing", example: "Do you have any questions?", partOfSpeech: "determiner" },
  { word: "anyone", level: "A1", definition: "any person or people", example: "Anyone can learn to swim.", partOfSpeech: "pronoun" },

  // A2 Level Words
  { word: "accept", level: "A2", definition: "consent to receive or undertake something offered", example: "I accept your invitation.", partOfSpeech: "verb" },
  { word: "accident", level: "A2", definition: "an unfortunate incident that happens unexpectedly", example: "There was a car accident on the highway.", partOfSpeech: "noun" },
  { word: "according", level: "A2", definition: "as stated by or in", example: "According to the weather forecast, it will rain.", partOfSpeech: "preposition" },
  { word: "account", level: "A2", definition: "a report or description of an event", example: "Give me an account of what happened.", partOfSpeech: "noun" },
  { word: "achieve", level: "A2", definition: "successfully bring about or reach a desired objective", example: "She worked hard to achieve her goals.", partOfSpeech: "verb" },
  { word: "activity", level: "A2", definition: "a thing that a person or group does or has done", example: "Swimming is my favorite activity.", partOfSpeech: "noun" },
  { word: "actually", level: "A2", definition: "as the truth or facts of a situation; really", example: "I actually enjoyed the movie.", partOfSpeech: "adverb" },
  { word: "address", level: "A2", definition: "the particulars of the place where someone lives", example: "What's your home address?", partOfSpeech: "noun" },
  { word: "admit", level: "A2", definition: "confess to be true or to be the case", example: "I admit I was wrong.", partOfSpeech: "verb" },
  { word: "adult", level: "A2", definition: "a person who is fully grown or developed", example: "Children must be accompanied by an adult.", partOfSpeech: "noun" },
  { word: "advance", level: "A2", definition: "move forward in a purposeful way", example: "The army began to advance.", partOfSpeech: "verb" },
  { word: "advantage", level: "A2", definition: "a condition or circumstance that puts one in a favorable position", example: "Being tall is an advantage in basketball.", partOfSpeech: "noun" },
  { word: "adventure", level: "A2", definition: "an unusual and exciting experience or activity", example: "Their trip to the Amazon was quite an adventure.", partOfSpeech: "noun" },
  { word: "advertise", level: "A2", definition: "describe or draw attention to a product or service", example: "They advertise their products on television.", partOfSpeech: "verb" },
  { word: "advice", level: "A2", definition: "guidance or recommendations offered with regard to prudent action", example: "Can you give me some advice?", partOfSpeech: "noun" },
  { word: "affect", level: "A2", definition: "have an effect on; make a difference to", example: "The rain will affect our picnic plans.", partOfSpeech: "verb" },
  { word: "afford", level: "A2", definition: "have enough money to pay for", example: "I can't afford a new car right now.", partOfSpeech: "verb" },
  { word: "afraid", level: "A2", definition: "feeling fear or anxiety; frightened", example: "She's afraid of spiders.", partOfSpeech: "adjective" },
  { word: "agree", level: "A2", definition: "have the same opinion about something", example: "I agree with your decision.", partOfSpeech: "verb" },
  { word: "ahead", level: "A2", definition: "further forward in space; in the lead", example: "Go ahead, I'll catch up later.", partOfSpeech: "adverb" },

  // B1 Level Words
  { word: "ability", level: "B1", definition: "possession of the means or skill to do something", example: "She has the ability to solve complex problems.", partOfSpeech: "noun" },
  { word: "absolutely", level: "B1", definition: "with no qualification, restriction, or limitation; totally", example: "You're absolutely right about that.", partOfSpeech: "adverb" },
  { word: "academic", level: "B1", definition: "relating to education and scholarship", example: "He has strong academic credentials.", partOfSpeech: "adjective" },
  { word: "accompany", level: "B1", definition: "go somewhere with someone as a companion", example: "I'll accompany you to the meeting.", partOfSpeech: "verb" },
  { word: "accurate", level: "B1", definition: "correct in all details; exact", example: "Please provide accurate information.", partOfSpeech: "adjective" },
  { word: "acquire", level: "B1", definition: "buy or obtain an asset or object for oneself", example: "The company plans to acquire new technology.", partOfSpeech: "verb" },
  { word: "adapt", level: "B1", definition: "become adjusted to new conditions", example: "Animals must adapt to survive.", partOfSpeech: "verb" },
  { word: "adequate", level: "B1", definition: "satisfactory or acceptable in quality or quantity", example: "The salary is adequate for my needs.", partOfSpeech: "adjective" },
  { word: "administration", level: "B1", definition: "the process or activity of running a business or organization", example: "She works in hospital administration.", partOfSpeech: "noun" },
  { word: "adopt", level: "B1", definition: "choose to take up, follow, or use", example: "The company will adopt new policies.", partOfSpeech: "verb" },
  { word: "agriculture", level: "B1", definition: "the science or practice of farming", example: "Agriculture is important for food production.", partOfSpeech: "noun" },
  { word: "aircraft", level: "B1", definition: "an airplane, helicopter, or other machine capable of flight", example: "The aircraft landed safely.", partOfSpeech: "noun" },
  { word: "alternative", level: "B1", definition: "available as another possibility or choice", example: "We need an alternative solution.", partOfSpeech: "adjective" },
  { word: "amazing", level: "B1", definition: "causing great surprise or wonder; astonishing", example: "The view from the mountain was amazing.", partOfSpeech: "adjective" },
  { word: "analysis", level: "B1", definition: "detailed examination of the elements or structure of something", example: "The analysis revealed interesting patterns.", partOfSpeech: "noun" },
  { word: "ancient", level: "B1", definition: "belonging to the very distant past", example: "They visited ancient ruins in Greece.", partOfSpeech: "adjective" },
  { word: "annual", level: "B1", definition: "occurring once every year", example: "The company holds an annual meeting.", partOfSpeech: "adjective" },
  { word: "anxiety", level: "B1", definition: "a feeling of worry, nervousness, or unease", example: "She felt anxiety before the exam.", partOfSpeech: "noun" },
  { word: "apparent", level: "B1", definition: "clearly visible or understood; obvious", example: "It was apparent that he was tired.", partOfSpeech: "adjective" },
  { word: "appeal", level: "B1", definition: "make a serious or urgent request", example: "They appeal for donations to help the victims.", partOfSpeech: "verb" },

  // B2 Level Words
  { word: "abandon", level: "B2", definition: "cease to support or look after someone; desert", example: "They had to abandon their home due to flooding.", partOfSpeech: "verb" },
  { word: "abstract", level: "B2", definition: "existing in thought or as an idea but not having a physical existence", example: "Love is an abstract concept.", partOfSpeech: "adjective" },
  { word: "accelerate", level: "B2", definition: "begin to move more quickly", example: "The car began to accelerate down the highway.", partOfSpeech: "verb" },
  { word: "accommodate", level: "B2", definition: "provide lodging or sufficient space for", example: "The hotel can accommodate 200 guests.", partOfSpeech: "verb" },
  { word: "accumulate", level: "B2", definition: "gather together or acquire an increasing number or quantity of", example: "Snow began to accumulate on the ground.", partOfSpeech: "verb" },
  { word: "acknowledge", level: "B2", definition: "accept or admit the existence or truth of", example: "He acknowledged his mistake.", partOfSpeech: "verb" },
  { word: "advocate", level: "B2", definition: "publicly recommend or support", example: "She advocates for environmental protection.", partOfSpeech: "verb" },
  { word: "aesthetic", level: "B2", definition: "concerned with beauty or the appreciation of beauty", example: "The building has great aesthetic appeal.", partOfSpeech: "adjective" },
  { word: "allocate", level: "B2", definition: "distribute resources or duties for a particular purpose", example: "We need to allocate more funds to education.", partOfSpeech: "verb" },
  { word: "ambiguous", level: "B2", definition: "open to more than one interpretation; not having one obvious meaning", example: "His answer was ambiguous and confusing.", partOfSpeech: "adjective" },
  { word: "anticipate", level: "B2", definition: "regard as probable; expect or predict", example: "We anticipate a successful outcome.", partOfSpeech: "verb" },
  { word: "arbitrary", level: "B2", definition: "based on random choice or personal whim", example: "The decision seemed arbitrary and unfair.", partOfSpeech: "adjective" },
  { word: "articulate", level: "B2", definition: "having or showing the ability to speak fluently and coherently", example: "She's very articulate in her presentations.", partOfSpeech: "adjective" },
  { word: "assess", level: "B2", definition: "evaluate or estimate the nature, ability, or quality of", example: "Teachers assess students' progress regularly.", partOfSpeech: "verb" },
  { word: "attribute", level: "B2", definition: "regard something as being caused by", example: "She attributes her success to hard work.", partOfSpeech: "verb" },
  { word: "authentic", level: "B2", definition: "of undisputed origin; genuine", example: "This is an authentic Italian restaurant.", partOfSpeech: "adjective" },
  { word: "autonomous", level: "B2", definition: "having the freedom to act independently", example: "The region has autonomous status.", partOfSpeech: "adjective" },
  { word: "bias", level: "B2", definition: "prejudice in favor of or against one thing", example: "The judge showed bias in his decision.", partOfSpeech: "noun" },
  { word: "coherent", level: "B2", definition: "logical and consistent", example: "Please give a coherent explanation.", partOfSpeech: "adjective" },
  { word: "comprehensive", level: "B2", definition: "complete and including everything that is necessary", example: "We need a comprehensive plan.", partOfSpeech: "adjective" }
];

export const getWordsByLevel = (level: 'A1' | 'A2' | 'B1' | 'B2'): Word[] => {
  return oxford3000Words.filter(word => word.level === level);
};

export const getRandomWord = (level?: 'A1' | 'A2' | 'B1' | 'B2'): Word => {
  const words = level ? getWordsByLevel(level) : oxford3000Words;
  return words[Math.floor(Math.random() * words.length)];
};