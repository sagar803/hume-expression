export type Emotion = {
  name: EmotionName;
  score: number;
}

export type EmotionMap = {
  [key in EmotionName]: number;
};

export type EmotionName =
  | "Admiration"
  | "Adoration"
  | "Aesthetic Appreciation"
  | "Amusement"
  | "Anger"
  | "Anxiety"
  | "Awe"
  | "Awkwardness"
  | "Boredom"
  | "Calmness"
  | "Concentration"
  | "Confusion"
  | "Contemplation"
  | "Contempt"
  | "Contentment"
  | "Craving"
  | "Desire"
  | "Determination"
  | "Disappointment"
  | "Disgust"
  | "Distress"
  | "Doubt"
  | "Ecstasy"
  | "Embarrassment"
  | "Empathic Pain"
  | "Entrancement"
  | "Envy"
  | "Excitement"
  | "Fear"
  | "Guilt"
  | "Horror"
  | "Interest"
  | "Joy"
  | "Love"
  | "Nostalgia"
  | "Pain"
  | "Pride"
  | "Realization"
  | "Relief"
  | "Romance"
  | "Sadness"
  | "Satisfaction"
  | "Shame"
  | "Surprise (negative)"
  | "Surprise (positive)"
  | "Sympathy"
  | "Tiredness"
  | "Triumph"
  | string