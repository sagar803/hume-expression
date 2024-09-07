import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmotionName, emotions } from '@/lib/types';


interface Props {
  sortedEmotion: {
    emotion: string;
    score: number;
  }[]
}

type Point = {
  time: string;
  emotion: EmotionName;
  score: number;
}

const colors = [
  { color: "#000", emotion: "Neutral" },
  { color: "#c66a26", emotion: "Confusion" },
  { color: "#998644", emotion: "Doubt" },
  { color: "#336cff", emotion: "Concentration" },
  { color: "#a9cce1", emotion: "Interest" },
  { color: "#a4a4a4", emotion: "Boredom" },
  { color: "#006c7c", emotion: "Disappointment" },
  { color: "#a9cce1", emotion: "Calmness" },
  { color: "#ffd600", emotion: "Joy" },
];

// @ts-ignore
const CustomizedDot = (props: any) => {
  const { cx, cy, payload } = props;
  const size = 2 + (payload.score * 4);

  let color = "hsl(210, 70%, 50%)"
  colors.forEach((val) => {
    if (val.emotion === payload.emotion) {
      color = val.color
    }
  })

  return (
    <circle
      cx={cx}
      cy={cy}
      r={size}
      fill={color}
    />
  );
};



export default function ExpressionGraph({ sortedEmotion }: Props) {
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        if (sortedEmotion.length === 0) {
          return prevData;
        }

        let selectedEmotion: Point | null = null;

        for (let i = 0; i < sortedEmotion.length; i++) {
          const emotion = sortedEmotion[i].emotion;
          for (let j = 0; j < emotions.length; j++) {
            if (emotion === emotions[j]) {
              selectedEmotion = {
                time: new Date().toLocaleTimeString(),
                emotion: sortedEmotion[i].emotion as EmotionName,
                score: sortedEmotion[i].score
              }
              break;
            }
          }
          if (selectedEmotion) {
            break;
          }
        }

        if (!selectedEmotion) {
          return prevData;
        }


        const newData = [...prevData, selectedEmotion];
        return newData.slice(-8);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sortedEmotion]);

  return (
    <Card className="w-full h-full max-w-6xl m-2 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-800">Emotion Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-[500px] max-w-6xl m-2 ">
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
              type="monotone"
              dataKey="emotion"
              stroke="hsl(210, 70%, 50%)"
              strokeWidth={2}
              dot={<CustomizedDot />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

}