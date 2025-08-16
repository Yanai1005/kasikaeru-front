import { useRef, useEffect, useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    BrowserMultiFormatReader,
    NotFoundException,
    ChecksumException,
    FormatException,
    DecodeHintType,
} from '@zxing/library'
import {
    scannedResultAtom,
    errorAtom,
    isVideoReadyAtom,
    isCameraStartedAtom,
    isLoadingAtom,
    isScanningAtom,
    barcodeFormatsAtom,
    resetAllStateAtom,
    clearResultAtom,
} from '~/atoms/barcodeScannerAtoms'

interface UseBarcodeScannerOptions {
    onScanSuccess: (code: string) => void
}

export function useBarcodeScanner({ onScanSuccess }: UseBarcodeScannerOptions) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const codeReader = useRef<BrowserMultiFormatReader | null>(null)

    // Jotai atoms
    const [scannedResult, setScannedResult] = useAtom(scannedResultAtom)
    const [error, setError] = useAtom(errorAtom)
    const [isVideoReady, setIsVideoReady] = useAtom(isVideoReadyAtom)
    const [isCameraStarted, setIsCameraStarted] = useAtom(isCameraStartedAtom)
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
    const [isScanning, setIsScanning] = useAtom(isScanningAtom)
    const formats = useAtomValue(barcodeFormatsAtom)
    const resetAllState = useSetAtom(resetAllStateAtom)
    const clearResult = useSetAtom(clearResultAtom)

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
        [scannedResult, onScanSuccess, setScannedResult, setIsScanning]
    )

    // スキャン開始処理
    const startScanning = useCallback(() => {
        const videoElement = videoRef.current
        if (!codeReader.current || !videoElement) return

        clearResult()

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
    }, [handleBarcodeScanned, clearResult, setIsScanning])

    // カメラ停止処理
    const stopCamera = useCallback(() => {
        const videoElement = videoRef.current

        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
            videoElement.srcObject = null
        }

        if (codeReader.current) {
            codeReader.current.reset()
        }

        resetAllState()
    }, [resetAllState])

    // カメラ開始処理
    const startCamera = useCallback(async () => {
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
    }, [setError, setIsLoading, setIsVideoReady, setIsCameraStarted, startScanning])

    // スキャン一時停止/再開
    const toggleScanning = useCallback(() => {
        if (isScanning) {
            if (codeReader.current) {
                codeReader.current.reset()
            }
            setIsScanning(false)
        } else {
            startScanning()
        }
    }, [isScanning, startScanning, setIsScanning])

    // バーコードスキャナーの初期化
    useEffect(() => {
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
        codeReader.current = new BrowserMultiFormatReader(hints)

        return () => {
            if (codeReader.current) {
                codeReader.current.reset()
            }
        }
    }, [formats])

    // コンポーネントアンマウント時のクリーンアップ
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

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
