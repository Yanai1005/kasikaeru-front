import { useRef, useEffect, useState } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  DecodeHintType, 
  BarcodeFormat
} from '@zxing/library'

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)

  useEffect(() => {
    // 読み取りたい形式を指定
    const hints = new Map();
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    // Readerを初期化
    codeReader.current = new BrowserMultiFormatReader(hints)

    const videoElement = videoRef.current

    // カメラへのアクセス許可をリクエスト
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        if (videoElement) {
          // カメラ映像をvideo要素にセット
          videoElement.srcObject = stream
        }
        if (codeReader.current && videoElement) {
          codeReader.current.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
              console.log('バーコードが検出されました:', result.getText())
              // ここでバーコードの結果を処理
              setScannedResult(result.getText())
            }
            if (err) {
              // 見つからない/検証失敗/フォーマット不正は通常運用なので無視
              if (
                err instanceof NotFoundException ||
                err instanceof ChecksumException ||
                err instanceof FormatException
              ) {
                return
              }
              // それ以外は本当のエラーとしてログ
              console.error('スキャンエラー:', err)
            }
          })
        }
      } catch (err) {
        console.error('カメラへのアクセスに失敗しました:', err)
      }
    }

    startCamera()

    // コンポーネントがアンマウントされたときにカメラを停止
    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (codeReader.current) {
        codeReader.current.reset();
      }

    }
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        バーコードスキャン
      </h2>
      <p className="text-gray-600 mb-4">
        カメラを使用して97から始まるバーコードをスキャンしてください。
      </p>
      <p className="text-gray-600 mb-4">
        読み取り結果:{scannedResult}
      </p>

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
  )
}
