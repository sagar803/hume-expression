"use client"
import React, { useEffect, useRef, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Emotion {
  score: number;
  name: string;
}

interface Expressions {
  [key: string]: number;
}

const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expressions, setExpressions] = useState<Expressions | null>(null);
  const wsRef = useRef<W3CWebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
  }, []);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      wsRef.current = new W3CWebSocket(`wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsStreaming(true);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data as string);
        if (data.face && data.face.predictions && data.face.predictions.length > 0) {
          const emotions: Emotion[] = data.face.predictions[0].emotions;
          const expressionsObj: Expressions = {};
          emotions.forEach((emotion: Emotion) => {
            expressionsObj[emotion.name] = emotion.score;
          });
          setExpressions(expressionsObj);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsStreaming(false);
      };

      startSendingFrames();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsStreaming(false);
    setExpressions(null);
  };

  const startSendingFrames = () => {
    const sendVideoFrames = () => {
      if (videoRef.current && canvasRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
          const base64Data = imageData.split(',')[1];

          wsRef.current.send(JSON.stringify({
            data: base64Data,
            models: {
              face: {}
            }
          }));
        }
      }
    };

    const intervalId = setInterval(sendVideoFrames, 1000);
    return () => clearInterval(intervalId);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent>
        <Alert variant="default" className="mb-4">
          <AlertDescription>
            Streaming API Status: {isStreaming ? 'Connected' : 'Disconnected'}
          </AlertDescription>
        </Alert>

        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video mb-4" />
          <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
          
          {isStreaming && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute bottom-2 left-2"
              onClick={stopVideoStream}
            >
              Stop
            </Button>
          )}
        </div>

        <div className="flex space-x-2 mb-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {devices.filter(device => device.kind === 'videoinput').map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {devices.filter(device => device.kind === 'audioinput').map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isStreaming && (
          <Button onClick={startVideoStream}>Start Stream</Button>
        )}

        {expressions && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Facial Expressions:</h2>
            <ul>
              {Object.entries(expressions).map(([emotion, score]) => (
                <li key={emotion} className="mb-1">
                  {emotion}: {score.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoStream;