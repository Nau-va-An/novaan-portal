import { useCallback } from 'react'
import { useFetch } from '../baseApi'

const useS3Url = () => {
    const { getReq } = useFetch({
        authorizationRequired: true,
        timeout: 10000,
    })

    const getDownloadUrl = async (fileId: string) => {
        const downloadUrl = (await getReq(`content/download/${fileId}`)) as {
            url: string
        }

        if (downloadUrl == null || downloadUrl.url == null) {
            return ''
        }

        return downloadUrl.url
    }

    return { getDownloadUrl }
}

export default useS3Url
