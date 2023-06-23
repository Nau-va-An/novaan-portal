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

    const [requested, setRequested] = useState(false)
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [tips, setTips] = useState<CulinaryTips[]>([])

    const fetchContent = async () => {
        if (requested) {
            return
        }
        const submissions = await getReq(`admin/submissions/?status=${status}`)
        if (submissions == null) {
            console.log('Submission comeback as null')
            return
        }

        const { recipes, culinaryTips } = submissions
        setRecipes(recipes)
        setTips(culinaryTips)
        setRequested(true)
    }

    return { recipes, tips, fetchContent }
}
