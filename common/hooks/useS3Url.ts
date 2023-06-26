import { useCallback } from 'react'
import { useFetch } from '../baseApi'

const useS3Url = () => {
    const { getReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const getDownloadUrl = useCallback(
        async (fileId: string) => {
            try {
                const downloadUrl = (await getReq(
                    `content/download/${fileId}`
                )) as { url: string }

                if (downloadUrl == null || downloadUrl.url == null) {
                    console.log('Submission comeback as null')
                    return ''
                }

                return downloadUrl.url
            } catch {
                // Return 404 image
                return ''
            }
        },
        [getReq]
    )

    return { getDownloadUrl }
}

export default useS3Url
