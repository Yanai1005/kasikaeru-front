export interface LendingRecord {
    id: number;
    lent_id: string;
    object_id: number;
    discord_id: string;
    lent_state: number;
    lent_date: string;
    user_name: string;
    object_name: string;
    code_value: string;
    category_name: string;
}

export interface AppEnvironment {
    API_URL: string;
}
