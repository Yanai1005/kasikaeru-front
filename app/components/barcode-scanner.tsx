

import { useRef, useEffect } from "react";

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // カメラへのアクセス許可をリクエスト
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">バーコードスキャン</h2>
      <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ 
            width: "100%", 
            maxWidth: "400px", 
            height: "200px", 
            objectFit: "cover", 
            border: "1px solid #ccc" }} className="rounded-lg" />
        <div
            style={{
            position: "absolute",
            top: "50%",
            left: "5%",
            right: "5%",
            height: "2px",
            backgroundColor: "red",
            transform: "translateY(-50%)",
            }}
      />
      </div>
    </div>
  );
}