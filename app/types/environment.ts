export interface AppEnvironment {
    API_URL: string;
}

export interface LoaderData<T = unknown> {
    data?: T;
    error?: string;
}

export interface NavbarProps {
    currentPath?: string;
}
