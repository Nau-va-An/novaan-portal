import {
    RecipeInfoCard,
    RecipeGuideSection,
} from '@/components/submissions/RecipeLayout'
import ReviewModal from '@/components/submissions/ReviewModal'
import { content } from '@/tailwind.config'
import { capitalize } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { Recipe, CulinaryTip, Status } from '../submissions/types/submission'
import {
    usePostDetails,
    useUpdateSubmission,
} from '../submissions/services/submissions.service'
import { useRouter } from 'next/router'
import { TabValue } from '.'
import { ReportedContent } from '../submissions/services/submission.type'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import useS3Url from '@/common/hooks/useS3Url'
import toast from 'react-hot-toast'

const ReportDetails = () => {
    const { isReady, query, back } = useRouter()

    const { getRecipeDetails, getTipDetails } = usePostDetails()
    const { getDownloadUrl } = useS3Url()
    const { updateSubmission } = useUpdateSubmission()

    const [reportedContent, setReportedContent] = useState<ReportedContent>()
    const [reportedContentType, setReportedContentType] = useState<TabValue>()

    const [postDetails, setPostDetails] = useState<Recipe | CulinaryTip>()
    const [videoUrl, setVideoUrl] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)

    useEffect(() => {
        if (!isReady) {
            return
        }

        if (query.content == null || query.contentType == null) {
            handleGoBack()
            return
        }

        const contentType: TabValue = query.contentType as TabValue
        const content: ReportedContent = JSON.parse(query.content as string)

        setReportedContent(content)
        setReportedContentType(contentType)
    }, [isReady])

    const fetchPostDetails = async (): Promise<void> => {
        let postDetail: Recipe | CulinaryTip
        if (reportedContentType === 'Recipe') {
            postDetail = await getRecipeDetails(reportedContent.postId)
        }

        if (reportedContentType === 'CulinaryTip') {
            postDetail = await getTipDetails(reportedContent.postId)
        }

        setPostDetails(postDetail)

        if (postDetails?.video == null) {
            return
        }

        const url = await getDownloadUrl(postDetails.video)
        if (url == '') {
            toast.error('Failed to load video from S3')
            return
        }
        setVideoUrl(url)
    }

    useEffect(() => {
        if (!reportedContent || !reportedContentType) {
            return
        }
        fetchPostDetails().catch(() => {
            toast.error('Failed to load selected post')
            back()
        })
    }, [reportedContent, reportedContentType])

    const handleGoBack = () => {
        back()
    }

    const isRecipe = useCallback(
        (content: Recipe | CulinaryTip): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    const handleOpenReviewModal = () => {
        setReviewOpen(true)
    }

    const handleCloseReviewModal = () => {
        setReviewOpen(false)
    }

    const handleSubmitReview = async (status: Status, message?: string) => {
        await toast.promise(updateSubmission(postDetails, status, message), {
            loading: 'Submitting your review',
            success: <b>Review saved</b>,
            error: <b>Review failed. Please try again later</b>,
        })

        back()
    }

    if (postDetails == null) {
        return null
    }

    return (
        <div className="mx-32 mt-8">
            <div
                className="flex items-center justify-start text-cinfo cursor-pointer hover:underline"
                onClick={handleGoBack}
            >
                <ArrowBackIcon className="mr-2" />
                <h1 className="text-2xl">Reports</h1>
            </div>
            <div className="mt-6">
                <div className="text-xl font-normal">1. Report details</div>
                <div className="grid grid-cols-2 w-1/5">
                    <div className="col-span-1">User Id</div>
                    <div className="col-span-1">{reportedContent.userId}</div>
                    <div className="col-span-1">Username</div>
                    <div className="col-span-1">{reportedContent.username}</div>
                </div>
                <div className="mt-6">
                    <div className="text-xl">2. Reason</div>
                    <div>{reportedContent.reason}</div>
                </div>
                <div className="mt-6">
                    <div className="text-xl">3. Post details</div>
                </div>
            </div>

            <div className="flex items-center justify-center">
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
                            <h2 className="text-4xl">
                                Title: {postDetails.title}
                            </h2>
                        </div>
                        <div className="mt-4 w-3/5">
                            <h2 className="text-2xl">Description</h2>
                            <h3 className="text-lg font-light">
                                {postDetails.description ||
                                    'Someone forgot to write description 🥹'}
                            </h3>
                        </div>
                        <div className="my-8">
                            {isRecipe(postDetails) && (
                                <RecipeInfoCard content={postDetails} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isRecipe(postDetails) && (
                <RecipeGuideSection content={postDetails} />
            )}
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
                currentStatus={postDetails.status}
                handleSubmit={handleSubmitReview}
                handleClose={handleCloseReviewModal}
            />
        </div>
    )
}

export default ReportDetails
