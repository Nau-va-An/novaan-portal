import {
    CulinaryTips,
    Recipe,
    Status,
    SubmissionType,
} from '@/pages/submissions/types/submission'
import { useFetch } from '@/common/baseApi'
import { useCallback, useEffect, useState } from 'react'

export interface SubmissionsResponse {
    recipes: Recipe[]
    culinaryTips: CulinaryTips[]
}

interface UpdateSubmissionRequest {
    postId: string
    status: Status
    adminComment: string
}

export const useFetchSubmissions = () => {
    const { getReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [tips, setTips] = useState<CulinaryTips[]>([])

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
    const { putReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const isRecipe = useCallback(
        (content: Recipe | CulinaryTips): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    const updateSubmission = useCallback(
        async (
            content: Recipe | CulinaryTips,
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

    return { updateSubmission }
}
