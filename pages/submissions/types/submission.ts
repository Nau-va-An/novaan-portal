export enum Difficulty {
    Easy = 0,
    Medium = 1,
    Hard = 2,
}

export enum PortionType {
    Servings = 0,
    Pieces = 1,
}

export enum Status {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Reported = 3,
}

export interface Instruction {
    step: number
    description: string
    image: string
}

export interface Ingredient {
    name: string
    amount: number
    unit: string
}

export interface Recipe {
    id: string
    creatorId: string
    title: string
    description: string
    difficulty: Difficulty
    video: string
    portionQuantity: number
    portionType: PortionType
    prepTime: string
    cookTime: string
    instructions: Instruction[]
    ingredients: Ingredient[]
    status: Status
    createdAt: Date
    updatedAt: Date
}

export interface CulinaryTips {
    id: string
    creatorId: string
    title: string
    description: string
    video: string
    status: Status
    createdAt: Date
    updatedAt: Date
}

export enum SubmissionType {
    Recipe = 'Recipe',
    CulinaryTip = 'CulinaryTip',
}
