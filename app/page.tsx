'use client';
import YoutubePlayer  from '../components/youtube-player';
import InitialPage from '@/components/input-page';
import { useEffect, useState } from 'react';

export default function Home() {
  return (
    <div>
      <YoutubePlayer />
    </div>
  );
}
