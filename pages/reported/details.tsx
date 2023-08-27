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
    const router = useRouter()

    const { getRecipeDetails, getTipDetails } = usePostDetails()
    const { getDownloadUrl } = useS3Url()
    const { updateSubmission, dismissReport } = useUpdateSubmission()

    const [reportedContent, setReportedContent] = useState<ReportedContent>()
    const [reportedContentType, setReportedContentType] = useState<TabValue>()

    const [post, setPost] = useState<Recipe | CulinaryTip>()
    const [videoUrl, setVideoUrl] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)

    useEffect(() => {
        if (router.query.content == null || router.query.contentType == null) {
            handleGoBack()
            return
        }

        const contentType: TabValue =
            (router.query.contentType as TabValue) ?? 'Recipe'
        const content: ReportedContent = JSON.parse(
            router.query.content as string
        )

        setReportedContent(content)
        setReportedContentType(contentType)

        fetchPostDetails(content, contentType)
    }, [router])

    const fetchPostDetails = async (
        content: ReportedContent,
        contentType: TabValue
    ): Promise<void> => {
        console.log(contentType, 'content type')
        try {
            let postDetail: Recipe | CulinaryTip
            if (contentType === 'Recipe') {
                postDetail = await getRecipeDetails(content.postId)
            }

            if (contentType === 'CulinaryTip') {
                postDetail = await getTipDetails(content.postId)
            }

            if (postDetail?.video == null) {
                return
            }

            try {
                const url = await getDownloadUrl(postDetail.video)
                if (url == '') {
                    throw new Error()
                }
                setVideoUrl(url)
                setPost(postDetail)
            } catch {
                toast.error('Cannot load video from cloud store')
            }
        } catch {
            toast.error('Failed to load selected post')
            router.back()
        }
    }

    const handleGoBack = () => {
        router.back()
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
        await toast.promise(updateSubmission(post, status, message), {
            loading: 'Submitting your review',
            success: <b>Review saved</b>,
            error: <b>Review failed. Please try again later</b>,
        })

        try {
            await dismissReport(reportedContent.id)
        } catch {
            toast.error('There are errors when trying to dismiss report')
        }
        router.back()
    }

    if (post == null) {
        return null
    }

    console.log(videoUrl)

    return (
        <div className="lg:mx-32 sm:mx-8 mt-8">
            <div
                className="flex items-center justify-start text-cinfo cursor-pointer hover:underline"
                onClick={handleGoBack}
            >
                <ArrowBackIcon className="mr-2" />
                <h1 className="text-2xl">Reports</h1>
            </div>
            <div className="mt-6">
                <div className="text-xl font-normal">1. Report details</div>
                <div className="grid grid-cols-2 sm:w-full xl:w-1/5">
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
                    onError={console.log}
                />
            </div>
            <div>
                <div className="mr-8 grid-cols-1">
                    {/* Content info */}
                    <div className="mt-16">
                        <div>
                            <h2 className="text-4xl">Title: {post.title}</h2>
                        </div>
                        <div className="mt-4 w-3/5">
                            <h2 className="text-2xl">Description</h2>
                            <h3 className="text-lg font-light">
                                {post.description ||
                                    'Someone forgot to write description 🥹'}
                            </h3>
                        </div>
                        <div className="my-8">
                            {isRecipe(post) && (
                                <RecipeInfoCard content={post} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isRecipe(post) && <RecipeGuideSection content={post} />}
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
                currentStatus={post.status}
                allowPending={false}
                allowDuplicate={true}
                handleSubmit={handleSubmitReview}
                handleClose={handleCloseReviewModal}
            />
        </div>
    )
}

export default ReportDetails
