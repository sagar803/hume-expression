import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CANONICAL_EMOTION_NAMES } from '@/lib/utilities/emotionUtilities';

type EmotionName = string;

interface Props {
  sortedEmotion: {
    emotion: EmotionName;
    score: number;
  }[]
}

type Point = {
  time: string;
  emotion: EmotionName;
  score: number;
}

const getEmotionColor = (emotion: string) => {
  const hue = (CANONICAL_EMOTION_NAMES.indexOf(emotion) / CANONICAL_EMOTION_NAMES.length) * 360;
  return `hsl(${hue}, 70%, 50%)`;
};


export default function ExpressionGraph({ sortedEmotion }: Props) {
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        if (sortedEmotion.length === 0) {
          return prevData;
        }
        const newPoint: Point = {
          time: new Date().toLocaleTimeString(),
          emotion: sortedEmotion[0].emotion as EmotionName,
          score: sortedEmotion[0].score
        };
        const newData = [...prevData, newPoint];
        return newData.slice(-8);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sortedEmotion]);

  return (
    <Card className="w-full h-full max-w-6xl bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-800">Emotion Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-[2200px] max-w-6xl bg-white p-2">
        <ResponsiveContainer width="97%" height="97%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="category"
              interval="preserveStartEnd"
            />
            <YAxis
              type="category"
              dataKey="emotion"
              domain={CANONICAL_EMOTION_NAMES}
              ticks={CANONICAL_EMOTION_NAMES}
            />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="custom-tooltip bg-white p-2 border border-gray-300">
                    <p>{`Time: ${payload[0].payload.time}`}</p>
                    <p>{`Emotion: ${payload[0].payload.emotion}`}</p>
                    <p>{`Score: ${payload[0].payload.score.toFixed(2)}`}</p>
                  </div>
                );
              }
              return null;
            }} />
            <Line
              type="monotone"
              dataKey="emotion"
              stroke="hsl(210, 70%, 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(210, 70%, 50%)' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

}