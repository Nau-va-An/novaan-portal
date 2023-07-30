import React, { ReactElement } from 'react'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import { colors } from '@mui/material'

interface EmptyContentProps {
    label: string
}

const EmptyContent = ({
    label,
}: EmptyContentProps): ReactElement<EmptyContentProps> => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col">
                <div className="text-6xl flex items-center justify-center">
                    <InventoryOutlinedIcon
                        fontSize="inherit"
                        htmlColor={colors.grey[500]}
                    />
                </div>
                <div className="text-base font-normal text-gray-500 mt-4">
                    {label}
                </div>
            </div>
        </div>
    )
}

export default EmptyContent
