export interface AppEnvironment {
  API_URL: string
  ALLOWED_IPS?: string
  IP_RESTRICTION_ENABLED?: string
}

export interface LoaderData<T = unknown> {
  data?: T
  error?: string
}

export interface NavbarProps {
  currentPath?: string
}
