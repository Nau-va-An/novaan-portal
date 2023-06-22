import React, { ReactNode } from 'react'

interface ErrTextProps {
    children?: ReactNode
}

const ErrText = (props: ErrTextProps) => {
    return <p className="italic text-sm text-cwarning">{props.children}</p>
}

export default ErrText
