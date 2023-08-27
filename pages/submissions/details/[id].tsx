import router, { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CulinaryTip, Recipe, Status } from '../types/submission'
import { capitalize } from 'lodash'
import ReactPlayer from 'react-player'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
    RecipeGuideSection,
    RecipeInfoCard,
} from '@/components/submissions/RecipeLayout'
import ReviewModal from '@/components/submissions/ReviewModal'
import useS3Url from '@/common/hooks/useS3Url'
import Image from 'next/image'
import { useUpdateSubmission } from '../services/submissions.service'
import toast from 'react-hot-toast'

const SubmissionDetails = () => {
    const { query, isReady } = useRouter()

    const [content, setContent] = useState<Recipe | CulinaryTip>(null)
    const [videoUrl, setVideoUrl] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)

    const { getDownloadUrl } = useS3Url()
    const { updateSubmission } = useUpdateSubmission()

    const handleGetVideoUrl = async (): Promise<void> => {
        if (content?.video == null) {
            return
        }

        try {
            const url = await getDownloadUrl(content.video)
            if (url === '') {
                throw new Error()
            }
            setVideoUrl(url)
        } catch {
            toast.error('Cannot load video from cloud store')
        }
    }

    useEffect(() => {
        if (content == null) {
            return
        }

        handleGetVideoUrl()
    }, [content])

    useEffect(() => {
        if (!isReady || query.content == null) {
            return
        }

        // Get encoded content from query
        const newContent = JSON.parse(query.content as string)
        setContent(newContent)
    }, [isReady])

    const pageTitle = useMemo(() => {
        if (content == null) {
            return ''
        }

        if (
            content.status.toString() === Status[Status.Pending] ||
            content.status.toString() === Status[Status.Reported]
        ) {
            return content.status.toString() + ' submissions'
        }

        return 'History'
    }, [content])

    const handleViewSubmissions = () => {
        router.back()
    }

    const handleOpenReviewModal = () => {
        setReviewOpen(true)
    }

    const handleCloseReviewModal = () => {
        setReviewOpen(false)
    }

    const handleSubmitReview = async (status: Status, message?: string) => {
        await toast.promise(updateSubmission(content, status, message), {
            loading: 'Submitting your review',
            success: <b>Review saved</b>,
            error: <b>Review failed. Please try again later</b>,
        })

        handleViewSubmissions()
    }

    const isRecipe = useCallback(
        (content: Recipe | CulinaryTip): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    if (!isReady || content == null) {
        return null
    }

    return (
        <div className="mx-32 mt-8">
            <div
                className="flex items-center justify-start text-cinfo cursor-pointer hover:underline"
                onClick={handleViewSubmissions}
            >
                <ArrowBackIcon className="mr-2" />
                <h1 className="text-2xl">{pageTitle}</h1>
            </div>

            <div className="mt-16 flex items-center justify-center">
                <ReactPlayer
                    className="w-auto h-auto aspect-auto"
                    url={videoUrl}
                    controls={true}
                />
            </div>
            <div>
                <div className="mr-8 grid-cols-1">
                    {/* Content info */}
                    <div className="mt-16">
                        <div>
                            <h2 className="text-4xl">Title: {content.title}</h2>
                        </div>
                        <div className="mt-4 w-3/5">
                            <h2 className="text-2xl">Description</h2>
                            <h3 className="text-lg font-light">
                                {content.description ||
                                    'Someone forgot to write description 🥹'}
                            </h3>
                        </div>
                        <div className="my-8">
                            {isRecipe(content) && (
                                <RecipeInfoCard content={content} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isRecipe(content) && <RecipeGuideSection content={content} />}
            <div className="flex items-center justify-center mt-8 mb-16">
                <button
                    type="button"
                    className="px-4 py-2 bg-cprimary-300 hover:bg-cprimary-400 text-white rounded-lg"
                    onClick={handleOpenReviewModal}
                >
                    Submit review
                </button>
            </div>
            <ReviewModal
                isOpen={reviewOpen}
                currentStatus={content.status}
                handleSubmit={handleSubmitReview}
                handleClose={handleCloseReviewModal}
            />
        </div>
    )
}

export default SubmissionDetails
