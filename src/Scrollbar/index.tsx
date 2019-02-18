import * as classnames from 'classnames'
import * as React from 'react'
import * as debounce from 'debounce'

console.log(`debounce`,debounce)

type Props = {
    className?: string
    onBlur?: (evt?) => void
    onScroll?: (evt?) => void
    height: number
    trackVertical?: boolean
}

type State = {
    rect: { height }
}

export default class Scrollbar extends React.PureComponent<Props, State> {
    public static defaultProps = {
        onBlur: () => {},
        onScroll: () => {},
        trackVertical: true
    }

    private ref
    private scrollRef
    private trackVerticalRef
    private tempPageX
    private tempPageY
    private tempScrollTop

    constructor(props) {
        super(props)
        this.state = {
            rect: null
        }
        this.onScroll = this.onScroll.bind(this)
        this.onWindowScroll = this.onWindowScroll.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.debouncedHideTrackVerticalButton = debounce(this.hideTrackVerticalButton, 300)
    }

    public componentDidMount() {
        window.addEventListener('scroll', this.onWindowScroll, true)
        window.addEventListener('mousemove', this.onMouseMove, true)
        window.addEventListener('mouseup',this.onMouseUp, true)
        this.setState({ rect: this.ref.getBoundingClientRect() })
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.onWindowScroll)
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    public render() {
        const { rect } = this.state
        const { className, height, trackVertical, children } = this.props
        const wrapperClasses = classnames('sd-scrollbar-wrapper', className)
        const classes = classnames('sd-scrollbar', {
            ['track-vertical']: trackVertical
        })

        return (
            <div className={wrapperClasses} style={{ height }}>
                <div ref={ref => this.scrollRef = ref} className={classes} style={{ height }} onScroll={this.onScroll}>
                    {
                        rect &&
                        <div
                            ref={ref => this.trackVerticalRef = ref}
                            className='track-vertical-button'
                            style={{ height: this.trackVerticalHeight }}
                            onMouseDown={this.onMouseDown}
                        >
                        </div>
                    }
                    <div ref={ref => this.ref = ref}>
                        {
                            children
                        }
                    </div>
                </div>
            </div>
        )
    }

    private onWindowScroll(evt) {
        const target = evt.target
        const classes = target.getAttribute ? target.getAttribute('class') : ''
        if (classes.indexOf('sd-scrollbar') >= 0) {
            // do nothing
        } else {
            this.props.onBlur()
        }
    }

    private onScroll(evt) {
        const { rect } = this.state
        const { height } = this.props

        let top 
        top = Math.max(this.scrollRef.scrollTop / rect.height * height, 0) // >= 0
        top = Math.min(top, height - this.trackVerticalHeight) // <= height - trackVerticalHeight
        this.trackVerticalRef.style.top = top + 'px'
        this.trackVerticalRef.style.visibility = 'visible'
        // this.debouncedHideTrackVerticalButton()
        this.props.onScroll(evt)
    }

    private onMouseDown(evt) {
        const { pageY } = evt
        this.tempPageY = pageY
        this.tempScrollTop = this.scrollRef.scrollTop
        evt.preventDefault()
        evt.stopPropagation()
    }

    private onMouseMove(evt) {
        const { pageY } = evt
        requestAnimationFrame(() => {
            if(Number.isFinite(this.tempPageY)) {
                evt.preventDefault()
                evt.stopPropagation()

                const { rect } = this.state
                const { height } = this.props
                let move = (pageY - this.tempPageY) / height * rect.height
                let top
                top = Math.max(move + this.tempScrollTop, 0) // >= 0
                top = Math.min(top, rect.height - height) // <= rect.height - height
                this.scrollRef.scrollTop = top
            }    
        })
    }

    private onMouseUp() {
        this.tempPageX = undefined
        this.tempPageY = undefined
        this.tempScrollTop = undefined
    }

    private hideTrackVerticalButton = () => {
        this.trackVerticalRef.style.visibility = 'hidden'
    }

    get trackVerticalHeight() {
        const { rect } = this.state
        const { height } = this.props
        return height / rect.height * height
    }
}
