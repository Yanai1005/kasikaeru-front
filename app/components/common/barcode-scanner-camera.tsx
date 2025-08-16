import { useRef, useEffect, useState, useCallback } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library'
import type { BarcodeScannerCameraProps } from '~/types/barcode-scanner'

export default function BarcodeScannerCamera({
  onScanSuccess,
}: BarcodeScannerCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)

  // バーコードスキャン後の処理
  const handleBarcodeScanned = useCallback(
    (code: string) => {
      if (scannedResult === code) return

      setScannedResult(code)
      onScanSuccess(code)
    },
    [scannedResult, onScanSuccess]
  )

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
        setError(null)
        setIsVideoReady(false)
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, 
        })
        if (videoElement) {
          videoElement.srcObject = stream
          
          // 動画の読み込み完了を待つ
          await new Promise<void>((resolve, reject) => {
            const handleLoadedData = () => {
              videoElement.removeEventListener('loadeddata', handleLoadedData)
              videoElement.removeEventListener('error', handleError)
              setIsVideoReady(true)
              resolve()
            }
            
            const handleError = () => {
              videoElement.removeEventListener('loadeddata', handleLoadedData)
              videoElement.removeEventListener('error', handleError)
              reject(new Error('動画の読み込みに失敗しました'))
            }
            
            if (videoElement.readyState >= 2) {
              setIsVideoReady(true)
              resolve()
            } else {
              videoElement.addEventListener('loadeddata', handleLoadedData)
              videoElement.addEventListener('error', handleError)
            }
          })
          await new Promise(resolve => setTimeout(resolve, 500))

          if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            throw new Error('動画のサイズが不正です')
          }
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
                if (err.name === 'IndexSizeError') {
                  return
                }
                console.error('スキャンエラー:', err)
              }
            }
          )
        }
      } catch (err) {
        console.error('カメラへのアクセスに失敗しました:', err)
        setError(
          'カメラにアクセスできません。ブラウザの設定を確認してください。'
        )
        setIsVideoReady(false)
      }
    }

    startCamera()

    return () => {
      
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoElement.srcObject = null
      }
      
      if (codeReader.current) {
        codeReader.current.reset()
        codeReader.current = null
      }
      
      setIsVideoReady(false)
      setError(null)
      setScannedResult(null)
    }
  }, [handleBarcodeScanned])

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
          style={{ minHeight: '256px' }}
        />
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">カメラを起動中...</p>
            </div>
          </div>
        )}
        {isVideoReady && (
          <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-red-500 transform -translate-y-1/2" />
        )}
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
