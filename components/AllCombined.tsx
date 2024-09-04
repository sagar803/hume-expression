"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from '@/lib/media/audioRecorder';
import { blobToBase64 } from '@/lib/utilities/blobUtilities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Wifi, WebcamIcon, Pause, Rows2, Mic, Upload, Cross, CrossIcon, CircleX } from 'lucide-react';
import { Emotion, EmotionMap } from '@/lib/data/emotion';

import { emotionColors } from '@/lib/utilities/emotionUtilities';
import TabsSection from './Widgets/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

type TabId = 'face' | 'burst' | 'prosody';

interface Tab {
    id: TabId;
    label: string;
}

const tabs: Tab[] = [
    { id: 'face', label: 'Facial expression' },
    { id: 'burst', label: 'Vocal Burst' },
    { id: 'prosody', label: 'Speech Prosody' }
];

const AllCombined = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    // const uploadedVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const mountRef = useRef(true);
    const numReconnects = useRef(0);
    const maxReconnects = 3;

    const socketRef = useRef<WebSocket | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [socketStatus, setSocketStatus] = useState("Connecting...");

    const recorderRef = useRef<AudioRecorder | null>(null);
    const audioBufferRef = useRef<Blob[]>([]);
    const serverReadyRef = useRef(true);

    const sendVideoFramesIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // const [emotions, setEmotions] = useState<Emotion | null>(null);
    const [emotionMap, setEmotionMap] = useState<EmotionMap | null>(null);
    const [warning, setWarning] = useState<string>("");
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
    const [uploadedVideoDetails, setUploadedVideoDetails] = useState<File | null>(null)
    // const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isLive, setIsLive] = useState<boolean>(true);    
    const isStreamingRef = useRef<Boolean | null>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('face')
    const activeTabRef = useRef<string>('face');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);


    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        console.log("Mounting component");
        console.log("Connecting to server");
        connect();

        return () => {
            console.log("Tearing down component");
            disconnect();
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && !isLive) {
            videoRef.current.addEventListener('play', handleVideoPlay);
            videoRef.current.addEventListener('pause', handleVideoPause);
            videoRef.current.addEventListener('ended', handleVideoEnd);
        }
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('play', handleVideoPlay);
                videoRef.current.removeEventListener('pause', handleVideoPause);
                videoRef.current.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, [videoRef.current, uploadedVideo]);

    // Upload Video Functions
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedVideoDetails(file);
            setUploadedVideo(URL.createObjectURL(file));
        }
    };

    const handleVideoPlay = (): void => startSendingFrames();

    const handleVideoPause = (): void => {
        if (sendVideoFramesIntervalRef.current) {
            clearInterval(sendVideoFramesIntervalRef.current);
            sendVideoFramesIntervalRef.current = null;
        }
    };

    const stopUploadedVideoStream = (): void => {
        setIsAnalyzing(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (sendVideoFramesIntervalRef.current) {
            clearInterval(sendVideoFramesIntervalRef.current);
            sendVideoFramesIntervalRef.current = null;
        }
    };

    const handleVideoEnd = (): void => stopUploadedVideoStream();

       
    const handleRemoveUploadedVideo = () => {
        stopUploadedVideoStream();
        setUploadedVideo(null);
        setUploadedVideoDetails(null);
    }

    // Socket Funcitons 
    const connect = async () => {
        const socketUrl = `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`;

        serverReadyRef.current = true;
        console.log(`Connecting to websocket... (using ${socketUrl})`);

        setSocketStatus('Connecting...')

        socketRef.current = new WebSocket(socketUrl);
        socketRef.current.onopen = socketOnOpen;
        socketRef.current.onmessage = socketOnMessage;
        socketRef.current.onclose = socketOnClose;
        socketRef.current.onerror = socketOnError;
    }

    const socketOnOpen = async () => {
        console.log("Connected to websocket");
        setSocketStatus("Connected");
        setIsSocketConnected(true);
    }

    const socketOnMessage = async (event: MessageEvent) =>  {
        const data = JSON.parse(event.data as string);
        if (data[activeTabRef.current] && data[activeTabRef.current].predictions && data[activeTabRef.current].predictions.length > 0) {
            const emotions: Emotion[] = data[activeTabRef.current].predictions[0].emotions;
            console.log(data)
            const map: EmotionMap = {};
            emotions.forEach((emotion: Emotion) => map[emotion.name] = emotion.score);
            setEmotionMap(map);
        } 
        else {
            const warning = data[activeTabRef.current]?.warning || "";
            console.log("warning:", warning)
            setWarning(warning)
            setEmotionMap(null)
        }

        if(isStreamingRef.current) {
            if(activeTabRef.current != 'face'){
                sendAudio();
            }
        }
    }

    const socketOnClose = async (event: CloseEvent) => {
        setSocketStatus('Disconnected');
        disconnect();
        console.log("Socket closed");
        setIsSocketConnected(false)
    }

    const socketOnError = async (event: Event) => {
        console.error("Socket failed to connect: ", event);
        // if(numReconnects.current < maxReconnects) {
        //     setSocketStatus('Reconnecting');
        //     numReconnects.current++;
        //     connect();
        // }
    }

    function disconnect() {
        console.log("Stopping everything...");
        // mountRef.current = true;
        const socket = socketRef.current;

        if (socket) {
            console.log("Closing socket");
            socket.close();
            if(socket.readyState === WebSocket.CLOSING){                
                setSocketStatus('Closing...');
                socketRef.current = null;
            }
        } else console.warn("Could not close socket, not initialized yet");

        stopAudioStream()
        stopVideoStream();
    }
    // Live Audio Stream
    const startAudioStream = async () => {
        console.log('clicked start audio stream', activeTab);
        try {
            recorderRef.current = await AudioRecorder.create();
            setIsStreaming(true);
            isStreamingRef.current = true;
            sendAudio();
        } catch (error) {
            console.error('Error starting audio recorder:', error);
        }
    };

    const sendAudio = async () => {             
        if (recorderRef && recorderRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("Sending audio frames...")
            const blob = await recorderRef.current.record(500);
            audioBufferRef.current.push(blob);
            const combinedBlob = new Blob(audioBufferRef.current);
    
            audioBufferRef.current = [];
    
            const encodedBlob = await blobToBase64(combinedBlob);
            const response = JSON.stringify({
                data: encodedBlob,
                models: {
                    [activeTabRef.current]: {},
                },
                // stream_window_ms: recordingLengthMs,
            });
            socketRef.current?.send(response);
        } else {
            console.log("Socket not open");
        }
    };

    const stopAudioStream = () => {
        console.log('clicked stop audio stream');
        setIsStreaming(false);
        isStreamingRef.current = false;
        if (recorderRef.current) {
            recorderRef.current.stopRecording();
            recorderRef.current = null;
        }
    };

    // Live Video Stream
    const startVideoStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          isStreamingRef.current = true;

          setIsStreaming(true)
          startSendingFrames();
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
    };

    const startSendingFrames = () => {
        let video = videoRef.current;
        const sendVideoFrames = () => {
            if (video && canvasRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
                    const base64Data = imageData.split(',')[1];

                    // Display the image
                    const imgElement = document.getElementById('capturedImage');
                    setCapturedImage(imageData);
                
                    // Send the image data via WebSocket
                    socketRef.current.send(JSON.stringify({
                        data: base64Data,
                        models: {
                            face: {}
                        }
                    }));
                }
            }
        };

        sendVideoFramesIntervalRef.current = setInterval(sendVideoFrames, 1000); 
    };

    const stopVideoStream = () => {
        console.log('Stopping video stream')
    // Stop the sending frames interval
        isStreamingRef.current = false;

        if (streamRef.current) {
            streamRef.current?.getTracks()?.forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        // if (socketRef.current) {
        //   socketRef.current.close();
        // }
        setIsStreaming(false);
        setEmotionMap(null);
        // Stop the interval that sends frames
        if (sendVideoFramesIntervalRef.current) {
            clearInterval(sendVideoFramesIntervalRef.current);
            sendVideoFramesIntervalRef.current = null;
        }
    };
    
    // Others
    const sortedEmotions = React.useMemo(() => {
        if (!emotionMap) return [];
        return Object.entries(emotionMap)
        .sort(([, a], [, b]) => b - a)
        .map(([emotion, score]) => ({ emotion, score }));
    }, [emotionMap]);

    const handleChangeTab = (tabId : TabId) => {
        if(tabId !== 'face' && activeTab !== 'face') stopAudioStream();
        else if (activeTab === 'face') stopVideoStream();
        else if(tabId === 'face') stopAudioStream();

        activeTabRef.current = tabId;
        setActiveTab(tabId)
        setEmotionMap(null)
        setWarning("")
    }

    const handleLiveOrUploadChange = () => {
        playSound()
        if(isLive) stopVideoStream();
        else handleRemoveUploadedVideo();
        setIsLive(!isLive);
        setEmotionMap(null)
    }

    const summary: { [key: string]: string } = {
        "face": 'Explore the diverse facial expressions that convey distinct meanings',
        "burst": 'These are non-linguistic vocal utterances, including laughs, sighs, oohs, ahhs, umms, gasps, and groans.',
        "prosody": 'Speech prosody is not about the words you say, but the way you say them.' 
    }

    const playSound = () => {
        const audio = new Audio('/click.wav');
        audio.play();
    };

    return (
        <div 
            className="w-full min-h-screen flex flex-col items-center justify-center gap-2"
            style={{
                backgroundImage: "radial-gradient(circle, lightgray 1px, transparent 1px)",
                backgroundSize: "10px 10px"
            }}
        >
            {capturedImage && (
                <div>
                <h3>Captured Image:</h3>
                <img src={capturedImage} alt="Captured" />
                </div>
            )}

            <div className='w-full max-w-7xl'>
                <SocketConnectionStatus isSocketConnected={isSocketConnected} socketStatus={socketStatus} onConnect={connect} onDisconnect={disconnect}/>
            </div>
            <div className='flex flex-col md:flex-row w-full max-w-7xl justify-center gap-5'>
                {/* Left Div */}
                <Card className="md:w-2/5  shadow-md">
                    <div className='w-full flex flex-col md:flex-row  justify-around'>
                        <div className={`mx-6 my-4 flex w-fit md:w-3/5 gap-2 items-center border rounded-xl p-2 px-4 transition duration-100 active:scale-95 border-gray-300 shadow-md ${isStreaming ? 'bg-green-300': 'bg-red-300'}`}>
                            <Wifi size={16} color='black'/>
                            <p className={'text-sm'}>Stream : {isStreaming ? 'Connected' : 'Disconnected'}</p>
                        </div>
                        <div className="mx-6 px-2 my-4 flex w-fit md:w-2/5 items-center border-gray-300 border-2 rounded-xl space-x-2 shadow-md">
                            <Label>Live</Label>
                            <Switch onClick={handleLiveOrUploadChange} defaultChecked={isLive} />
                        </div>
                    </div>

                    <CardContent>
                        <div className="relative w-full aspect-video">
                            {activeTab === 'face' ? (
                                <>
                                    {!isLive && uploadedVideo ? (
                                        <video 
                                            ref={videoRef} 
                                            controls 
                                            className="w-full rounded"
                                        >
                                            <source src={uploadedVideo} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-full z-1 h-full rounded bg-orange-200 flex cursor-pointer flex-col justify-center items-center">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                accept="video/*" 
                                                onChange={handleFileUpload} 
                                                className="size-full border-0 hidden"
                                            />
                                            <Upload strokeWidth={1} className='animate-bounce rounded-full size-8 p-1 bg-orange-300'  />
                                            <p className='text-sm select-none'>Upload Video</p>
                                        </div>
                                    )}
                                    {isLive && (
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            muted 
                                            className={`absolute inset-0 w-full h-full object-cover rounded-lg ${isStreaming ? 'block' : 'hidden'}`} 
                                        />
                                    )}
                                    <canvas 
                                        ref={canvasRef} 
                                        className={`absolute inset-0 w-full h-full hidden`} 
                                    />
                                    {isLive && (
                                        <div 
                                            onClick={startVideoStream} 
                                            className={`absolute inset-0 w-full z-1 h-full rounded bg-orange-200 flex cursor-pointer flex-col justify-center items-center ${isStreaming ? 'hidden' : 'block'}`}
                                        >
                                            <WebcamIcon strokeWidth={1} className='animate-bounce rounded-full size-8 p-1 bg-orange-300'  />
                                            <p className='text-sm'>Start Webcam</p>
                                        </div>
                                    )}
                                    {!isLive && (
                                        <div className='flex p-2 justify-between border-2 rounded shadow-lg'> 
                                            <span className='text-sm'>{uploadedVideoDetails?.name}</span>
                                            <CircleX 
                                                strokeWidth={1}
                                                className='cursor-pointer'
                                                onClick={handleRemoveUploadedVideo}
                                            />
                                        </div>
                                    )}
                                    {isLive && isStreaming && (
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            className="rounded-full absolute bottom-2 left-2"
                                            onClick={stopVideoStream}
                                            >
                                                <Pause strokeWidth={1} fill='white'/>
                                        </Button>
                                    )}
                                </>
                                ) : (
                                    <div 
                                        onClick={isStreaming ? stopAudioStream : startAudioStream } 
                                        className={`absolute inset-0 w-full z-1 h-full rounded bg-orange-200 flex cursor-pointer flex-col justify-center items-center`}
                                    >
                                        {isStreaming 
                                            ? <Pause strokeWidth={1} className={`rounded-full size-8 p-1 bg-orange-300 ${isStreaming ? 'animate-pulse' : ''}`}/> 
                                            : <Mic strokeWidth={1} className={`rounded-full size-8 p-1 bg-orange-300 ${isStreaming ? '' : 'animate-bounce'}`}  /> 
                                        }
                                        <p className='text-sm'>{!isStreaming ? "Connect Audio" : "Pause"}</p>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Div */}
                <Card className='md:w-3/5   shadow-md'>
                    <TabsSection activeTab={activeTab} onChangeTab={handleChangeTab} />
                    <p className='text-sm  m-2 p-2 bg-gray-200 rounded-lg'>{summary[activeTab]}</p>

                    <CardContent className='flex p-2 justify-center min-h-96 gap-2'>
                        <Card className='w-1/2 text-sm'>
                            <div className='bg-gray-200 h-10 flex gap-1 items-center pl-2'>
                                <Rows2 strokeWidth={1} color='gray' size={16} />
                                <h2 className=" font-semibold text-gray-700">Top Emotions List</h2>
                            </div>
                            <div className="flex flex-col gap-2 h-96 overflow-y-auto p-2">
                                { emotionMap && sortedEmotions 
                                    ? (
                                        sortedEmotions.slice(0,7).map(({ emotion, score }, index) => (
                                            <div key={emotion} className="scale-90 md:scale-100 flex items-center justify-between border-2 bg-gray-100 rounded-full p-2">
                                                <div className="flex gap-1 items-center">
                                                    <span className='hidden sm:block w-4'>{index + 1}</span>
                                                    <div
                                                        className={`size-2 sm:size-4 rounded-md mr-2`}
                                                        style={{ backgroundColor: emotionColors[emotion] }}
                                                    ></div>
                                                    <span>{emotion}</span>
                                                </div>
                                                <span>{score.toFixed(2)}</span>
                                            </div>
                                        ))        
                                    )
                                    : (warning.length > 0 && <p className='text-center flex items-center justify-center h-full'>{warning}</p>)
                                }

                            </div>
                        </Card>
                        <EmotionsLevels  warning={warning} emotionMap={emotionMap} activeTab={activeTab} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AllCombined;


interface ConnectionStatusProps {
    isSocketConnected: boolean;
    socketStatus: string;
    onConnect: () => void;
    onDisconnect: () => void;
}

export const SocketConnectionStatus: React.FC<ConnectionStatusProps> = ({ isSocketConnected, socketStatus, onConnect, onDisconnect }) => (
    <Card className='text-sm md:text-md w-full flex justify-between items-center px-4 sm:px-10 shadow-md'>
        <p>Connection status</p>
        <div 
            onClick={isSocketConnected ? onDisconnect : onConnect} 
            className={`w-40 cursor-pointer md:my-4 my-2 flex gap-2 items-center border rounded-xl p-2 px-4 transition duration-100 active:scale-95 border-gray-300 shadow-md ${isSocketConnected ? 'bg-green-300': 'bg-red-300'}`}
        >
            <Wifi size={16} color='black'/>
            <p >{socketStatus}</p>
        </div>
    </Card>
);



const EmotionsLevels  = ({ emotionMap, activeTab, warning } : {emotionMap: EmotionMap | null, activeTab: TabId, warning: string}) => {

    const emotionGroups = {
        face: [
          'Amusement',
          'Anger',
          'Awe',
          'Boredom',
          'Calmness',
          'Contempt',
          'Disgust',
          'Joy',
          'Sadness',
          'Tiredness'
        ],
        burst: [
          'Anger',
          'Anxiety',
          'Craving',
          'Distress',
          'Ecstasy',
          'Excitement',
          'Fear',
          'Horror',
          'Relief',
          'Triumph'
        ],
        prosody: [
          'Admiration',
          'Calmness',
          'Concentration',
          'Determination',
          'Empathic Pain',
          'Interest',
          'Realization',
          'Sadness',
          'Satisfaction',
          'Contemplation'
        ]
      };
      
//   const topExpressions = ["Calmness", "Joy", "Amusement", "Anger", "Confusion", "Disgust", "Sadness", "Horror", "Surprise (positive)"];

//   if(emotionMap === null) { return }
  return (
    <Card className='w-1/2 text-sm'>
        <div className='bg-gray-200 h-10 flex gap-2 items-center pl-2'>
            <Rows2 strokeWidth={1} color='gray' size={16} />
            <h2 className="text-sm font-semibold text-gray-700">Emotions Levels</h2>
        </div>
        <div className="h-96 overflow-y-auto pr-2">
            { emotionMap 
                ? (
                    <div className="w-full p-2 space-y-3">
                        {emotionGroups[activeTab].map(em => (
                            <div key={em} className="flex items-center space-x-3">
                                <div className="hidden md:flex md:flex-grow">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className="bg-gray-800 h-4 rounded-s-full transition-all duration-300 ease-in-out" 
                                            style={{ width: `${emotionMap[em] * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-24 sm:w-28 text-xs sm:text-sm font-medium truncate">{em}</div>
                                <span className='text-xs md:hidden'>{`${(emotionMap[em] * 100).toFixed(2)}%`}</span>
                            </div>
                        ))}
                    </div>
                ) : (warning.length > 0 && <p className='text-center flex items-center justify-center h-full'>{warning}</p>)
            }
        </div>
    </Card>
  );
};

