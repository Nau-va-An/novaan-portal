import React, { ReactElement } from 'react'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import { SvgIconTypeMap, colors } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'

interface EmptyContentProps {
    label: string
    children: ReactElement
}

const EmptyContent = ({
    label,
    children,
}: EmptyContentProps): ReactElement<EmptyContentProps> => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col">
                <div className="text-6xl flex items-center justify-center">
                    {children}
                </div>
                <div className="text-base font-normal text-gray-500 mt-4">
                    {label}
                </div>
            </div>
        </div>
    )
}

export default EmptyContent
