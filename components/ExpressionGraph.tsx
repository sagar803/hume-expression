import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const emotions = [
  'Joy', 'Interest', 'Concentration', 'Calmness',
  'Neutral', 'Doubt', 'Confusion', 'Boredom', 'Disappointment'
];

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
    <div className="w-full h-96 max-w-6xl bg-white p-2">
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
            domain={emotions}
            ticks={emotions}
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
            type="stepAfter"
            dataKey="emotion"
            stroke="hsl(210, 70%, 50%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(210, 70%, 50%)' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}