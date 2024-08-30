//@ts-check
"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Wifi, WebcamIcon, Pause, List, ListIcon, Rows2 } from 'lucide-react';

interface Emotion {
  score: number;
  name: string;
}

interface EmotionMap {
  [key: string]: number;
}
interface Props {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const VideoStream = ({activeTab , setActiveTab}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotionMap, setEmotionMap] = useState<EmotionMap | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState("");


  useEffect(() => {
    console.log("Mounting component");
    console.log("Connecting to server");
    connect();

    return () => {
      console.log("Tearing down component");
      stopEverything();
    };
  }, []);


  function connect() {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Socket already exists, will not create");
    } else {
      setStatus(`Connecting to server...`);
      console.log(`Connecting to websocket...`);
      
      const socketUrl = `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`;
      const socket = new WebSocket(socketUrl);

      socket.onopen = socketOnOpen;
      socket.onmessage = socketOnMessage;
      socket.onclose = socketOnClose;
      socket.onerror = socketOnError;

      socketRef.current = socket;
    }
  }

  async function socketOnOpen() {
    console.log("Connected to websocket");
    setStatus("Connecting to webcam...");
    // setIsStreaming(true);

  }

  async function socketOnMessage(event: MessageEvent) {
    const data = JSON.parse(event.data as string);
    console.log(data)
    if (data.face && data.face.predictions && data.face.predictions.length > 0) {
      const emotions: Emotion[] = data.face.predictions[0].emotions;
      const map: EmotionMap = {};
      emotions.forEach((emotion: Emotion) => {
        map[emotion.name] = emotion.score;
      });
      setEmotionMap(map);
    }
  }

  async function socketOnClose(event: CloseEvent) {
    console.log("Socket closed : ", event);
  }

  async function socketOnError(event: Event) {
    console.error("Socket failed to connect: ", event);
  }

  function stopEverything() {
    console.log("Stopping everything...");
    // mountRef.current = false;
    const socket = socketRef.current;
    if (socket) {
      console.log("Closing socket");
      socket.close();
      socketRef.current = null;
    } else {
      console.warn("Could not close socket, not initialized yet");
    }
  }


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
      setIsStreaming(true)
      startSendingFrames();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    // if (socketRef.current) {
    //   socketRef.current.close();
    // }
    setIsStreaming(false);
    setEmotionMap(null);
  };

  const startSendingFrames = () => {
    const sendVideoFrames = () => {
      if (videoRef.current && canvasRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
          const base64Data = imageData.split(',')[1];

          socketRef.current.send(JSON.stringify({
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


  const sortedEmotions = React.useMemo(() => {
    if (!emotionMap) return [];
    return Object.entries(emotionMap)
      .sort(([, a], [, b]) => b - a)
      .map(([emotion, score]) => ({ emotion, score }));
  }, [emotionMap]);

  const tabs = [
    { id: 'face', label: 'Facial expression' },
    { id: 'burst', label: 'Vocal Burst' },
    { id: 'prosody', label: 'Speech Prosody' }
  ];


  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <div className='flex w-full max-w-10xl justify-center gap-5'>
        {/* Left Div */}
        <Card className="w-1/3">
          <div className='ml-6 my-4 flex gap-2 items-center bg-gray-100 border border-gray-300 rounded-xl p-2 px-4 w-fit'>
            <Wifi size={16} color='gray'/>
            <p className='text-sm'>Streaming API Status: {isStreaming ? 'Connected' : 'Disconnected'}</p>
          </div>

          <CardContent>
            <div className="relative w-full aspect-video border">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover rounded-lg ${isStreaming ? 'block' : 'hidden'}`} 
                />
              <canvas 
                ref={canvasRef} 
                className={`absolute inset-0 w-full h-full hidden`} 
              />
              <div 
                onClick={startVideoStream} 
                className={`absolute inset-0 w-full z-1 h-full rounded bg-orange-200 flex flex-col justify-center items-center  ${isStreaming ? 'hidden' : 'block'}`}
              >
                <WebcamIcon strokeWidth={1} className='rounded-full size-8 p-1 bg-orange-300'  />
                <p className='text-sm'> Start Webcam</p>
              </div>

              {isStreaming && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-full absolute bottom-2 left-2"
                  onClick={stopVideoStream}
                >
                  <Pause />
                </Button>
              )}
            </div>
            <div className="my-2 flex-col lg:flex-row flex gap-2 mb-4">
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
          </CardContent>
        </Card>

        {/* Right Div */}
        <Card className='w-1/2'>
            <div className="m-2 p-2 bg-gray-200 rounded-lg">
              <div className="flex space-x-2">
                {tabs.map(tab => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
            <CardContent className='flex p-2 justify-center min-h-96 gap-2'>
              <Card className='w-1/2 text-sm'>
                  <div className='bg-gray-200 h-10 flex gap-1 items-center pl-2'>
                    <Rows2 strokeWidth={1} color='gray' size={16} />
                    <h2 className=" font-semibold text-gray-700">Top Emotions List</h2>
                  </div>
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                  {sortedEmotions.slice(0,5).map(({ emotion, score }, index) => (
                      <div key={emotion} className="flex items-center justify-between border-2 bg-gray-100 rounded-full p-2">
                        <div className="flex gap-1 items-center">
                          <span className='w-4'>{index + 1}</span>
                          <div className={`w-4 h-4 rounded-md mr-2 bg-blue-500`}></div>
                          <span>{emotion}</span>
                        </div>
                        <span>{score.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
              </Card>

              <Card className='w-1/2'>
                  <div className='bg-gray-200 h-10 flex gap-1 items-center pl-2'>
                    <Rows2 strokeWidth={1} color='gray' size={16} />
                    <h2 className="text-sm font-semibold text-gray-700">Emotions Levels</h2>
                  </div>
                <div className="max-h-96 overflow-y-auto pr-2">
                  {emotionMap && <EmotionRange emotionMap={emotionMap}/>}
                </div>
              </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoStream;


const EmotionRange = ({ emotionMap } : {emotionMap: EmotionMap}) => {
  const topExpressions = ["Calmness", "Joy", "Amusement", "Anger", "Confusion", "Disgust", "Sadness", "Horror", "Surprise (positive)"];

  return (
    <div className="w-full p-2 space-y-3">
      {topExpressions.map(em => (
        <div key={em} className="flex items-center space-x-3">
          <div className="flex-grow">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-800 h-3 rounded-s-full transition-all duration-300 ease-in-out" 
                style={{ width: `${emotionMap[em] * 100}%` }}
              />
            </div>
          </div>
          <div className="w-24 sm:w-28 text-xs sm:text-sm font-medium truncate">
            {em}
          </div>
        </div>
      ))}
    </div>
  );
};


    {/* <div className="w-16 sm:w-20 text-right text-xs sm:text-sm text-gray-600">
            {(emotionMap[em] * 100).toFixed(2)}%
          </div> */}