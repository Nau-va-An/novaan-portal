import { Typography } from '@mui/material'
import { ReactElement } from 'react'

interface NavbarButtonProps {
    label: string
    onPress: () => void
}

const NavbarButton = ({
    label,
    onPress,
}: NavbarButtonProps): ReactElement<NavbarButtonProps> => {
    return (
        <div
            className="px-4 py-2 mx-2 h-full cursor-pointer hover:bg-cprimary-400"
            onClick={onPress}
        >
            <Typography align="center">{label}</Typography>
        </div>
    )
}

export default NavbarButton
