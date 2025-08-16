import { useBarcodeScanner } from '~/hooks/useBarcodeScanner'
import { useAtomValue } from 'jotai'
import { scanButtonTextAtom, canStartScanningAtom } from '~/atoms/barcodeScannerAtoms'
import type { BarcodeScannerCameraProps } from '~/types/barcode-scanner'

export default function BarcodeScannerCamera({
  onScanSuccess,
}: BarcodeScannerCameraProps) {
  const {
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
  } = useBarcodeScanner({ onScanSuccess })

  const scanButtonText = useAtomValue(scanButtonTextAtom)
  const canStartScanning = useAtomValue(canStartScanningAtom)

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
              disabled={!canStartScanning}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isScanning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {scanButtonText}
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
