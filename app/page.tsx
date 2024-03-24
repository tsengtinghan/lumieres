'use client';
import YoutubePlayer  from '../components/youtube-player';
import InitialPage from '@/components/input-page';
import FreeForm from '@/components/ui/freeform';
import { useEffect, useState } from 'react';

export default function Home() {
  return (
    <div>
      <YoutubePlayer />
    </div>
  );
}
