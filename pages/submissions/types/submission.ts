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

export interface PostBase {
    id: string
    creatorId: string
    title: string
    description: string
    difficulty: Difficulty
    video: string
    createdAt: string
    updatedAt: string
    status: Status
}

export interface Recipe extends PostBase {
    difficulty: Difficulty
    portionQuantity: number
    portionType: PortionType
    prepTime: string
    cookTime: string
    instructions: Instruction[]
    ingredients: Ingredient[]
}

export interface CulinaryTip extends PostBase {}

export enum SubmissionType {
    Recipe = 'Recipe',
    CulinaryTip = 'CulinaryTip',
}
