interface ISetting {
    isTradingPin: boolean;
    isChangePassword: boolean;
    isNotification: boolean;
}

const defaultProps = {
    isTradingPin: false,
    isChangePassword: false,
    isNotification: false,
}

const Setting = (props: ISetting) => {
    const { isTradingPin, isChangePassword, isNotification } = props
    const _renderSettingTemplate = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <div className="mb-4">
                    <h6 className="c-title text-primary mb-3">{isTradingPin ? 'Channge Tradding PIN' : 'Change Password'}</h6>
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3  mb-1 mb-md-0">
                            <label className="text-secondary">{isTradingPin ? 'Current trading PIN' : 'Current Password'}</label>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group input-group-pw">
                                <input type="password" className="form-control" placeholder="" aria-label="" />
                                <button className="btn btn-outline-secondary btn-pw-toggle" type="button"><i className="bi bi-eye-fill opacity-50"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3  mb-1 mb-md-0">
                            <label className="text-secondary">{isTradingPin ? 'New trading PIN' : 'New Password'}</label>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group input-group-pw">
                                <input type="password" className="form-control" placeholder="" aria-label="" />
                                <button className="btn btn-outline-secondary btn-pw-toggle" type="button"><i className="bi bi-eye-fill opacity-50"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3  mb-1 mb-md-0">
                            <label className="text-secondary">{isTradingPin ? 'Confirm trading PIN' : 'Confirm Password'}</label>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group input-group-pw">
                                <input type="password" className="form-control" placeholder="" aria-label="" />
                                <button className="btn btn-outline-secondary btn-pw-toggle" type="button"><i className="bi bi-eye-fill opacity-50"></i></button>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-md-3">
                            &nbsp;
                        </div>
                        <div className="col-md-4">
                            <a href="#" className="btn btn-primary px-4">Save</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const _renderSettingNotification = () => (
        <div className="card">
            <div className="card-body border-top shadow-sm">
                <h4 className="border-bottom pb-1 mb-3"><i className="bi bi-gear-fill opacity-50"></i> <strong>Setting</strong></h4>
                <div className="mb-4">
                    <h6 className="c-title text-primary mb-3">Notification</h6>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_admin" />
                        <label className="form-check-label" htmlFor="news_admin">Receive admin news</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="news_notication" />
                        <label className="form-check-label" htmlFor="news_notication">Receive matched results notification</label>
                    </div>
                </div>
            </div>
        </div>
    )

    return <>
            {!isNotification && _renderSettingTemplate()}
            {isNotification && _renderSettingNotification()}
        </>
}

Setting.defaultProps = defaultProps

export default Setting