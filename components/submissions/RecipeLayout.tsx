import {
    Ingredient,
    Instruction,
    PortionType,
    Recipe,
} from '@/pages/submissions/types/submission'
import moment from 'moment'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import useS3Url from '@/common/hooks/useS3Url'
import { toast } from 'react-hot-toast'

interface RecipeLayoutProps {
    content: Recipe
}

interface IngredientsProps {
    ingredients: Ingredient[]
}

interface InstructionProps {
    instructions: Instruction[]
}

const getPortionType = (portionType: string | number): string => {
    if (isNaN(Number(portionType))) {
        return portionType as string
    }

    return PortionType[portionType]
}

export const RecipeInfoCard = ({ content }: RecipeLayoutProps) => {
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

    const prepTimeString = useMemo(
        () => timeSpanToString(content.prepTime),
        [content]
    )
    const cookTimeString = useMemo(
        () => timeSpanToString(content.cookTime),
        [content]
    )

    return (
        <div className="grid grid-cols-4 px-4 py-4 rounded-lg bg-cprimary-300 text-white">
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl">Difficulty</h2>
                <p>{content.difficulty}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl">Portions</h2>
                <p>
                    {content.portionQuantity}{' '}
                    {getPortionType(content.portionType)}
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

const RecipeIngredients = ({ ingredients }: IngredientsProps) => {
    return (
        <>
            <div className="text-2xl">Ingredients</div>
            <div className="grid grid-cols-3 mt-4">
                {ingredients.map((ingredient, index) => (
                    <Fragment key={index}>
                        <div className="col-span-1 mb-2">
                            {ingredient.amount} {ingredient.unit}
                        </div>
                        <div className="col-span-2 mb-2">{ingredient.name}</div>
                    </Fragment>
                ))}
            </div>
        </>
    )
}

const RecipeInstructions = ({ instructions }: InstructionProps) => {
    const { getDownloadUrl } = useS3Url()

    const [steps, setSteps] = useState<Instruction[]>()

    useEffect(() => {
        if (instructions == null || instructions.length === 0) {
            return
        }

        getAllImageUrl()
    }, [instructions])

    const getAllImageUrl = async () => {
        const newInstructions = await Promise.all(
            instructions.map(async (instruction) => {
                if (!instruction.image) {
                    return instruction
                }

                const downloadUrl = await getDownloadUrl(instruction.image)
                if (downloadUrl == '') {
                    toast.error(`Failed to load step ${instruction.step} image`)
                }
                return { ...instruction, image: downloadUrl }
            })
        )

        setSteps(newInstructions)
    }

    return (
        <>
            <div className="text-2xl">Instructions</div>
            <div className="mt-4">
                {steps &&
                    steps.map((step, index) => {
                        const instructionCount = instructions.length
                        return (
                            <div key={step.step} className="mb-8">
                                <div className="text-xl">
                                    Step {step?.step || index + 1}/
                                    {instructionCount}
                                </div>
                                {step.image && (
                                    <div className="mt-2">
                                        <Image
                                            src={step.image}
                                            width={300}
                                            height={300}
                                            style={{ objectFit: 'contain' }}
                                            alt={`step ${step.step} illustration`}
                                        />
                                    </div>
                                )}
                                <p className="text-lg mt-2">
                                    {step.description}
                                </p>
                            </div>
                        )
                    })}
            </div>
        </>
    )
}

export const RecipeGuideSection = (props: RecipeLayoutProps) => {
    return (
        <div className="grid grid-cols-3">
            <div className="col-span-1">
                <RecipeIngredients ingredients={props.content.ingredients} />
            </div>
            <div className="col-span-2">
                <RecipeInstructions instructions={props.content.instructions} />
            </div>
        </div>
    )
}
