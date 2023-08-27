import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { TabValue } from '.'
import { ReportedContent } from '../submissions/services/submission.type'
import { PostComment } from './types/dto'
import useS3Url from '@/common/hooks/useS3Url'
import { useCommentDetails } from '../submissions/services/submissions.service'
import { toast } from 'react-hot-toast'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Image from 'next/image'

const ReportedCommentDetails = () => {
    const router = useRouter()

    const { getDownloadUrl } = useS3Url()
    const { getCommentDetails } = useCommentDetails()

    const [reportedContent, setReportedContent] = useState<ReportedContent>()
    const [comment, setComment] = useState<PostComment>()
    const [commentImg, setCommentImg] = useState('')

    const [reviewOpen, setReviewOpen] = useState(false)

    const handleGoBack = () => {
        router.back()
    }

    const loadCommentDetails = async (content: ReportedContent) => {
        try {
            const reportedComment = await getCommentDetails(
                content.postId,
                content.commentId
            )
            if (reportedComment == null) {
                throw new Error()
            }

            if (reportedComment.image != null && reportedComment.image !== '') {
                try {
                    const imageUrl = await getDownloadUrl(reportedComment.image)
                    setCommentImg(imageUrl)
                } catch {
                    toast.error('Failed to load comment image')
                }
            }

            setComment(reportedComment)
        } catch {
            toast.error('Failed to load reported comment')
            handleGoBack()
        }
    }

    useEffect(() => {
        if (router.query.content == null || router.query.contentType == null) {
            handleGoBack()
            return
        }

        const content: ReportedContent = JSON.parse(
            router.query.content as string
        )
        setReportedContent(content)
        loadCommentDetails(content)
    }, [router])

    const handleOpenReviewModal = () => {}

    if (!comment || !reportedContent) {
        return null
    }

    return (
        <div className="sm:mx-8 xl:mx-32 mt-8">
            <div
                className="flex items-center justify-start text-cinfo cursor-pointer hover:underline"
                onClick={handleGoBack}
            >
                <ArrowBackIcon className="mr-2" />
                <h1 className="text-2xl">Reports</h1>
            </div>
            <div className="mt-6 flex sm:flex-col xl:flex-row w-full">
                <div className="sm:w-full xl:w-1/3">
                    <div className="text-xl font-semibold">
                        1. Report details
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="col-span-1">User Id</div>
                        <div className="col-span-1 whitespace-normal break-words">
                            {reportedContent.userId}
                        </div>
                        <div className="col-span-1">Username</div>
                        <div className="col-span-1 whitespace-normal break-words">
                            {reportedContent.username}
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="text-xl">2. Report reason</div>
                        <div>{reportedContent.reason}</div>
                    </div>
                    <div className="flex mt-8 sm:hidden xl:block">
                        <button
                            type="button"
                            className="px-4 py-2 bg-cprimary-300 hover:bg-cprimary-400 text-white rounded-lg"
                            onClick={handleOpenReviewModal}
                        >
                            Submit review
                        </button>
                    </div>
                </div>
                <div className="sm:mt-8 xl:mt-0 sm:ml-0 xl:ml-8">
                    <h1 className="text-xl font-semibold">Reported comment:</h1>
                    <h2 className="text-lg">Text: {comment.comment}</h2>
                    <h2 className="text-lg mt-6">Image:</h2>
                    <Image
                        src={commentImg}
                        width={300}
                        height={300}
                        alt="comment image"
                    />
                </div>
            </div>
            <div className="justify-center items-center my-4 sm:flex xl:hidden">
                <button
                    type="button"
                    className="px-4 py-2 bg-cprimary-300 hover:bg-cprimary-400 text-white rounded-lg"
                    onClick={handleOpenReviewModal}
                >
                    Submit review
                </button>
            </div>
        </div>
    )
}

export default ReportedCommentDetails
