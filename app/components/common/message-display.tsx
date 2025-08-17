import type { MessageDisplayProps } from '~/types/barcode-scanner'

export default function MessageDisplay({
  error,
  success,
}: MessageDisplayProps) {
  return (
    <>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-black">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-black">{success}</p>
        </div>
      )}
    </>
  )
}
