import {
    CulinaryTip,
    Recipe,
    Status,
    SubmissionType,
} from '@/pages/submissions/types/submission'
import { responseObjectValid, useFetch } from '@/common/baseApi'
import { useCallback, useEffect, useState } from 'react'
import useSwr from 'swr'
import { ReportedContent } from './submission.type'
import { Undefinable } from '@/common/types/types'
import { PostComment } from '@/pages/reported/types/dto'

export interface SubmissionsResponse {
    recipes: Recipe[]
    culinaryTips: CulinaryTip[]
}

interface UpdateSubmissionRequest {
    postId: string
    status: Status
    adminComment: string
}

interface GetPostDetailsPayload {
    id: string
    postType: SubmissionType
}

export const useFetchSubmissions = () => {
    const { getReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [tips, setTips] = useState<CulinaryTip[]>([])

    const fetchContent = useCallback(
        async (status: string) => {
            const query =
                status === 'history'
                    ? 'status=approved&status=rejected'
                    : `status=${status}`
            const submissions = await getReq(`admin/submissions?${query}`)
            if (submissions == null) {
                return
            }

            const { recipes, culinaryTips } = submissions
            setRecipes(recipes)
            setTips(culinaryTips)
        },
        [getReq]
    )

    return { recipes, tips, fetchContent }
}

export const useUpdateSubmission = () => {
    const { putReq, deleteReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const isRecipe = useCallback(
        (content: Recipe | CulinaryTip): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    const updateSubmission = useCallback(
        async (
            content: Recipe | CulinaryTip,
            status: Status,
            message?: string
        ): Promise<void> => {
            if (Status[status] === Status[Status.Rejected] && message == null) {
                return
            }

            const contentType = isRecipe(content)
                ? SubmissionType.Recipe.toString()
                : SubmissionType.CulinaryTip.toString()
            await putReq<UpdateSubmissionRequest>(
                `admin/status/${contentType}`,
                {
                    postId: content.id,
                    status,
                    adminComment: message,
                }
            )

            return Promise.resolve()
        },
        [putReq]
    )

    const dismissReport = useCallback(
        async (reportId: string) => {
            if (reportId === '') {
                return
            }
            await deleteReq(`admin/report/${reportId}`)
        },
        [deleteReq]
    )

    return { updateSubmission, dismissReport }
}

export const useReportedContent = () => {
    const { getReq } = useFetch({ authorizationRequired: true, timeout: 5000 })
    return useSwr<ReportedContent[]>('content/reported', getReq)
}

export const usePostDetails = () => {
    const { getReq } = useFetch({ authorizationRequired: true, timeout: 5000 })

    const getRecipeDetails = async (
        id: string
    ): Promise<Undefinable<Recipe>> => {
        const response = await getReq(`content/post/recipe/${id}`)
        if (!responseObjectValid(response)) {
            return undefined
        }

        return response
    }

    const getTipDetails = async (
        id: string
    ): Promise<Undefinable<CulinaryTip>> => {
        const response = await getReq(`content/post/tip/${id}`)
        if (!responseObjectValid(response)) {
            return undefined
        }

        return response
    }

    return { getRecipeDetails, getTipDetails }
}

export const useCommentDetails = () => {
    const { getReq } = useFetch({ authorizationRequired: true, timeout: 5000 })

    const getCommentDetails = async (
        postId: string,
        commentId: string
    ): Promise<Undefinable<PostComment>> => {
        const response = await getReq(`content/comments/${postId}/${commentId}`)
        if (!responseObjectValid(response)) {
            return undefined
        }

        return response
    }

    return { getCommentDetails }
}
