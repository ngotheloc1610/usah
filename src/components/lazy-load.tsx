import './component.styles.scss'

const LazyLoad = () => {
    return (
        <div className='lazy-load'>
            <div className="fade modal-backdrop show"></div>
            <div role="dialog" aria-modal="true" className="fade modal show d-block" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LazyLoad