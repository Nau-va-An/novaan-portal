import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
    CulinaryTips,
    Recipe,
    Status,
    SubmissionType,
} from './types/submission'
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
    Tabs,
    Tab,
    Box,
} from '@mui/material'
import { customColors } from '@/tailwind.config'
import { RECIPE_TITLE, TIPS_TITLE } from '@/common/strings'

const TabsInfo: {
    label: string
    value: SubmissionType
}[] = [
    { label: RECIPE_TITLE, value: SubmissionType.Recipe },
    { label: TIPS_TITLE, value: SubmissionType.CulinaryTip },
]

const SubmissionsView = () => {
    const router = useRouter()

    const [status, setStatus] = useState<string>()
    const [content, setContent] = useState<(Recipe | CulinaryTips)[]>()
    const [currentTab, setCurrentTab] = useState(SubmissionType.Recipe)

    const { recipes, tips, fetchContent } = useFetchSubmissions()

    const resetState = () => {
        setContent([])
        setCurrentTab(SubmissionType.Recipe)
    }

    useEffect(() => {
        const currentStatus = router.query.status as string
        resetState()
        if (currentStatus == null || currentStatus.length === 0) {
            return
        }
        setStatus(currentStatus)
    }, [router.query.status])

    useEffect(() => {
        if (status == null || status.length === 0) {
            return
        }
        fetchContent(status)
    }, [status])

    useEffect(() => {
        if (recipes == null || recipes.length === 0) {
            return
        }
        setContent(recipes)
    }, [recipes, tips])

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

    const handleChangeTab = (_: React.SyntheticEvent, newValue: any) => {
        setCurrentTab(newValue)
        newValue === SubmissionType.Recipe
            ? setContent(recipes || [])
            : setContent(tips || [])
    }

    return (
        <div className="mx-16 mt-8">
            <h1 className="text-4xl">{capitalize(status)} submissions</h1>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    className="mt-8"
                    value={currentTab}
                    onChange={handleChangeTab}
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: customColors.cprimary['300'],
                        },
                    }}
                >
                    {TabsInfo.map(({ label, value }) => (
                        <Tab key={label} label={label} value={value} />
                    ))}
                </Tabs>
            </Box>
            <TableContainer component={Paper} className="mx-auto mt-2">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">No.</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">
                                <div className="text-ellipsis whitespace-nowrap">
                                    Created at
                                </div>
                            </TableCell>
                            <TableCell align="center">
                                <div className="text-ellipsis whitespace-nowrap">
                                    Updated at
                                </div>
                            </TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {content &&
                            content.map((content, index) => {
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
                                            <div className="text-ellipsis whitespace-nowrap">
                                                {isRecipe
                                                    ? RECIPE_TITLE
                                                    : TIPS_TITLE}
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            TBD
                                        </TableCell>
                                        <TableCell align="center">
                                            TBD
                                        </TableCell>
                                        <TableCell align="center">
                                            {content.status}
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="text-ellipsis whitespace-nowrap">
                                                <a
                                                    className="text-cinfo cursor-pointer hover:underline"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            content
                                                        )
                                                    }
                                                >
                                                    View details
                                                </a>
                                            </div>
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
