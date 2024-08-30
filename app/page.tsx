//@ts-check
"use client"

import React, { useEffect, useRef, useState } from "react";
import VideoStream from "@/components/VideoStream";
import Image from "next/image";
import AudioStreamingComponent from "@/components/AudioStream";

export default function Home() {
  const [activeTab, setActiveTab] = useState('face')
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const streamRef = useRef<MediaStream | null>(null);

  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);



  // useEffect(() => {
  //   startVideoStream();
  //   return () => {
  //     console.log("Tearing down component");
  //   };
  // }, []);

  // const startVideoStream = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     streamRef.current = stream;
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //     }
  //     // startSendingFrames();
  //   } catch (error) {
  //     console.error('Error accessing camera:', error);
  //   }
  // };


  return (
    <div>
      {/* <h1>Facial Expression Analysis</h1>

        <div className="relative max-w-md mx-auto">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video mb-4" />
          <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
        </div> */}
      <VideoStream activeTab={activeTab} setActiveTab={setActiveTab}/>
      {/* <AudioStreamingComponent modelName="prosody" recordingLengthMs={500} streamWindowLengthMs={5000} /> */}
    
    </div>
  );
}
