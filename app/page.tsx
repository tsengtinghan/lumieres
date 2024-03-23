'use client';
import YouTubePlayer  from '../components/youtube-player';
import { useEffect, useState } from 'react';

export default function Home() {
  const [timeIndex, setTimeIndex] = useState(0);
  const timeStamps = [
    { time: 0, title: 'Introduction' },
    { time: 60, title: 'First Section' },
    { time: 120, title: 'Second Section' },
    { time: 180, title: 'Third Section' },
  ];

  // useEffect(() => {
  //   if  (timeIndex < timeStamps.length) {
  //     const interval = setInterval(() => {
  //       if (timeStamps[timeIndex].time === timeStamps[timeIndex].time) {
  //         console.log(timeStamps[timeIndex].title);
  //         setTimeIndex(timeIndex + 1);
  //       }
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }
  // }, []);
  return (
    <div>
      <YouTubePlayer />
    </div>
  );
}
