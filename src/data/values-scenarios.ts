/**
 * Values mastery scenarios.
 *
 * One scenario for each distinct rule in Part 4 of "Australian Citizenship:
 * Our Common Bond" (pages 34 to 39), plus the citizenship pledge (page 4).
 * Each one teaches what the value means, puts it in an everyday situation,
 * asks one question, and explains why every option is right or wrong.
 *
 * Writing rules (checked by values-scenarios.test.ts where possible):
 * - Plain English for second-language readers: short sentences, common words.
 * - Every option has its own reason. Wrong options are real misconceptions.
 * - People who do the wrong thing are never given a name, nationality or
 *   religion, so no group is cast as the problem.
 * - Every values question in the bank is taught by at least one scenario
 *   (`covers`). Changing the bank means checking this list.
 * - Sensitive topics (violence, abuse, consent) are stated plainly and
 *   factually, never described in detail.
 */

export type ValuesAreaId = "law" | "freedoms" | "equality" | "respect" | "community";

export interface ValuesArea {
  id: ValuesAreaId;
  /** Matches the category title in the question bank. */
  title: string;
  /** Question bank category id, for drawing practice questions. */
  bankCategory: string;
  /** Booklet pages, for display. */
  pages: string;
  summary: string;
  ruleOfThumb: string;
}

export interface ScenarioOption {
  text: string;
  why: string;
}

export interface Scenario {
  id: string;
  area: ValuesAreaId;
  /** The value as the booklet names it. */
  value: string;
  title: string;
  meaning: string;
  /** An example the booklet itself gives, shown under the meaning. */
  example?: string;
  situation: string;
  question: string;
  options: [ScenarioOption, ScenarioOption, ScenarioOption];
  answer: 0 | 1 | 2;
  takeaway: string;
  /** Booklet page the rule is on. */
  page: number;
  /** Question bank ids whose content this scenario teaches. */
  covers: number[];
}

export const VALUES_AREAS: readonly ValuesArea[] = [
  {
    id: "law",
    title: "Rule of Law and parliamentary democracy",
    bankCategory: "values-rule-of-law-and-democracy",
    pages: "34",
    summary: "Everyone obeys the same laws, and those laws are made by parliaments the people elect.",
    ruleOfThumb: "The law applies to everyone, every time, even when no one is watching.",
  },
  {
    id: "freedoms",
    title: "Freedom of speech, association and religion",
    bankCategory: "values-freedoms",
    pages: "35",
    summary: "You are free to speak, to join groups and to follow any religion or none, as long as you stay within the law.",
    ruleOfThumb: "Free to speak, gather and believe, but always within the law and never promoting violence.",
  },
  {
    id: "equality",
    title: "Equality under the law and a fair go",
    bankCategory: "values-equality",
    pages: "36",
    summary: "Everyone has the same rights, and what people achieve should come from their skills and hard work.",
    ruleOfThumb: "Same rights for everyone. Jobs and success come from skills and effort, not who you are.",
  },
  {
    id: "respect",
    title: "Mutual respect and tolerance",
    bankCategory: "values-respect-and-tolerance",
    pages: "37",
    summary: "Respect other people's freedom, dignity and choices, and disagree peacefully.",
    ruleOfThumb: "Disagree peacefully. No violence, no abuse, no racism.",
  },
  {
    id: "community",
    title: "Community, contribution and loyalty",
    bankCategory: "values-community-and-loyalty",
    pages: "38 to 39",
    summary: "Contribute to the community, help people in need, learn English, help keep society safe and stay loyal to Australia.",
    ruleOfThumb: "Contribute, help others, learn English, report serious harm, and stay loyal to Australia.",
  },
];

export const SCENARIOS: readonly Scenario[] = [
  // ---------------------------------------------------------------- Rule of Law and parliamentary democracy (p. 34)
  {
    id: "values-foundations",
    area: "law",
    value: "Australian values",
    title: "What the values are built on",
    meaning:
      "Australian values are based on four ideas: freedom, respect, fairness and equality of opportunity. Together with our democratic institutions, they have given Australia a peaceful and stable society.",
    situation: "Priya's teenage son asks her what \"Australian values\" means. She wants to give him a short, correct answer.",
    question: "Which answer is correct?",
    options: [
      {
        text: "Freedom, respect, fairness and equality of opportunity",
        why: "These are the four ideas the booklet says Australian values are based on.",
      },
      {
        text: "Wealth, success, competition and national pride",
        why: "None of these is named as a basis of Australian values.",
      },
      {
        text: "The traditions of the families who arrived first",
        why: "Values are shared by everyone equally. They are not set by any one family, group or tradition.",
      },
    ],
    answer: 0,
    takeaway: "Freedom, respect, fairness and equal opportunity: four ideas everyone shares.",
    page: 34,
    covers: [263, 316],
  },
  {
    id: "no-one-watching",
    area: "law",
    value: "Commitment to the Rule of Law",
    title: "No one is watching",
    meaning: "Everyone must obey the law at all times. That includes when no one is watching and you would not get caught.",
    situation:
      "It is 2 am. Tom is driving home on an empty road and comes to a red light. There are no cameras and no other cars.",
    question: "What should Tom do?",
    options: [
      {
        text: "Drive through, because there is no one to hurt",
        why: "The law still applies on an empty road. The Rule of Law is about obeying the law, not about getting caught.",
      },
      {
        text: "Wait for the light to turn green",
        why: "Commitment to the Rule of Law means following the law even if no one is watching.",
      },
      {
        text: "Drive through slowly and carefully",
        why: "Driving carefully does not make breaking the law acceptable. A red light means stop.",
      },
    ],
    answer: 1,
    takeaway: "Follow the law even when no one is watching.",
    page: 34,
    covers: [264],
  },
  {
    id: "no-one-above-the-law",
    area: "law",
    value: "Commitment to the Rule of Law",
    title: "Nobody is above the law",
    meaning:
      "All Australians are equal under the law. No person or group is above it, including politicians, police and government officials.",
    situation:
      "A senior government official is caught taking money in return for favours. A friend says people in high positions are usually let off.",
    question: "What do Australian values say?",
    options: [
      {
        text: "Officials can be treated more gently because their work is important",
        why: "An important job does not change the law. People in government must obey it like everyone else.",
      },
      {
        text: "Only voters can decide if an official broke the law",
        why: "Elections choose who governs. They do not decide who has to obey the law.",
      },
      {
        text: "The official must face the law like anyone else",
        why: "Under the Rule of Law, no person or group is above the law.",
      },
    ],
    answer: 2,
    takeaway: "No one is above the law, however important they are.",
    page: 34,
    covers: [265],
  },
  {
    id: "law-over-custom",
    area: "law",
    value: "Commitment to the Rule of Law",
    title: "\"Where I grew up, it was normal\"",
    meaning:
      "Australian laws apply to everyone in Australia, whatever their background or culture. A custom that is normal somewhere else does not change the law here.",
    situation:
      "Lucia is applying for a business licence. An acquaintance tells her that where he grew up, people give officials a small \"gift\" to speed things up.",
    question: "What should Lucia do?",
    options: [
      {
        text: "Give a small gift, because it is only a custom",
        why: "Giving officials money or gifts for favours is against the law in Australia. A custom does not change that.",
      },
      {
        text: "Apply in the normal way and offer nothing",
        why: "Australian laws apply to all people in Australia, regardless of their background or culture.",
      },
      {
        text: "Ask the official privately what they would accept",
        why: "This is still offering a bribe. The law applies the same way to everyone.",
      },
    ],
    answer: 1,
    takeaway: "Australian law applies to everyone here, whatever the custom elsewhere.",
    page: 34,
    covers: [266],
  },
  {
    id: "who-makes-laws",
    area: "law",
    value: "Parliamentary democracy",
    title: "Who makes the laws",
    meaning:
      "Australia's laws are made by parliaments that the people elect. The power of government comes from the citizens who vote.",
    situation:
      "A group of community leaders announces new \"rules\" for everyone in their suburb. Some neighbours think these rules are now the law.",
    question: "Who makes Australia's laws?",
    options: [
      {
        text: "Parliaments elected by the people",
        why: "In a parliamentary democracy, laws are made by parliaments that citizens vote for.",
      },
      {
        text: "Community or religious leaders in each area",
        why: "Leaders can give advice, but their rules are not laws. Only parliaments make laws.",
      },
      {
        text: "Whoever has lived in the area the longest",
        why: "Living somewhere for a long time gives no power to make laws.",
      },
    ],
    answer: 0,
    takeaway: "Laws come from parliaments, and parliaments come from voters.",
    page: 34,
    covers: [267],
  },
  {
    id: "election-day",
    area: "law",
    value: "Parliamentary democracy",
    title: "Election day",
    meaning: "Voting is compulsory for Australian citizens. This shows how important it is to Australia that everyone takes part in elections.",
    situation: "Mei became a citizen last year. A federal election is coming up, and she thinks one vote will not make any difference.",
    question: "What does compulsory voting show?",
    options: [
      {
        text: "That voting is only for people who like politics",
        why: "Voting is not only for people interested in politics. It is compulsory for all citizens.",
      },
      {
        text: "That taking part in elections is important to Australia",
        why: "Compulsory voting shows the importance Australia places on everyone taking part in elections.",
      },
      {
        text: "That the government decides who wins",
        why: "Voters decide who is elected. The government does not.",
      },
    ],
    answer: 1,
    takeaway: "Citizens vote. It is compulsory because taking part matters.",
    page: 34,
    covers: [268],
  },

  // ---------------------------------------------------------------- Freedom of speech, association and religion (p. 35)
  {
    id: "criticising-government",
    area: "freedoms",
    value: "Freedom of speech",
    title: "Criticising the government",
    meaning:
      "People can say and publish what they think, as long as it is within the law. Newspapers, television and radio have the same freedom.",
    situation:
      "Daniel writes a letter to a newspaper saying a new government policy is a mistake. A friend worries he will get into trouble.",
    question: "Is Daniel allowed to do this?",
    options: [
      {
        text: "No, criticising the government is not allowed",
        why: "Criticising the government is allowed. Freedom of speech includes political opinions.",
      },
      {
        text: "Only if the newspaper gets government approval first",
        why: "Newspapers have the same freedom of speech as people do. They do not need approval to publish opinions.",
      },
      {
        text: "Yes, he can share his opinion, as long as it is within the law",
        why: "People may express their ideas freely, as long as it is within the law.",
      },
    ],
    answer: 2,
    takeaway: "You can criticise the government, within the law. So can the media.",
    page: 35,
    covers: [269, 270],
  },
  {
    id: "peaceful-protest",
    area: "freedoms",
    value: "Freedom of speech and association",
    title: "A peaceful protest",
    meaning:
      "Peaceful protest is an essential part of democracy. Protests must be lawful, and must not injure anyone or damage property.",
    situation:
      "Sofia joins a march against a new road through a local park. Near the end, a few people suggest breaking the windows of a council building.",
    question: "What fits Australian values?",
    options: [
      {
        text: "Keep protesting peacefully and do not damage anything",
        why: "Peaceful protest is part of democracy, but a protest must not injure people or damage property.",
      },
      {
        text: "Damage is fine if the cause is important enough",
        why: "No cause makes damaging property acceptable. A protest must stay peaceful and lawful.",
      },
      {
        text: "Protests are not allowed, so she should go home",
        why: "Peaceful protest is allowed. It is an essential part of democracy.",
      },
    ],
    answer: 0,
    takeaway: "Protest is welcome. Violence and damage are not.",
    page: 35,
    covers: [271],
  },
  {
    id: "promoting-violence",
    area: "freedoms",
    value: "Freedom of speech",
    title: "An angry post",
    meaning: "Freedom of speech has limits. Promoting violence against any person or group is never acceptable, and it is against the law.",
    situation:
      "After a news story, someone in an online group posts that people from a certain community \"should be attacked\". Other members like the post.",
    question: "Which statement is true?",
    options: [
      {
        text: "It is fine because it is only words online",
        why: "The law applies online too. Promoting violence is never acceptable, wherever it is said.",
      },
      {
        text: "Promoting violence against any group is never acceptable",
        why: "Promoting violence against a person or group is against Australian values and against the law.",
      },
      {
        text: "It is acceptable if many people agree",
        why: "How many people agree makes no difference. Promoting violence is against the law.",
      },
    ],
    answer: 1,
    takeaway: "Never promote violence against anyone, online or offline.",
    page: 35,
    covers: [272],
  },
  {
    id: "false-claims",
    area: "freedoms",
    value: "Freedom of speech",
    title: "False claims",
    meaning:
      "You can share honest opinions. But it is against the law to make false allegations about people, or to encourage others to break the law.",
    situation: "Ben had a bad meal at a local café and is angry. He is deciding what to post online about it.",
    question: "Which post is within the law?",
    options: [
      {
        text: "That the owner steals from customers, even though it is not true",
        why: "Making false allegations about someone is against the law.",
      },
      {
        text: "Asking people to go and damage the café",
        why: "Encouraging other people to break the law is illegal.",
      },
      {
        text: "An honest review of his meal",
        why: "Sharing an honest opinion is free speech. False claims and encouraging law-breaking are not.",
      },
    ],
    answer: 2,
    takeaway: "Say what you honestly think. Never make false claims or urge others to break the law.",
    page: 35,
    covers: [273],
  },
  {
    id: "join-or-leave",
    area: "freedoms",
    value: "Freedom of association",
    title: "Join or leave",
    meaning:
      "People are free to join or leave any lawful group, such as a political party, a trade union, or a religious, cultural or social group. No one can be forced to join or to leave.",
    situation:
      "Ravi's manager tells staff they must join a certain club to keep their jobs. Later, a friend tells Ravi he is not allowed to quit his sports club.",
    question: "What is true in Australia?",
    options: [
      {
        text: "People choose which lawful groups they join or leave",
        why: "Freedom of association means joining or leaving a lawful group is your choice. No one can force you either way.",
      },
      {
        text: "A manager can decide which groups staff must join",
        why: "No one can be forced to join an organisation, including by an employer.",
      },
      {
        text: "Once you join a group, you have to stay",
        why: "You are free to leave any group. No one can force you to stay.",
      },
    ],
    answer: 0,
    takeaway: "Joining or leaving a lawful group is always your choice.",
    page: 35,
    covers: [274, 275],
  },
  {
    id: "any-religion-or-none",
    area: "freedoms",
    value: "Freedom of religion",
    title: "Any religion, or none",
    meaning: "Australia has no official religion. People are free to follow any religion they choose, or no religion at all.",
    situation:
      "Grace decides she no longer wants to follow her family's religion. A relative tells her she is not allowed to make that choice.",
    question: "What does freedom of religion mean for Grace?",
    options: [
      {
        text: "She must keep her family's religion",
        why: "No one can force a person to follow a religion. The choice is Grace's.",
      },
      {
        text: "She may follow any religion, or none",
        why: "People in Australia are free to follow any religion or no religion. Australia has no official religion.",
      },
      {
        text: "She must follow Australia's official religion",
        why: "Australia has no official religion.",
      },
    ],
    answer: 1,
    takeaway: "Any religion or none: the choice belongs to each person.",
    page: 35,
    covers: [],
  },
  {
    id: "religious-law",
    area: "freedoms",
    value: "Freedom of religion",
    title: "Religious law and Australian law",
    meaning:
      "Religious practices must follow Australian law. Religious laws have no legal status in Australia. For example, being married to more than one person at the same time (polygamy) is against the law.",
    situation:
      "A man says his religious community allows a man to have two wives. He says Australian law should accept his second marriage.",
    question: "What does Australian law say?",
    options: [
      {
        text: "Religious law decides marriage for people of that religion",
        why: "Religious laws have no legal status in Australia. Australian law applies to everyone.",
      },
      {
        text: "Polygamy is allowed if both wives agree",
        why: "Polygamy is against the law, even if everyone agrees to it.",
      },
      {
        text: "Being married to two people at once is against the law",
        why: "Polygamy is against the law in Australia and can bring severe penalties.",
      },
    ],
    answer: 2,
    takeaway: "Religious law has no legal status. Australian law comes first, for everyone.",
    page: 35,
    covers: [276, 277],
  },
  {
    id: "forced-marriage",
    area: "freedoms",
    value: "Freedom of religion",
    title: "A marriage she did not choose",
    meaning: "Forced marriage is against the law in Australia. It can lead to severe penalties, including prison.",
    situation:
      "A young woman's family tells her she must marry a man she has not agreed to marry. They say it is their tradition.",
    question: "What does Australian law say?",
    options: [
      {
        text: "Forced marriage is against the law",
        why: "Forced marriage is illegal and can lead to severe penalties, including imprisonment.",
      },
      {
        text: "Families can decide if it is their tradition",
        why: "Tradition does not change the law. Australian law applies to everyone.",
      },
      {
        text: "It is allowed once the couple have met",
        why: "Meeting someone is not the same as agreeing to marry them. Both people must freely choose to marry.",
      },
    ],
    answer: 0,
    takeaway: "Marriage must be freely chosen. Forced marriage is a crime.",
    page: 35,
    covers: [278],
  },

  // ---------------------------------------------------------------- Equality under the law and a fair go (p. 36)
  {
    id: "equal-whatever-faith",
    area: "equality",
    value: "Equality of all people under the law",
    title: "Same rights, any faith",
    meaning:
      "Everyone has equal rights, whatever their gender, sexual orientation, age, disability, religion, race, or national or ethnic origin. The law treats people of every faith the same.",
    situation:
      "Kofi is a Buddhist. A colleague tells him Christians get special treatment under Australian law, because Christianity is the largest religion.",
    question: "Is the colleague right?",
    options: [
      {
        text: "Yes, the largest religion gets more rights",
        why: "The law gives no religion extra rights. Size makes no difference.",
      },
      {
        text: "No, Buddhists and people of all faiths are treated the same as Christians",
        why: "Under Australian law, people of every faith receive the same treatment.",
      },
      {
        text: "Only people born in Australia have equal rights",
        why: "Equal rights apply regardless of national or ethnic origin.",
      },
    ],
    answer: 1,
    takeaway: "Equal rights for everyone, whatever their faith, gender, age or background.",
    page: 36,
    covers: [280, 281],
  },
  {
    id: "who-can-marry",
    area: "equality",
    value: "Equality of all people under the law",
    title: "Who can marry",
    meaning: "Under Australian law, two people can marry each other. This includes two men or two women.",
    situation: "Nadia's colleagues Tom and James announce they are getting married. Another colleague says their marriage will not be legal.",
    question: "What does Australian law say?",
    options: [
      {
        text: "Two men can legally marry each other",
        why: "Marriage is between two people, including two men or two women.",
      },
      {
        text: "Only a man and a woman can marry",
        why: "This is no longer the law. Two people of the same sex can marry.",
      },
      {
        text: "Two men can marry in some states but not others",
        why: "The same marriage law applies across all of Australia.",
      },
    ],
    answer: 0,
    takeaway: "Two people can marry, including two men or two women.",
    page: 36,
    covers: [282],
  },
  {
    id: "her-own-choices",
    area: "equality",
    value: "Equality of men and women",
    title: "Her own choices",
    meaning:
      "Men and women have equal rights. Both have equal access to education and work. Both make their own choices about personal matters such as marriage and religion.",
    situation: "Sara wants to go to university and then get a job. Her husband says a wife should stay at home, and that he will decide.",
    question: "What fits Australian values?",
    options: [
      {
        text: "The husband decides, as head of the family",
        why: "Neither partner decides for the other. Men and women have equal rights.",
      },
      {
        text: "Sara can study only if her husband agrees",
        why: "Sara does not need permission. She has the same access to education as anyone.",
      },
      {
        text: "Sara can choose to study and to work",
        why: "Men and women have equal access to education and employment, and make their own choices.",
      },
    ],
    answer: 2,
    takeaway: "Women and men make their own choices, with equal rights to study and work.",
    page: 36,
    covers: [283, 287],
  },
  {
    id: "better-qualified",
    area: "equality",
    value: "Equality of men and women",
    title: "The better candidate",
    meaning:
      "Jobs should go to the person with the best skills and experience. A woman can get a job ahead of a man if she has better qualifications and skills.",
    situation:
      "Two people apply to manage a team. Leila has more experience and better qualifications than Mark. Some staff say a man should get the job.",
    question: "Who should get the job?",
    options: [
      {
        text: "Mark, because managers are usually men",
        why: "Gender is not a reason to choose someone. The best-qualified person should get the job.",
      },
      {
        text: "Leila, because she has better skills and experience",
        why: "A woman can get a job ahead of a man if she has better qualifications and skills.",
      },
      {
        text: "Whoever the staff vote for",
        why: "The law supports choosing the person with the best skills and experience, not the most popular.",
      },
    ],
    answer: 1,
    takeaway: "The best-qualified person gets the job, whether a man or a woman.",
    page: 36,
    covers: [284, 290],
  },
  {
    id: "divorce",
    area: "equality",
    value: "Equality of men and women",
    title: "Ending a marriage",
    meaning: "Divorce is accepted in Australia. Either the husband or the wife can apply for a divorce, even if the other person wants to stay married.",
    situation: "Wei is unhappy in her marriage and wants a divorce. Her husband says she cannot get one, because he does not agree.",
    question: "Which statement is true?",
    options: [
      {
        text: "Only the husband can apply for a divorce",
        why: "Either the husband or the wife can apply.",
      },
      {
        text: "A divorce needs both people to agree",
        why: "One person can apply, even if the other wants to stay married.",
      },
      {
        text: "Wei can apply for a divorce herself",
        why: "Either spouse may apply to the courts for a divorce, even if the other wants the marriage to continue.",
      },
    ],
    answer: 2,
    takeaway: "Either partner can apply for a divorce.",
    page: 36,
    covers: [286],
  },
  {
    id: "violence-at-home",
    area: "equality",
    value: "Equality of men and women",
    title: "Violence at home",
    meaning: "Physical violence against a husband, wife or partner is never acceptable. It is a crime in Australia.",
    situation: "A man tells his friends that if he hits his wife during an argument, it is a private family matter.",
    question: "What does Australian law say?",
    options: [
      {
        text: "It is a crime and is never acceptable",
        why: "Physical violence against a spouse or partner is a criminal offence in Australia.",
      },
      {
        text: "It is a private matter for the family",
        why: "Violence at home is not a private matter. It is a crime.",
      },
      {
        text: "It is acceptable if his wife does not complain",
        why: "It is never acceptable, whether or not anyone complains.",
      },
    ],
    answer: 0,
    takeaway: "Violence against a partner is always a crime.",
    page: 36,
    covers: [285],
  },
  {
    id: "a-fair-go",
    area: "equality",
    value: "Equality of opportunity and a \"fair go\"",
    title: "A fair go",
    meaning:
      "Everyone deserves a fair go, and no one should be held back by class. What people achieve should come from their hard work and talents, not their wealth, gender or background.",
    situation:
      "Two young people apply for an apprenticeship. One has clearly better skills. The other's father is a wealthy friend of the owner.",
    question: "What fits the idea of a fair go?",
    options: [
      {
        text: "Give it to the applicant with the better skills",
        why: "People should get jobs based on their skills and experience, not family connections.",
      },
      {
        text: "Give it to the applicant with the wealthy father",
        why: "A fair go means wealth and connections should not decide who gets ahead.",
      },
      {
        text: "Give it to whoever has the same background as the owner",
        why: "Background should not decide who gets a job. Skills and experience should.",
      },
    ],
    answer: 0,
    takeaway: "Success should come from hard work and talent, not class or connections.",
    page: 36,
    covers: [288, 289],
  },

  // ---------------------------------------------------------------- Mutual respect and tolerance (p. 37)
  {
    id: "when-you-disagree",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "When you disagree",
    meaning:
      "Respect other people's freedom and dignity, and their opinions and choices. Tolerance means listening to others and respecting their views, even when they are different from yours. Disagree peacefully.",
    situation: "Mohammed's new neighbour has political views and a way of life that he strongly disagrees with.",
    question: "What fits Australian values?",
    options: [
      {
        text: "Avoid the neighbour completely",
        why: "Avoiding people is not the same as tolerance. Tolerance means listening and respecting their views.",
      },
      {
        text: "Tell the neighbour to change their views",
        why: "Mutual respect means accepting that other people make different choices.",
      },
      {
        text: "Listen, and respect their views while disagreeing",
        why: "Tolerance means listening to others and respecting their views, even when they differ from your own.",
      },
    ],
    answer: 2,
    takeaway: "Listen, respect, and disagree peacefully.",
    page: 37,
    covers: [291, 296],
  },
  {
    id: "words-can-be-violence",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "Words can be violence too",
    meaning: "Violence of any kind is against the law in Australia. That includes verbal abuse, not just physical abuse.",
    situation:
      "During an argument about a parking space, a man shouts threats and insults at another driver. He says it is fine because he never touched anyone.",
    question: "Which statement is true?",
    options: [
      {
        text: "Only physical violence is against the law",
        why: "Violence of any kind is illegal, including verbal abuse.",
      },
      {
        text: "Verbal abuse and threats are a form of violence too",
        why: "Violence of any kind, including verbal and physical abuse, is illegal in Australia.",
      },
      {
        text: "Shouting is fine if the other driver started it",
        why: "Who started it does not make abuse acceptable. Disagreements should be settled peacefully.",
      },
    ],
    answer: 1,
    takeaway: "No violence of any kind: not physical, not verbal.",
    page: 37,
    covers: [292],
  },
  {
    id: "racism",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "At the football",
    meaning: "Racism has no place in Australia. This includes racially abusive comments in public or at sporting events, and racially offensive material online.",
    situation:
      "At a football match, a fan shouts racist insults at a player. Later, someone shares a racially offensive post about the same player online.",
    question: "Which of these is unacceptable?",
    options: [
      {
        text: "Only the shouting, because online posts are private",
        why: "Racist material online is not acceptable either. Online posts are often seen by many people.",
      },
      {
        text: "Both the shouting and the online post",
        why: "Racially abusive comments at sporting events and racially offensive material online are both unacceptable.",
      },
      {
        text: "Neither, because it is just sport",
        why: "Racism has no place in Australia, including in sport.",
      },
    ],
    answer: 1,
    takeaway: "Racism has no place in Australia, at the game or online.",
    page: 37,
    covers: [297],
  },
  {
    id: "religious-intolerance",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "A prayer break at work",
    meaning:
      "People are free to follow their religion. Religious intolerance, such as mocking people because of their faith, is not acceptable.",
    situation: "Hassan takes a short break each afternoon to pray. A co-worker makes fun of him for it in front of others.",
    question: "What fits Australian values?",
    options: [
      {
        text: "The co-worker can mock any religion he likes",
        why: "Religious intolerance is not acceptable in Australian society, at work or anywhere else.",
      },
      {
        text: "Hassan should stop praying so others feel comfortable",
        why: "Hassan does not have to give up his religion. Others should respect his choice.",
      },
      {
        text: "Respect Hassan's right to practise his religion",
        why: "People are free to follow their religion, and religious intolerance is not acceptable.",
      },
    ],
    answer: 2,
    takeaway: "Respect each person's faith. Religious intolerance is not acceptable.",
    page: 37,
    covers: [279],
  },
  {
    id: "police-request",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "A request from the police",
    meaning: "Everyone in Australia commits to following the law. If the police make a lawful request, you should obey it.",
    situation: "Police stop cars for a roadside check and ask Mia to show her driver's licence. Mia is in a hurry and doesn't see why she should.",
    question: "What should Mia do?",
    options: [
      {
        text: "Show her licence, as the police asked",
        why: "You should obey a lawful request from the police, because everyone commits to following the law.",
      },
      {
        text: "Refuse, because she has done nothing wrong",
        why: "A lawful request should be obeyed, even if you have done nothing wrong.",
      },
      {
        text: "Drive away and sort it out later",
        why: "Ignoring a lawful request from the police is against the law.",
      },
    ],
    answer: 0,
    takeaway: "Obey lawful requests from the police.",
    page: 37,
    covers: [295],
  },
  {
    id: "age-of-consent",
    area: "respect",
    value: "Mutual respect and tolerance",
    title: "The age of consent",
    meaning:
      "The age of sexual consent in Australia is 16 or 17, depending on the state or territory. An adult cannot have a sexual relationship with someone under that age.",
    situation:
      "Someone at work says it is fine in Australia for an adult to have a sexual relationship with a 15-year-old, as long as the teenager agrees.",
    question: "What does Australian law say?",
    options: [
      {
        text: "It is against the law in every state and territory",
        why: "A 15-year-old is under the age of consent everywhere in Australia.",
      },
      {
        text: "It is legal if the teenager agrees",
        why: "Agreeing does not make it legal. The age of consent is 16 or 17.",
      },
      {
        text: "It depends on the adult's own culture",
        why: "Australian laws apply to everyone, whatever their background.",
      },
    ],
    answer: 0,
    takeaway: "The age of consent is 16 or 17, depending on the state. Under that, it is a crime.",
    page: 37,
    covers: [293, 294],
  },

  // ---------------------------------------------------------------- Community, contribution and loyalty (pp. 38 to 39, pledge p. 4)
  {
    id: "making-a-contribution",
    area: "community",
    value: "Making a contribution",
    title: "Doing your part",
    meaning:
      "Australians expect everyone to take part in society and contribute to the community. Everyone should try to support themselves and their family when they are able to.",
    situation: "David has finished his studies and is able to work. A friend says there is no need to look for a job while his family can pay for everything.",
    question: "What fits Australian values?",
    options: [
      {
        text: "Look for work and support himself",
        why: "Everyone has a responsibility to try to support themselves and their families when they are able to.",
      },
      {
        text: "Let others support him for as long as they can",
        why: "People who are able to work are expected to try to support themselves.",
      },
      {
        text: "Only people born in Australia are expected to contribute",
        why: "The same expectation applies to everyone living in Australia.",
      },
    ],
    answer: 0,
    takeaway: "Take part, contribute, and support yourself when you can.",
    page: 38,
    covers: [298, 299],
  },
  {
    id: "mateship",
    area: "community",
    value: "Compassion for those in need",
    title: "Mateship",
    meaning:
      "Australians value mateship: helping others, and accepting help, especially in difficult times. Compassion can be simple, like taking a meal to an elderly neighbour or driving a friend to a medical appointment.",
    example:
      "During the 2019 to 2020 bushfires, many multicultural communities collected money, clothes and food for people affected by the fires.",
    situation: "After a storm, Rosa's elderly neighbour cannot get to the shops, and a friend needs a lift to a medical appointment.",
    question: "Which response shows mateship?",
    options: [
      {
        text: "Leave it to the government to help",
        why: "Government services help, but mateship is about people helping each other too.",
      },
      {
        text: "Help only if she gets something back",
        why: "Mateship means helping others without expecting a reward.",
      },
      {
        text: "Take her neighbour a meal and drive her friend",
        why: "Mateship means helping others, especially in difficult times.",
      },
    ],
    answer: 2,
    takeaway: "Help others, and accept help, especially when times are hard.",
    page: 38,
    covers: [300, 301, 315],
  },
  {
    id: "volunteering",
    area: "community",
    value: "Compassion for those in need",
    title: "Volunteering",
    meaning: "Volunteering is encouraged. It lets you share your knowledge, learn new skills and feel more part of the community.",
    situation: "Joy has some free time on weekends. Her local sports club needs volunteers to help run junior games.",
    question: "What does the booklet say about volunteering?",
    options: [
      {
        text: "It is only for people who cannot find paid work",
        why: "Anyone can volunteer. It is a way to contribute, not a replacement for a job.",
      },
      {
        text: "It helps you share knowledge, learn skills and belong",
        why: "Volunteering is a chance to share knowledge, learn new skills and increase your sense of belonging.",
      },
      {
        text: "It is required before you can become a citizen",
        why: "Volunteering is encouraged, not required for citizenship.",
      },
    ],
    answer: 1,
    takeaway: "Volunteering: share what you know, learn new skills, and belong.",
    page: 38,
    covers: [302],
  },
  {
    id: "english",
    area: "community",
    value: "English as the national language",
    title: "Learning English",
    meaning:
      "English is Australia's national language and an important part of what unites society. People applying for citizenship promise to make reasonable efforts to learn English if it is not their first language.",
    situation: "Leo speaks his first language at home, at work and with friends. He wonders whether learning English really matters.",
    question: "Why does Australia value English?",
    options: [
      {
        text: "It is the national language and helps unite society",
        why: "English is valued as the national language and an important unifying part of society.",
      },
      {
        text: "It replaces other languages, which should not be spoken",
        why: "People are free to speak other languages too. English is the shared national language.",
      },
      {
        text: "It only matters for people born in Australia",
        why: "Citizenship applicants promise to make reasonable efforts to learn English if it is not their first language.",
      },
    ],
    answer: 0,
    takeaway: "English is the shared national language. Make a real effort to learn it.",
    page: 38,
    covers: [303, 304],
  },
  {
    id: "report-serious-crime",
    area: "community",
    value: "Helping to keep our society safe",
    title: "A worrying plan",
    meaning: "If you think a friend or neighbour may be planning a serious crime, report it to Australian government authorities as soon as possible.",
    situation: "Chloe overhears a neighbour describing a plan to seriously hurt people at a public event.",
    question: "What should Chloe do?",
    options: [
      {
        text: "Stay quiet so she does not get involved",
        why: "Staying quiet could put people in danger. Reporting it is the right step.",
      },
      {
        text: "Tell the neighbour what she heard",
        why: "This could warn the person and put others at risk. Tell the authorities instead.",
      },
      {
        text: "Report it to the authorities as soon as possible",
        why: "If you suspect someone may be planning a serious crime, report it to Australian government authorities quickly.",
      },
    ],
    answer: 2,
    takeaway: "Suspect a serious crime is being planned? Report it to the authorities, fast.",
    page: 38,
    covers: [305],
  },
  {
    id: "child-at-risk",
    area: "community",
    value: "Helping to keep our society safe",
    title: "A child at risk",
    meaning: "If you see, or know about, a child being abused, report it to the police so they can investigate.",
    situation: "Sam notices signs that a child in their apartment building is being harmed by an adult at home.",
    question: "What should Sam do?",
    options: [
      {
        text: "Wait until they are completely sure",
        why: "You do not need to be certain before you report. The police investigate what is reported.",
      },
      {
        text: "Report it to the police",
        why: "Child abuse should be reported to the police to investigate. If a child is in immediate danger, call 000.",
      },
      {
        text: "Leave the family to sort it out",
        why: "Child abuse is a crime, not a private family matter.",
      },
    ],
    answer: 1,
    takeaway: "See or know of child abuse? Tell the police.",
    page: 38,
    covers: [306],
  },
  {
    id: "cyber-abuse",
    area: "community",
    value: "Helping to keep our society safe",
    title: "Private photos",
    meaning:
      "Cyber abuse means using technology to threaten, intimidate, harass or humiliate someone in order to hurt them. Sharing sexual photos or videos without consent, and stalking someone online, are examples. Many kinds of cyber abuse are against the law.",
    situation: "After a breakup, a man threatens to post private photos of his former partner online.",
    question: "What is this?",
    options: [
      {
        text: "A private matter between the couple",
        why: "Using technology to threaten or humiliate someone is cyber abuse, not a private matter.",
      },
      {
        text: "Cyber abuse, and sharing the photos could be a crime",
        why: "Sharing sexual images without consent is cyber abuse, and many kinds of cyber abuse are illegal.",
      },
      {
        text: "Acceptable, because he took the photos himself",
        why: "Who took the photos does not matter. Sharing them without consent is cyber abuse.",
      },
    ],
    answer: 1,
    takeaway: "Using technology to threaten, harass or humiliate is cyber abuse.",
    page: 38,
    covers: [307, 308],
  },
  {
    id: "two-citizenships",
    area: "community",
    value: "Loyalty to Australia",
    title: "Two citizenships",
    meaning:
      "Australian citizens can also hold another country's citizenship, if that country allows it. While in Australia, they must obey Australian law at all times.",
    situation: "Elena is a citizen of both Australia and Italy. A friend says she can choose which country's laws to follow while she lives in Sydney.",
    question: "Which laws must Elena follow in Australia?",
    options: [
      {
        text: "Whichever country's laws she prefers",
        why: "Dual citizens cannot choose. Australian law applies in Australia.",
      },
      {
        text: "Italy's laws, because she was an Italian citizen first",
        why: "Which citizenship came first makes no difference.",
      },
      {
        text: "All Australian laws, at all times",
        why: "A dual citizen in Australia must follow all Australian laws at all times.",
      },
    ],
    answer: 2,
    takeaway: "Dual citizens in Australia follow Australian law, always.",
    page: 38,
    covers: [309, 310],
  },
  {
    id: "laws-overseas",
    area: "community",
    value: "Loyalty to Australia",
    title: "Laws that travel with you",
    meaning:
      "Some Australian laws still apply to Australians when they are overseas. For example, sexual activity with a child under 16 is illegal for Australians, in Australia or in any other country.",
    situation: "A man says that Australian laws stop applying to you as soon as you leave Australia.",
    question: "Is he right?",
    options: [
      {
        text: "Yes, only the other country's laws apply overseas",
        why: "Some Australian laws still apply to Australians overseas.",
      },
      {
        text: "No, some Australian laws still apply overseas",
        why: "For example, sexual activity with a child under 16 is illegal for Australians anywhere in the world.",
      },
      {
        text: "Yes, unless the person is a dual citizen",
        why: "Dual citizenship does not change this. These laws apply to Australians overseas.",
      },
    ],
    answer: 1,
    takeaway: "Some Australian laws come with you when you travel.",
    page: 38,
    covers: [311],
  },
  {
    id: "harming-australia",
    area: "community",
    value: "Loyalty to Australia",
    title: "What harms Australia",
    meaning:
      "Being loyal means not acting against Australia's interests or security. Sharing official government secrets, or spreading fear and distrust of an ethnic community, would harm Australia.",
    situation:
      "Pat works in a government office. One online friend asks Pat to post a secret government document. Another keeps sharing posts saying one ethnic community cannot be trusted.",
    question: "Which of these would harm Australia?",
    options: [
      {
        text: "Only posting the secret document",
        why: "Spreading fear of an ethnic community also harms Australia, by damaging community relations.",
      },
      {
        text: "Neither, because social media is private",
        why: "Social media posts can reach many people. Both actions cause real harm.",
      },
      {
        text: "Both posting the secret and spreading fear of a community",
        why: "Sharing government secrets undermines security, and promoting distrust of an ethnic community damages community relations.",
      },
    ],
    answer: 2,
    takeaway: "Protect Australia's security and its communities. Don't share secrets or spread fear.",
    page: 38,
    covers: [312, 313],
  },
  {
    id: "the-pledge",
    area: "community",
    value: "Loyalty to Australia",
    title: "The pledge",
    meaning:
      "At the citizenship ceremony, new citizens make a pledge. They pledge their loyalty to Australia and its people, and promise to share its democratic beliefs, respect its rights and liberties, and obey its laws.",
    situation: "Ama's citizenship ceremony is next week. Her daughter asks what she will be promising.",
    question: "What do new citizens pledge?",
    options: [
      {
        text: "Their loyalty to Australia and its people",
        why: "In the pledge, new citizens pledge their loyalty to Australia and its people.",
      },
      {
        text: "To give up their own culture",
        why: "Australians keep their own cultures. The pledge is about loyalty, democratic beliefs, rights and laws.",
      },
      {
        text: "To vote for the government at every election",
        why: "Citizens vote for whoever they choose. The pledge does not ask you to support any party.",
      },
    ],
    answer: 0,
    takeaway: "The pledge: loyalty to Australia and its people.",
    page: 4,
    covers: [314],
  },
];

export const SCENARIOS_BY_AREA: Readonly<Record<ValuesAreaId, readonly Scenario[]>> = {
  law: SCENARIOS.filter((s) => s.area === "law"),
  freedoms: SCENARIOS.filter((s) => s.area === "freedoms"),
  equality: SCENARIOS.filter((s) => s.area === "equality"),
  respect: SCENARIOS.filter((s) => s.area === "respect"),
  community: SCENARIOS.filter((s) => s.area === "community"),
};

export const AREA_BY_ID: ReadonlyMap<ValuesAreaId, ValuesArea> = new Map(VALUES_AREAS.map((a) => [a.id, a]));
