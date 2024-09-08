import { emotionColors } from '@/lib/utilities/emotionUtilities';
import React, { useEffect, useState } from 'react';

interface Props {
  sortedEmotion: {
    emotion: string;
    score: number;
  }[]
}

export default function Expression({ sortedEmotion }: Props) {
  const [currentTime, setCurrentTime] = useState<number>(1)
  const [expressionPerSecond, setExpressionPerSecond] = useState<{
    time: number;
    emotion: string;
    score: number;
  }[]>([]);

  useEffect(() => {
    if (expressionPerSecond.length > 0 && sortedEmotion[0].emotion !== expressionPerSecond[expressionPerSecond.length - 1].emotion) {
      setExpressionPerSecond(prev => [...prev, { ...sortedEmotion[0], time: currentTime }])
    }

    if(expressionPerSecond.length === 0) {
      setExpressionPerSecond([{...sortedEmotion[0], time: 1}])
    }
  }, [sortedEmotion]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-4 mt-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4 w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center">Emotion Tracker</h2>
      </div>
      <div className="space-y-2">
        {expressionPerSecond.map(({ emotion, score, time }, index) => (
          <div
            key={`${emotion}-${index}`}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-8">{time}s</span>
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-110`}
                style={{ backgroundColor: emotionColors[emotion] }}
              ></div>
              <span className="font-medium text-gray-700">{emotion}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">{score.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}