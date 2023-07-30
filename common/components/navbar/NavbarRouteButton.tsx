import { useRouter } from 'next/router'
import NavbarButton from './NavbarButton'

export interface NavbarItem {
    label: string
    query: string[]
    mask: string
}

const NavbarRouteButton = ({ label, query, mask }: NavbarItem) => {
    const router = useRouter()

    const handleRedirect = () => {
        router.push(
            {
                pathname: '/submissions/[status]',
                query: { status: query },
            },
            mask,
            { shallow: true }
        )
    }

    return <NavbarButton label={label} onPress={handleRedirect} />
}

export default NavbarRouteButton
