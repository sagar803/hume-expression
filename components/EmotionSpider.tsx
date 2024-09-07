import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Emotion {
  emotion: string;
  score: number;
}

interface Props {
  sortedEmotions: Emotion[];
}

const EmotionSpiderChart: React.FC<Props> = ({ sortedEmotions }) => {
  const topEmotions = sortedEmotions.slice(0, 7);

  const data = topEmotions.map(({ emotion, score }) => ({
    subject: emotion,
    A: score.toFixed(2),
    fullMark: 1,
  }));

  return (
    <Card className='w-full max-w-4xl my-4'>
      <CardHeader>
      <CardTitle className="text-2xl font-bold text-center text-gray-800">Emotion Spider</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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