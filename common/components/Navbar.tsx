import { Status } from '@/pages/submissions/types/submission'
import {
    AppBar,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material'
import { useRouter } from 'next/router'

interface NavbarItem {
    label: string
    query: string[]
    mask: string
}

const NavbarItem = (props: NavbarItem) => {
    const router = useRouter()

    const handleRedirect = () => {
        router.push(
            {
                pathname: '/submissions/[status]',
                query: { status: props.query },
            },
            props.mask,
            { shallow: true }
        )
    }

    return (
        <div
            className="px-4 py-2 mx-2 h-full cursor-pointer"
            onClick={handleRedirect}
        >
            <Typography align="center">{props.label}</Typography>
        </div>
    )
}

const Navbar = () => {
    const navbarItems: NavbarItem[] = [
        {
            label: 'Pending',
            query: ['pending'],
            mask: '/submissions/pending',
        },
        {
            label: 'History',
            query: ['approved', 'rejected'],
            mask: '/submissions/history',
        },
        {
            label: 'Reported',
            query: ['reported'],
            mask: '/submissions/reported',
        },
    ]
    return (
        <AppBar position="static">
            <div className="flex items-center justify-start text-white bg-cprimary-300 px-8">
                <div className="flex ml-6">
                    {navbarItems.map((item) => (
                        <NavbarItem key={item.label} {...item} />
                    ))}
                </div>
            </div>
        </AppBar>
    )
}

export default Navbar
