import VideoStream from "@/components/VideoStream";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>Facial Expression Analysis</h1>
      <VideoStream />
    </div>
  );
}
