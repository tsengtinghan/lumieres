'use client';
import React from "react";
import YouTube, { YouTubeProps } from 'react-youtube';

const YoutubePlayer = () => {
  const opts = {
    width: "100%",
    borderRadius: "2rem",
    playerVars: { autoplay: 1 },
  };
  const videoReady : YouTubeProps['onReady'] = (event) => {
    event.target.playVideo();
  };

  return (
    <>
      <h1>YouTube Player</h1>
      <div>
        <div
          style={{
            maxWidth: "800px",
            margin: "auto",
            marginTop: "12px",
            minHeight: "30vh",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <YouTube
            videoId="2g811Eo7K8U"
            opts={opts}
            onReady={videoReady}
          />
        </div>
      </div>
    </>
  );
};

export default YoutubePlayer;