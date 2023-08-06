import { Nullable } from '@/common/types/types'

export interface ReportedContent {
    id: string
    postId: string
    commentId: Nullable<string>
    userId: string
    username: string
    reason: string
    postType: 'Recipe' | 'CulinaryTip'
}
