import { useRouter } from 'next/router'
import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { CulinaryTips, Recipe } from '../types/submission'
import { capitalize } from 'lodash'
import ReactPlayer from 'react-player'
import Image from 'next/image'
import moment, { duration } from 'moment'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const SubmissionDetails = () => {
    const router = useRouter()

    const [content, setContent] = useState<Recipe | CulinaryTips>(null)
    useEffect(() => {
        if (router.query.content == null) {
            return
        }

        // Get encoded content from query
        const content = JSON.parse(router.query.content as string)
        setContent(content)
    }, [router])

    const handleViewSubmissions = () => {
        router.back()
    }

    const isRecipe = useCallback(
        (content: Recipe | CulinaryTips): content is Recipe => {
            return 'ingredients' in content
        },
        []
    )

    const renderRecipeBasicInfo = (content: Recipe) => {
        const timeSpanToString = (timespan: string): string => {
            const duration = moment.duration(timespan)

            let result = ''
            if (duration.days() !== 0) {
                result += duration.days() + ' days '
            }
            if (duration.minutes() !== 0) {
                result += duration.minutes() + ' minutes '
            }
            if (duration.seconds() !== 0) {
                result += duration.seconds() + ' seconds'
            }

            return result.trim()
        }

        const prepTimeString = timeSpanToString(content.prepTime)
        const cookTimeString = timeSpanToString(content.cookTime)
        return (
            <div className="grid grid-cols-4 px-4 py-4 rounded-lg bg-cprimary-300 text-white">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-xl">Difficulty</h2>
                    <p>{content.difficulty}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-xl">Portions</h2>
                    <p>
                        {content.portionQuantity} {content.portionType}
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-xl">Prep time</h2>
                    <p>{prepTimeString}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-xl">Cook time</h2>
                    <p>{cookTimeString}</p>
                </div>
            </div>
        )
    }

    const renderRecipeInfo = (content: Recipe) => (
        <div className="grid grid-cols-3">
            <div className="col-span-1">
                <div className="text-2xl">Ingredients</div>
                <div className="grid grid-cols-3 mt-4">
                    {content.ingredients.map((ingredient, index) => (
                        <Fragment key={index}>
                            <div className="col-span-1 mb-2">
                                {ingredient.amount} {ingredient.unit}
                            </div>
                            <div className="col-span-2 mb-2">
                                {ingredient.name}
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
            <div className="col-span-2">
                <div className="text-2xl">Instructions</div>
                <div className="mt-4">
                    {content.instructions.map((instruction) => {
                        const instructionCount = content.instructions.length
                        return (
                            <div key={instruction.step} className="mb-8">
                                <div className="text-xl">
                                    Step {instruction.step}/{instructionCount}
                                </div>
                                <div className="mt-2">
                                    <Image
                                        src={
                                            'https://m.media-amazon.com/images/I/616U8Co1ASL.jpg'
                                        }
                                        width={1000}
                                        height={1000}
                                        style={{ objectFit: 'contain' }}
                                        alt={`step ${instruction.step} illustration`}
                                    />
                                </div>
                                <p className="text-lg mt-2">
                                    {instruction.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
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
                    className="w-auto h-full aspect-auto"
                    url={
                        'https://assets.mixkit.co/videos/preview/mixkit-little-girl-next-to-baskets-of-easter-eggs-48596-large.mp4'
                    }
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
                            {isRecipe(content) &&
                                renderRecipeBasicInfo(content)}
                        </div>
                    </div>
                </div>
            </div>
            {isRecipe(content) && renderRecipeInfo(content)}
        </div>
    )
}

export default SubmissionDetails
