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
  const [isCameraStarted, setIsCameraStarted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isScanning, setIsScanning] = useState<boolean>(false)

  // バーコードスキャン後の処理
  const handleBarcodeScanned = useCallback(
    (code: string) => {
      if (scannedResult === code) return

      setScannedResult(code)
      onScanSuccess(code)
    
      if (codeReader.current) {
        codeReader.current.reset()
      }
      setIsScanning(false)
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

    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    try {
      setError(null)
      setIsLoading(true)
      setIsVideoReady(false)
      setIsCameraStarted(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      
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

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        throw new Error('動画のサイズが不正です')
      }

      setIsLoading(false)
      startScanning()
    } catch (err) {
      console.error('カメラへのアクセスに失敗しました:', err)
      setError(
        'カメラにアクセスできません。ブラウザの設定を確認してください。'
      )
      setIsLoading(false)
      setIsVideoReady(false)
      setIsCameraStarted(false)
    }
  }

  // スキャン開始処理
  const startScanning = () => {
    const videoElement = videoRef.current
    if (!codeReader.current || !videoElement) return

    // 前回の結果をクリア
    setScannedResult(null)
    setError(null)
    
    setIsScanning(true)
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

  // カメラ停止処理
  const stopCamera = () => {
    const videoElement = videoRef.current
    
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoElement.srcObject = null
    }

    if (codeReader.current) {
      codeReader.current.reset()
    }

    setIsVideoReady(false)
    setIsCameraStarted(false)
    setIsLoading(false)
    setIsScanning(false)
    setError(null)
    setScannedResult(null)
  }

  // スキャン一時停止/再開
  const toggleScanning = () => {
    if (isScanning) {
      if (codeReader.current) {
        codeReader.current.reset()
      }
      setIsScanning(false)
    } else {
      startScanning()
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">カメラ</h3>
      <p className="text-gray-600 mb-4">
        97から始まるバーコードをスキャンしてください
      </p>
      
      {/* カメラ制御ボタン */}
      <div className="mb-4 flex gap-2">
        {!isCameraStarted ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                カメラを起動中...
              </>
            ) : (
              'カメラを起動'
            )}
          </button>
        ) : (
          <>
            <button
              onClick={toggleScanning}
              disabled={!isVideoReady}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isScanning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isScanning ? 'スキャン一時停止' : scannedResult ? '再スキャン' : 'スキャン開始'}
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              カメラを停止
            </button>
          </>
        )}
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover border border-gray-300 rounded-lg"
          style={{ minHeight: '256px' }}
        />
        
        {/* 初期状態 */}
        {!isCameraStarted && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">📷</div>
              <p className="text-gray-600">「カメラを起動」ボタンを押してください</p>
            </div>
          </div>
        )}
        
        {/* ローディング状態 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">カメラを起動中...</p>
            </div>
          </div>
        )}
        
        {/* スキャンライン */}
        {isVideoReady && isScanning && (
          <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-red-500 transform -translate-y-1/2" />
        )}
        
        {/* 一時停止状態 */}
        {isVideoReady && !isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⏸️</div>
              <p>スキャン一時停止中</p>
            </div>
          </div>
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
