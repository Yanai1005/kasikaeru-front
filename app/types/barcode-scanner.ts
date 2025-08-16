import type { ObjectInfo, User } from '~/types/object'

export interface BarcodeScannerProps {
    apiUrl: string
    onLendingComplete?: () => void
}

export interface BarcodeScannerCameraProps {
    onScanSuccess: (code: string) => void
}

export interface ObjectInfoDisplayProps {
    objectInfo: ObjectInfo | null
    loading: boolean
}

export interface LendingFormProps {
    objectInfo: ObjectInfo | null
    users: User[]
    selectedUserId: string
    onUserSelect: (userId: string) => void
    onLending: () => void
    onReset: () => void
    loading: boolean
}

export interface MessageDisplayProps {
    error: string | null
    success: string | null
}

export interface UseLendingProps {
    apiUrl: string
    onLendingComplete?: () => void
}

export interface UseLendingReturn {
    users: User[]
    objectInfo: ObjectInfo | null
    selectedUserId: string
    setSelectedUserId: (userId: string) => void
    loading: boolean
    error: string | null
    success: string | null
    fetchObjectInfo: (code: string) => Promise<void>
    handleLending: () => Promise<void>
    reset: () => void
}

export type { ObjectInfo, User }
