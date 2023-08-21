import { AppBar } from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import NavbarButton from './NavbarButton'
import NavbarRouteButton, { NavbarItem } from './NavbarRouteButton'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/common/constants'

export type TabStatus = 'pending' | 'history' | 'reported'

const Navbar = () => {
    const router = useRouter()

    const isAtSignIn = useMemo(
        () => router.pathname === '/auth/signin',
        [router]
    )

    const navbarItems: NavbarItem[] = useMemo(
        () => [
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
        ],
        []
    )

    const handleViewReported = (): void => {
        router.push('/reported')
    }

    const handleLogout = (): void => {
        // TODO: Send request to server to invalidate current valid token
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        router.push('/auth/signin')
    }

    return (
        <AppBar position="static">
            <div className="flex w-full items-center justify-between text-white bg-cprimary-300 ">
                <div className="flex flex-1">
                    {navbarItems.map((item) => (
                        <NavbarRouteButton key={item.label} {...item} />
                    ))}
                    <NavbarButton
                        label="Reports"
                        onPress={handleViewReported}
                    />
                </div>
                {!isAtSignIn && (
                    <div className="flex justify-end">
                        <NavbarButton label="Sign Out" onPress={handleLogout} />
                    </div>
                )}
            </div>
        </AppBar>
    )
}

export default Navbar
