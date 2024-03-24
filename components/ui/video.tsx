export default function Video({videoUrl}: {videoUrl: string}) {
    return (
        <div>
            <iframe 
                src={videoUrl} 
                className="w-48 h-48 rounded-full border-none"
                allow="autoplay"
            ></iframe>
        </div>
    )
}