interface VideoProps {
    videoUrl: string;
    handleVideoEnd: () => void;
    playerRef: React.RefObject<any>;
}
export default function Video({videoUrl, handleVideoEnd}: {videoUrl: string, handleVideoEnd: () => void}) {
    return (
        <div>
            <video 
                src={videoUrl} 
                className="w-48 h-48 rounded-full border-none"
                autoPlay
                onEnded={handleVideoEnd}
            />
        </div>
    )
}