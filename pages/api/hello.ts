// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import BaseApi from './baseApi'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const apiClient = new BaseApi()

    if (req.method === 'GET') {
        const serverStatus = await apiClient.get('health')
        res.status(200).json({ serverStatus })
    }
}

export default handler
