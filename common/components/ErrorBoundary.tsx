import React, { Component } from 'react'

class ErrorBoundary extends Component<any, any> {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ hasError: true })
        console.log(errorInfo)
    }

    render() {
        const dismissError = () => {
            this.setState({ hasError: true })
        }

        if (this.state.hasError) {
            return (
                <div>
                    <h2>Đã có lỗi xảy ra @@</h2>
                    <button type="button" onClick={dismissError}>
                        Try again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
