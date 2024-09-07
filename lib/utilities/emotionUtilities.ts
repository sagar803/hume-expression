import { None, Optional } from "./typeUtilities";

import { EmotionName } from "../data/emotion";

export type EmotionInfo = {
  name: EmotionName;
  descriptor: Optional<string>;
};

export const CANONICAL_EMOTION_NAMES: EmotionName[] = [
  "Admiration",
  "Adoration",
  "Aesthetic Appreciation",
  "Amusement",
  "Anger",
  "Anxiety",
  "Awe",
  "Awkwardness",
  "Boredom",
  "Calmness",
  "Concentration",
  "Confusion",
  "Contemplation",
  "Contempt",
  "Contentment",
  "Craving",
  "Desire",
  "Determination",
  "Disappointment",
  "Disgust",
  "Distress",
  "Doubt",
  "Ecstasy",
  "Embarrassment",
  "Empathic Pain",
  "Entrancement",
  "Envy",
  "Excitement",
  "Fear",
  "Guilt",
  "Horror",
  "Interest",
  "Joy",
  "Love",
  "Nostalgia",
  "Pain",
  "Pride",
  "Realization",
  "Relief",
  "Romance",
  "Sadness",
  "Satisfaction",
  "Shame",
  "Surprise (negative)",
  "Surprise (positive)",
  "Sympathy",
  "Tiredness",
  "Triumph",
];

const DESCRIPTOR_MAP: Map<EmotionName, Optional<string>> = new Map([
  ["Admiration", "Admiring"],
  ["Adoration", "Adoring"],
  ["Aesthetic Appreciation", None],
  ["Amusement", "Amused"],
  ["Anger", "Angry"],
  ["Anxiety", "Anxious"],
  ["Awe", None],
  ["Awkwardness", "Awkward"],
  ["Boredom", "Bored"],
  ["Calmness", "Calm"],
  ["Concentration", None],
  ["Confusion", "Confused"],
  ["Contemplation", "Comptemplative"],
  ["Contempt", "Contemptful"],
  ["Contentment", "Contented"],
  ["Craving", "Craving"],
  ["Desire", "Desirous"],
  ["Determination", "Determined"],
  ["Disappointment", "Disappointed"],
  ["Disgust", "Disgusted"],
  ["Distress", "Distressed"],
  ["Doubt", "Doubtful"],
  ["Ecstasy", "Ecstatic"],
  ["Embarrassment", "Embarrassed"],
  ["Empathic Pain", None],
  ["Entrancement", "Entranced"],
  ["Envy", "Envious"],
  ["Excitement", "Excited"],
  ["Fear", "Fearful"],
  ["Guilt", "Guilty"],
  ["Horror", "Horrified"],
  ["Interest", "Interested"],
  ["Joy", "Joyful"],
  ["Love", "Loving"],
  ["Nostalgia", "Nostalgic"],
  ["Pain", "Pained"],
  ["Pride", "Prideful"],
  ["Realization", None],
  ["Relief", "Relieved"],
  ["Romance", "Romantic"],
  ["Sadness", "Sad"],
  ["Satisfaction", "Satisfied"],
  ["Shame", "Shameful"],
  ["Surprise (negative)", "Surprised"],
  ["Surprise (positive)", "Surprised"],
  ["Sympathy", "Sympathetic"],
  ["Tiredness", "Tired"],
  ["Triumph", "Triumphant"],
]);

export function getEmotionDescriptor(name: EmotionName): Optional<string> {
  return DESCRIPTOR_MAP.get(name);
}

type EmotionColors = {
  [key in EmotionName]: string;
};



export const emotionColors: EmotionColors = {
  Admiration: "#ffc58f",
  Adoration: "#ffc6cc",
  "Aesthetic Appreciation": "#e2cbff", // Placeholder color
  Amusement: "#febf52",
  Anger: "#b21816",
  Anxiety: "#6e42cc",
  Awe: "#7dabd3",
  Awkwardness: "#d7d99d",
  Boredom: "#a4a4a4",
  Calmness: "#a9cce1",
  Concentration: "#336cff",
  Confusion: "#c66a26",
  Contemplation: "#b0aeef",
  Contempt: "#76842d",
  Contentment: "#e5c6b4",
  Craving: "#54591c",
  Desire: "#aa0d59", // Placeholder color
  Determination: "#ff5c00",
  Disappointment: "#006c7c",
  Disgust: "#1a7a41",
  Distress: "#c5f264",
  Doubt: "#998644",
  Ecstasy: "#ff48a4",
  Embarrassment: "#63c653",
  "Empathic Pain": "#ca5555",
  Entrancement: "#7554d6",
  Envy: "#1d4921",
  Excitement: "#fff974",
  Fear: "#d1c9ef",
  Guilt: "#879aa1",
  Horror: "#772e7a",
  Interest: "#a9cce1",
  Joy: "#ffd600",
  Love: "#f44f4c",
  Nostalgia: "#b087a1",
  Pain: "#8c1d1d",
  Pride: "#9a4cb6",
  Realization: "#217aa8",
  Relief: "#fe927a",
  Romance: "#f0cc86",
  Sadness: "#305575",
  Satisfaction: "#a6ddaf",
  Shame: "#8a6262",
  "Surprise (negative)": "#70e63a", // Placeholder color
  "Surprise (positive)": "#7affff", // Placeholder color
  Sympathy: "#7f88e0",
  Tiredness: "#757575",
  Triumph: "#ec8132",
};

// export const isExpressionColor = (
//   color: string,
// ): color is keyof typeof expressionColors => {
//   return color in expressionColors;
// };
