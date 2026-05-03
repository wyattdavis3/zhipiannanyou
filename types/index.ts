export interface User {
  id: string
  email: string
  dailyLimit: number
  todayUsed: number
  lastUsedDate: string
}

export interface UserProfile {
  userId: string
  key: string
  value: string
  updatedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  imageUrl?: string
  loadingType?: 'normal' | 'image'
}

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data: T
}
