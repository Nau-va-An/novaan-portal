import {
    CulinaryTips,
    Recipe,
    Status,
} from '@/pages/submissions/types/submission'
import { useFetch } from '@/common/baseApi'
import { useCallback, useEffect, useState } from 'react'

export interface SubmissionsResponse {
    recipes: Recipe[]
    culinaryTips: CulinaryTips[]
}

export const useFetchSubmissions = (status: string) => {
    const { getReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [tips, setTips] = useState<CulinaryTips[]>([])

    const fetchContent = useCallback(async () => {
        const query =
            status === 'history'
                ? 'status=approved&status=rejected'
                : `status=${status}`
        const submissions = await getReq(`admin/submissions?${query}`)
        if (submissions == null) {
            console.log('Submission comeback as null')
            return
        }

        const { recipes, culinaryTips } = submissions
        setRecipes(recipes)
        setTips(culinaryTips)
    }, [status, getReq])

    return { recipes, tips, fetchContent }
}
