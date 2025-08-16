import { atom } from 'jotai'
import { BarcodeFormat } from '@zxing/library'

export const scannedResultAtom = atom<string | null>(null)
export const errorAtom = atom<string | null>(null)
export const isVideoReadyAtom = atom<boolean>(false)
export const isCameraStartedAtom = atom<boolean>(false)
export const isLoadingAtom = atom<boolean>(false)
export const isScanningAtom = atom<boolean>(false)

export const barcodeFormatsAtom = atom<BarcodeFormat[]>([
  BarcodeFormat.EAN_13,
  BarcodeFormat.UPC_A,
  BarcodeFormat.EAN_8,
  BarcodeFormat.CODE_128,
  BarcodeFormat.QR_CODE,
])

export const canStartScanningAtom = atom((get) => {
  const isVideoReady = get(isVideoReadyAtom)
  const isCameraStarted = get(isCameraStartedAtom)
  const isLoading = get(isLoadingAtom)

  return isVideoReady && isCameraStarted && !isLoading
})

export const scanButtonTextAtom = atom((get) => {
  const isScanning = get(isScanningAtom)
  const scannedResult = get(scannedResultAtom)

  if (isScanning) return 'スキャン一時停止'
  if (scannedResult) return '再スキャン'
  return 'スキャン開始'
})

export const clearResultAtom = atom(null, (_get, set) => {
  set(scannedResultAtom, null)
  set(errorAtom, null)
})

export const resetAllStateAtom = atom(null, (_get, set) => {
  set(scannedResultAtom, null)
  set(errorAtom, null)
  set(isVideoReadyAtom, false)
  set(isCameraStartedAtom, false)
  set(isLoadingAtom, false)
  set(isScanningAtom, false)
})
