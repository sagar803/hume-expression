import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { emotions } from '@/lib/types';

interface Emotion {
  emotion: string;
  score: number;
}

interface Props {
  sortedEmotions: Emotion[];
}

const EmotionSpiderChart: React.FC<Props> = ({ sortedEmotions }) => {
  const topEmotions: Emotion[] = [];

  for (let i = 0; i < sortedEmotions.length; i++) {
    const emotion = sortedEmotions[i].emotion;
    for (let j = 0; j < emotions.length; j++) {
      if (emotion === emotions[j]) {
        topEmotions.push(sortedEmotions[i])
        break;
      }
    }

    console.log("i", emotion)
    if (topEmotions.length === 9) {
      break;
    }

  }

  const data = topEmotions.map(({ emotion, score }) => ({
    subject: emotion,
    A: score.toFixed(2),
    fullMark: 1,
  }));

  return (
    <Card className='w-full h-full max-w-6xl m-2 bg-gradient-to-br from-blue-50 to-purple-50'>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-800">Emotion Spider</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart cx="50%" cy="50%" outerRadius="90%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 1]} />
            <Radar name="Emotions" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.7} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmotionSpiderChart;