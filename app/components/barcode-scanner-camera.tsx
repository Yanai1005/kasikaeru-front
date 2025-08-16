import { useRef, useEffect, useState } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library'
import type { BarcodeScannerCameraProps } from '~/types/barcode-scanner'

export default function BarcodeScannerCamera({ onScanSuccess }: BarcodeScannerCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // バーコードスキャナーの初期化
  useEffect(() => {
    const hints = new Map()
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ]
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)

    codeReader.current = new BrowserMultiFormatReader(hints)

    const videoElement = videoRef.current

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // 背面カメラを優先
        })
        if (videoElement) {
          videoElement.srcObject = stream
        }
        if (codeReader.current && videoElement) {
          codeReader.current.decodeFromVideoDevice(
            null,
            videoElement,
            (result, err) => {
              if (result) {
                const scannedCode = result.getText()
                console.log('バーコードが検出されました:', scannedCode)
                handleBarcodeScanned(scannedCode)
              }
              if (err) {
                if (
                  err instanceof NotFoundException ||
                  err instanceof ChecksumException ||
                  err instanceof FormatException
                ) {
                  return
                }
                console.error('スキャンエラー:', err)
              }
            }
          )
        }
      } catch (err) {
        console.error('カメラへのアクセスに失敗しました:', err)
        setError('カメラにアクセスできません。ブラウザの設定を確認してください。')
      }
    }

    startCamera()

    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (codeReader.current) {
        codeReader.current.reset()
      }
    }
  }, [])

  // バーコードスキャン後の処理
  const handleBarcodeScanned = (code: string) => {
    if (scannedResult === code) return // 重複スキャン防止

    setScannedResult(code)
    onScanSuccess(code)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">カメラ</h3>
      <p className="text-gray-600 mb-4">
        97から始まるバーコードをスキャンしてください
      </p>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover border border-gray-300 rounded-lg"
        />
        <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-red-500 transform -translate-y-1/2" />
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {scannedResult && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-gray-600">読み取ったバーコード:</p>
          <p className="font-mono text-lg">{scannedResult}</p>
        </div>
      )}
    </div>
  )
}
