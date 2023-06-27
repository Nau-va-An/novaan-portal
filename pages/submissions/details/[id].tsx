import { useRouter } from 'next/router'
import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { CulinaryTips, Recipe, Status } from '../types/submission'
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
import toast, { Toaster } from 'react-hot-toast'

const SubmissionDetails = () => {
    const router = useRouter()

    const [content, setContent] = useState<Recipe | CulinaryTips>(null)
    const [videoUrl, setVideoUrl] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)
    const [availableStatus, setAvailableStatus] = useState<Status[]>(null)

    const { getDownloadUrl } = useS3Url()
    const { updateSubmission } = useUpdateSubmission()

    useEffect(() => {
        if (content?.video == null) {
            return
        }
        getDownloadUrl(content.video).then((url) => {
            setVideoUrl(url)
            console.log(url)
        })
    }, [content])

    useEffect(() => {
        if (router.query.content == null) {
            return
        }

        // Get encoded content from query
        const content = JSON.parse(router.query.content as string)
        setContent(content)
    }, [router])

    useEffect(() => {
        if (content == null) {
            return
        }

        if ((Status[content.status] as any) === Status.Pending.valueOf()) {
            setAvailableStatus([Status.Approved, Status.Rejected])
        } else {
            setAvailableStatus([
                Status.Pending,
                Status.Approved,
                Status.Rejected,
            ])
        }
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
        (content: Recipe | CulinaryTips): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    if (content == null) {
        return null
    }

    return (
        <div className="mx-32 mt-8">
            <div
                className="flex items-center justify-start text-cinfo cursor-pointer hover:underline"
                onClick={handleViewSubmissions}
            >
                <ArrowBackIcon className="mr-2" />
                <h1 className="text-2xl">
                    {capitalize(content.status.toString())} submissions
                </h1>
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
                availableStatus={availableStatus}
                currentStatus={content.status}
                handleSubmit={handleSubmitReview}
                handleClose={handleCloseReviewModal}
            />
        </div>
    )
}

export default SubmissionDetails
