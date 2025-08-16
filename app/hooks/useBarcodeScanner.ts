import { useRef, useEffect, useState, useCallback } from 'react'
import {
    BrowserMultiFormatReader,
    NotFoundException,
    ChecksumException,
    FormatException,
    DecodeHintType,
    BarcodeFormat,
} from '@zxing/library'

export interface UseBarcodeScanner {
    videoRef: React.RefObject<HTMLVideoElement>
    scannedResult: string | null
    error: string | null
    isVideoReady: boolean
    isCameraStarted: boolean
    isLoading: boolean
    isScanning: boolean
    startCamera: () => Promise<void>
    stopCamera: () => void
    toggleScanning: () => void
    clearResult: () => void
}

interface UseBarcodeScannerOptions {
    onScanSuccess: (code: string) => void
    formats?: BarcodeFormat[]
}

export function useBarcodeScanner({
    onScanSuccess,
    formats = [
        BarcodeFormat.EAN_13,
        BarcodeFormat.UPC_A,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.QR_CODE,
    ],
}: UseBarcodeScannerOptions): UseBarcodeScanner {
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
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
        codeReader.current = new BrowserMultiFormatReader(hints)

        return () => {
            stopCamera()
        }
    }, [formats])

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

    // 結果クリア
    const clearResult = () => {
        setScannedResult(null)
        setError(null)
    }

    return {
        videoRef,
        scannedResult,
        error,
        isVideoReady,
        isCameraStarted,
        isLoading,
        isScanning,
        startCamera,
        stopCamera,
        toggleScanning,
        clearResult,
    }
}
