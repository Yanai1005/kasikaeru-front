import { useRef, useEffect } from "react";

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // カメラへのアクセス許可をリクエスト
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          // カメラ映像をvideo要素にセット
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("カメラへのアクセスに失敗しました:", err);
      }
    }

    startCamera();

    // コンポーネントがアンマウントされたときにカメラを停止
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        バーコードスキャン
      </h2>
      <div className="relative w-full max-w-sm">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-sm h-48 object-cover border border-gray-300 rounded-lg"
        />
        <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-red-500 transform -translate-y-1/2" />
      </div>
    </div>
  );
}
