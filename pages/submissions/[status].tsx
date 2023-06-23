import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CulinaryTips, Recipe, SubmissionType } from './types/submission'
import { useFetchSubmissions } from './services/submissions.service'
import { capitalize } from 'lodash'
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material'

const SubmissionsView = () => {
    const router = useRouter()

    const [status, setStatus] = useState<string>('pending')
    const { recipes, tips, fetchContent } = useFetchSubmissions(status)

    useEffect(() => {
        const status = router.query.status as string
        if (status == null) {
            return
        }
        setStatus(status)
        fetchContent()
    }, [router, recipes, tips, fetchContent])

    const handleViewDetails = (content: Recipe | CulinaryTips) => {
        // Push data to with router to show details
        const payload = JSON.stringify(content)
        router.push(
            {
                pathname: '/submissions/details/[id]',
                query: {
                    id: content.id,
                    content: payload,
                },
            },
            `submissions/details/${content.id}`
        )
    }

    return (
        <div className="mx-16 mt-8">
            <h1 className="text-4xl">{capitalize(status)} submissions</h1>
            <TableContainer component={Paper} className="mx-auto mt-8">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">No.</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Created at</TableCell>
                            <TableCell align="center">Updated at</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...recipes, ...tips].map((content, index) => {
                            const isRecipe = 'instructions' in content
                            return (
                                <TableRow key={content.id}>
                                    <TableCell align="center">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell align="left">
                                        {content.title}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {isRecipe
                                            ? SubmissionType.Recipe
                                            : SubmissionType.Tips}
                                    </TableCell>
                                    <TableCell align="center">TBD</TableCell>
                                    <TableCell align="center">TBD</TableCell>
                                    <TableCell align="center">
                                        <a
                                            className="text-cinfo cursor-pointer hover:underline"
                                            onClick={() =>
                                                handleViewDetails(content)
                                            }
                                        >
                                            View details
                                        </a>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default SubmissionsView
