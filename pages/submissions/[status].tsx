import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CulinaryTip, Recipe, SubmissionType } from './types/submission'
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
    colors,
} from '@mui/material'
import { customColors } from '@/tailwind.config'
import { EMPTY_HISTORY_RECIPE, EMPTY_HISTORY_TIPS } from '@/common/strings'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import EmptyContent from '@/components/submissions/EmptyContent'
import { TabStatus } from '@/components/common/navbar/Navbar'
import moment from 'moment'

const TabsInfo: {
    label: string
    value: SubmissionType
}[] = [
    { label: 'Recipe', value: SubmissionType.Recipe },
    { label: 'Culinary Tips', value: SubmissionType.CulinaryTip },
]

const SubmissionsView = () => {
    const router = useRouter()

    const [status, setStatus] = useState<TabStatus>()
    const [content, setContent] = useState<(Recipe | CulinaryTip)[]>()
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
        setStatus(currentStatus as TabStatus)
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

        setCurrentTab(SubmissionType.Recipe)
        setContent(recipes)
    }, [recipes, tips])

    const handleViewDetails = (content: Recipe | CulinaryTip) => {
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
                        <Tab
                            key={label}
                            label={label}
                            value={value}
                            className="normal-case"
                        />
                    ))}
                </Tabs>
            </Box>
            {content && content.length > 0 && (
                <TableContainer component={Paper} className="mx-auto mt-2">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">No.</TableCell>
                                <TableCell>Title</TableCell>
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
                            {content.map((content, index) => {
                                return (
                                    <TableRow key={content.id}>
                                        <TableCell align="center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell align="left">
                                            {content.title}
                                        </TableCell>
                                        <TableCell align="center">
                                            {moment(content.createdAt).format(
                                                'HH:mm DD-MMM-YYYY'
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {moment(content.updatedAt).format(
                                                'HH:mm DD-MMM-YYYY'
                                            )}
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
            )}
            {content && content.length <= 0 && (
                <div className="mt-16">
                    {status === 'pending' && (
                        <EmptyContent
                            label={
                                currentTab === SubmissionType.Recipe
                                    ? 'No recipe is pending for review at the moment'
                                    : 'No culinary tips is pending for review at the moment'
                            }
                        >
                            <InventoryOutlinedIcon
                                fontSize="inherit"
                                htmlColor={colors.grey[500]}
                            />
                        </EmptyContent>
                    )}
                    {status === 'history' && (
                        <EmptyContent
                            label={
                                currentTab === SubmissionType.Recipe
                                    ? EMPTY_HISTORY_RECIPE
                                    : EMPTY_HISTORY_TIPS
                            }
                        >
                            <HistoryOutlinedIcon
                                fontSize="inherit"
                                htmlColor={colors.grey[500]}
                            />
                        </EmptyContent>
                    )}
                </div>
            )}
        </div>
    )
}

export default SubmissionsView
