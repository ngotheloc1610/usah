import { LIST_NEWS_NAV, NOTIFICATION_LIST, NOTIFICATION_DETAIL } from '../../mocks'
import { INewsNav, INotificationList, INotificationDetail } from '../../interfaces/news.interface'
import './New.css'
import {useState} from 'react'

function News() {
    const [elActive, setELActive] = useState(2)

    const _renderNewsHeader = () => (
        <div className="card-header">
            <h6 className="card-title fs-6 mb-0">All Notications</h6>
        </div>
    )

    const _renderNewsBodyNavItemLeft = () => (
        LIST_NEWS_NAV.map((item: INewsNav, index: number) => (
            <li className="nav-item" key={index}>
                <a className={item.active ? "nav-link active" : "nav-link"} aria-current="page" href="#">
                    {item.title}
                    <span className="badge bg-secondary rounded ml-4">{item.unRead}</span>
                </a>
            </li>
        ))
    )

    const _renderNewsBodyNavItemRight = () => (
        <li className="nav-item ms-auto d-flex align-items-center">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="onlyunread" />
                <label className="form-check-label" htmlFor="onlyunread">Only show unread notifications</label>
            </div>
        </li>
    )

    const handleClick = (index: number) => {
        setELActive(index)  
    }
    
    const _renderNewsNotificationItem = () => (
        NOTIFICATION_LIST.map((item: INotificationList, index: number) => (
            <div className={item.unRead ? "notification-item unread" : "notification-item"
                && elActive === index ? "notification-item active" : "notification-item"
            }
                key={index}
                onClick={() => handleClick(index)}
            >
                <div className="item-icon">
                    <i className="bi bi-bell-fill"></i>
                </div>
                <div className="item-content">
                    {/* Sau này sẽ có api trả về hiện tại đang fake data */}
                    <h6 className="item-title mb-0">POEM<sup>2</sup> NEWS</h6>
                    <div className="item-summary opacity-75">{item.content}</div>
                </div>
            </div>

        ))
    )

    const _renderNewsPagination = () => (
        <nav className="d-flex justify-content-between align-items-center border-top pt-3">
            <div className="d-flex align-items-center">
                <select className="form-select form-select-sm mb-0 w-4" >
                    <option value="1">5</option>
                    <option value="2">10</option>
                    <option value="3">20</option>
                </select>
                <div className="ms-3">items/page</div>
            </div>
            <ul className="pagination mb-0">
                <li className="page-item"><a className="page-link" href="#"><i className="bi bi-chevron-compact-left"></i></a></li>
                <li className="page-item"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item"><a className="page-link" href="#"><i className="bi bi-chevron-compact-right"></i></a></li>
            </ul>
        </nav>
    )

    const _renderNewsNotificationList = () => (
        <div className="col-md-6">
            <div className="notification-list" >
                {_renderNewsNotificationItem()}
            </div>

            {_renderNewsPagination()}
        </div>
    )

    const _renderNewsNotificationDetailItem = () => (
        NOTIFICATION_DETAIL.map((item: INotificationDetail, index: number) => (
            <div className="notification-detail border p-3 shadow-sm">
                <div className="d-flex mb-2 border-bottom pb-1">
                    <div>
                        {/* Sau này sẽ có api trả về hiện tại đang fake data */}
                        <h6 className="mb-0">POEM<sup>2</sup></h6>
                        <div className="small opacity-50"> {item.date} </div>
                    </div>
                    <a href="#" className="ms-auto close"><i className="bi bi-x-lg"></i></a>
                </div>
                <div>
                    <p> {item.content} </p>
                </div>
            </div>
        ))

    )

    const _renderNewsNotificationDetail = () => (
        <div className="col-md-6">
            {_renderNewsNotificationDetailItem()}
        </div>
    )

    const _renderNewsBody = () => (
        <div className="card-body">
            <ul className="nav nav-tabs">
                {_renderNewsBodyNavItemLeft()}
                {_renderNewsBodyNavItemRight()}
            </ul>
            <div className="mb-3">
                <div className="py-3">
                    <div className="row">
                        {_renderNewsNotificationList()}
                        {_renderNewsNotificationDetail()}
                    </div>
                </div>

            </div>
        </div>
    )

    const _renderNewsTemplate = () => (
        <div className="site-main">
            <div className="container">
                <div className="card shadow-sm mb-3">
                    {_renderNewsHeader()}
                    {_renderNewsBody()}
                </div>
            </div>
        </div>
    )

    return (
        _renderNewsTemplate()
    )

}
export default News