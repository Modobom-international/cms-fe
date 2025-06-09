export type IApiKey = {
    id: number
    name: string
    key_prefix: string
    last_used_at: string | null
    expires_at: string
    is_active: boolean
    created_at: string
}

export interface IGetApiKeysResponse {
    success: true
    data: IApiKey[]
    message: string
    type: string
}