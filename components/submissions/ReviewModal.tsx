import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { capitalize } from 'lodash'
import toast from 'react-hot-toast'

import { Status } from '@/pages/submissions/types/submission'
import {
    COMMON_EMPTY_FIELD_NOT_ALLOWED,
    REVIEW_MESSAGE_TOO_LONG,
    REVIEW_MESSAGE_TOO_SHORT,
} from '@/common/strings'

import { FormControlLabel, Modal, Radio, RadioGroup } from '@mui/material'
import ErrText from '../common/ErrText'

interface ReviewModalProps {
    isOpen: boolean
    currentStatus: Status
    handleClose: () => void
    handleSubmit: (status: Status, message?: string) => void
}

interface ReviewModalForm {
    message: string
}

const ReviewModal = ({
    isOpen,
    currentStatus,
    handleClose,
    handleSubmit,
}: ReviewModalProps) => {
    const [selectedStatus, setSelectedStatus] = useState<Status>(
        Status[currentStatus] as any
    )

    const availableStatus = useMemo(() => {
        if ((Status[currentStatus] as any) === Status.Pending) {
            setSelectedStatus(Status.Approved)
            return [Status.Approved, Status.Rejected]
        } else {
            return [Status.Pending, Status.Approved, Status.Rejected]
        }
    }, [currentStatus])

    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        resetField,
        setFocus,
        clearErrors,
    } = useForm<ReviewModalForm>({
        defaultValues: {
            message: '',
        },
        mode: 'all',
    })

    useEffect(() => {
        if (Status[selectedStatus] === Status[Status.Rejected]) {
            setFocus('message')
        }
    }, [selectedStatus])

    const resetState = () => {
        setSelectedStatus(currentStatus)
        resetField('message')
        clearErrors()
    }

    const handleChangeStatus = (_, value: string) => {
        if (Status[value].toString() === selectedStatus.toString()) {
            return
        }
        setSelectedStatus(Status[value])
    }

    const handleCloseReview = () => {
        resetState()
        handleClose()
    }

    const handleReviewSubmit = (data: ReviewModalForm) => {
        if ((Status[currentStatus] as any) === selectedStatus) {
            toast.error('Cannot use the same status')
            handleCloseReview()
            return
        }

        handleSubmit(selectedStatus, data.message)
        handleCloseReview()
    }

    return (
        <Modal open={isOpen} onClose={handleCloseReview} disableAutoFocus>
            <div className="relative w-full max-w-2xl mx-auto my-auto">
                <form onSubmit={handleFormSubmit(handleReviewSubmit)}>
                    <div className="relative bg-white rounded-lg shadow">
                        <div className="flex items-start justify-between p-4 border-b rounded-t border-gray-400">
                            <h3 className="text-xl font-semibold text-gray-900 ">
                                Submit your review
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                data-modal-hide="defaultModal"
                                onClick={handleCloseReview}
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="text-lg">Select your review</div>
                            <RadioGroup
                                onChange={handleChangeStatus}
                                value={Status[selectedStatus]}
                            >
                                {availableStatus.map((status) => {
                                    const statusStr = Status[status]
                                    const isCurrentStatus =
                                        (statusStr as any) === currentStatus
                                    return (
                                        <FormControlLabel
                                            key={statusStr}
                                            value={Status[status]}
                                            control={<Radio />}
                                            disabled={isCurrentStatus}
                                            label={capitalize(statusStr)}
                                        />
                                    )
                                })}
                            </RadioGroup>
                            {Status[selectedStatus] ===
                                Status[Status.Rejected] && (
                                <div className="mt-4">
                                    <div className="text-lg">
                                        Rejected message
                                    </div>
                                    <textarea
                                        {...register('message', {
                                            required: true,
                                            minLength: 30,
                                            maxLength: 500,
                                        })}
                                        id="message"
                                        rows={4}
                                        className="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                    <div className="mt-2">
                                        {errors.message?.type ===
                                            'required' && (
                                            <ErrText>
                                                {COMMON_EMPTY_FIELD_NOT_ALLOWED}
                                            </ErrText>
                                        )}
                                        {errors.message?.type ===
                                            'minLength' && (
                                            <ErrText>
                                                {REVIEW_MESSAGE_TOO_SHORT}
                                            </ErrText>
                                        )}
                                        {errors.message?.type ===
                                            'maxLength' && (
                                            <ErrText>
                                                {REVIEW_MESSAGE_TOO_LONG}
                                            </ErrText>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-400 rounded-lg">
                            <button
                                data-modal-hide="defaultModal"
                                type="button"
                                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                data-modal-hide="defaultModal"
                                type="submit"
                                className="text-white bg-cprimary-300 hover:bg-cprimary-400 focus:ring-4 focus:outline-none focus:ring-cprimary-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default ReviewModal
