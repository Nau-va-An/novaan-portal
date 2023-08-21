import {
    COMMENT_TITLE,
    EMPTY_REPORT,
    RECIPE_TITLE,
    TIPS_TITLE,
} from '@/common/strings'
import { content, customColors } from '@/tailwind.config'
import {
    Box,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    colors,
} from '@mui/material'
import { capitalize } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import style from 'styled-jsx/style'
import { useReportedContent } from '../submissions/services/submissions.service'
import EmptyContent from '@/components/submissions/EmptyContent'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { ReportedContent } from '../submissions/services/submission.type'
import { useRouter } from 'next/router'

export type TabValue = 'Recipe' | 'CulinaryTip' | 'Comments'

interface TabsInfoItem {
    label: string
    value: TabValue
}

const TabsInfo: TabsInfoItem[] = [
    { label: 'Recipe', value: 'Recipe' },
    { label: 'Culinary Tips', value: 'CulinaryTip' },
    { label: 'Comments', value: 'Comments' },
]

const ReportedSubmissionView = () => {
    const router = useRouter()

    const [currentTab, setCurrentTab] = useState<TabValue>('Recipe')

    const { data } = useReportedContent()

    const recipeContent = useMemo(() => {
        if (data == null) {
            return []
        }
        return data.filter(
            (content) => content.postType === 'Recipe' && !content.commentId
        )
    }, [data])

    const tipsContent = useMemo(() => {
        if (data == null) {
            return []
        }
        return data.filter(
            (content) =>
                content.postType === 'CulinaryTip' && !content.commentId
        )
    }, [data])

    const commentContent = useMemo(() => {
        if (data == null) {
            return []
        }
        return data.filter(
            (content) => content.commentId != null && content.commentId !== ''
        )
    }, [data])

    const [currentContent, setCurrentContent] =
        useState<ReportedContent[]>(recipeContent)

    useEffect(() => {
        if (currentTab === 'Recipe') {
            setCurrentContent(recipeContent)
            return
        }

        if (currentTab === 'CulinaryTip') {
            setCurrentContent(tipsContent)
            return
        }

        setCurrentContent(commentContent)
    }, [currentTab, recipeContent, tipsContent, commentContent])

    const handleChangeTab = (_: React.SyntheticEvent, newValue: any) => {
        setCurrentTab(newValue)
    }

    const handleViewDetails = (content: ReportedContent) => {
        // Push data to with router to show details

        const payload = JSON.stringify(content)
        if (content.commentId == null || content.commentId === '') {
            router.push(
                {
                    pathname: '/reported/details',
                    query: {
                        contentType: currentTab,
                        content: payload,
                    },
                },
                '/reported/post/details'
            )
        } else {
            router.push(
                {
                    pathname: '/reported/comment',
                    query: {
                        contentType: currentTab,
                        content: payload,
                    },
                },
                '/reported/comment/details'
            )
        }
    }

    return (
        <div className="mx-16 mt-8">
            <h1 className="text-4xl">Reported</h1>
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
            {currentContent && currentContent.length > 0 ? (
                <TableContainer component={Paper} className="mx-auto mt-2">
                    <Table size="small" stickyHeader className="table-fixed">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" rowSpan={2}>
                                    No.
                                </TableCell>
                                <TableCell align="center" rowSpan={2}>
                                    Type
                                </TableCell>
                                <TableCell align="center" colSpan={2}>
                                    From
                                </TableCell>
                                <TableCell align="center" rowSpan={2}>
                                    Reason
                                </TableCell>
                                <TableCell align="center" rowSpan={2}>
                                    Actions
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    className="w-12 text-ellipsis whitespace-nowrap"
                                    align="center"
                                >
                                    User Id
                                </TableCell>
                                <TableCell
                                    className="w-12 text-ellipsis whitespace-nowrap"
                                    align="center"
                                >
                                    Username
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentContent.map((content, index) => {
                                const contentType =
                                    content.commentId == null
                                        ? content.postType
                                        : 'Comment'
                                return (
                                    <TableRow key={content.id}>
                                        <TableCell align="center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell align="center">
                                            {contentType}
                                        </TableCell>
                                        <TableCell align="left">
                                            {content.userId}
                                        </TableCell>
                                        <TableCell align="left">
                                            {content.username}
                                        </TableCell>
                                        <TableCell className="whitespace-normal break-words">
                                            {content.reason}
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
            ) : (
                <div className="mt-4">
                    <EmptyContent label={EMPTY_REPORT}>
                        <FlagOutlinedIcon
                            fontSize="inherit"
                            htmlColor={colors.grey[500]}
                        />
                    </EmptyContent>
                </div>
            )}
        </div>
    )
}

export default ReportedSubmissionView
