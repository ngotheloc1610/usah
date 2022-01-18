import { useState } from 'react';
import OrderForm from '../../../components/Order/OrderForm';
import OrderBookList from '../../../components/Orders/OrderBookCommon/OrderBookList';
import OrderBookTickerDetail from '../../../components/Orders/OrderBookCommon/OrderBookTickerDetail';
import OrderBookTradeHistory from '../../../components/Orders/OrderBookCommon/OrderBookTradeHistory';
import { STYLE_LIST_BIDS_ASK } from '../../../constants/order.constant';
import { IStyleBidsAsk, ITickerInfo } from '../../../interfaces/order.interface';
import './OrderBookCommon.css';

const OrderBookCommon = () => {
    const [isEarmarkSpreadSheet, setEarmarkSpreadSheet] = useState<boolean>(true);
    const [isSpreadsheet, setSpreadsheet] = useState<boolean>(false);
    const [isGrid, setGrid] = useState<boolean>(false);
    const [isColumns, setColumns] = useState<boolean>(false);
    const [isColumnsGap, setColumnsGap] = useState<boolean>(false);
    const [currentTicker, setCurrentTicker] = useState<ITickerInfo>();
    const [msgSuccess, setMsgSuccess] = useState<string>('')
    
    const defaultData = () => {
        setEarmarkSpreadSheet(false);
        setSpreadsheet(false);
        setGrid(false);
        setColumns(false);
        setColumnsGap(false);
    }

    const selectedStyle = (item: string) => {
        defaultData();
        switch (item) {
            case STYLE_LIST_BIDS_ASK.earmarkSpreadSheet: {
                setEarmarkSpreadSheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.spreadsheet: {
                setSpreadsheet(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.grid: {
                setGrid(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columns: {
                setColumns(true);
                break;
            }
            case STYLE_LIST_BIDS_ASK.columnsGap: {
                setColumnsGap(true);
                break;
            }
        }
    }

    const listStyleBidsAsk: IStyleBidsAsk = {
        earmarkSpreadSheet: isEarmarkSpreadSheet,
        spreadsheet: isSpreadsheet,
        grid: isGrid,
        columns: isColumns,
        columnsGap: isColumnsGap,
    };
    const _renderListStyle = (isStyle: boolean, itemStyle: string) => (
        <li>
            <a href="#layout-1"
                className={`btn btn-sm btn-outline-secondary mx-1 ${isStyle ? 'selected' : ''}`}
                onClick={() => selectedStyle(itemStyle)}>
                <i className={`bi bi-${itemStyle}`}></i></a>
        </li>
    )

    const messageSuccess = (item: string) => {
        setMsgSuccess(item);
    }
    return <div className="site-main">
        <div className="container">
            <div className="row g-2 align-items-center">
                <div className="col-md-9">
                    <div className="row g-2 justify-content-end">
                        <div className="col-md-3">
                            <div className="input-group input-group-sm mb-2">
                                <input type="text" className="form-control border-end-0" placeholder="Search" />
                                <button className="btn btn-outline-secondary border-start-0" type="button"><i className="bi bi-search"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <ul className="idTabs nav align-items-center justify-content-center mb-2">
                        {_renderListStyle(isEarmarkSpreadSheet, STYLE_LIST_BIDS_ASK.earmarkSpreadSheet)}
                        {_renderListStyle(isSpreadsheet, STYLE_LIST_BIDS_ASK.spreadsheet)}
                        {_renderListStyle(isGrid, STYLE_LIST_BIDS_ASK.grid)}
                        {_renderListStyle(isColumns, STYLE_LIST_BIDS_ASK.columns)}
                        {_renderListStyle(isColumnsGap, STYLE_LIST_BIDS_ASK.columnsGap)}
                    </ul>
                </div>
            </div>
            <div className="row align-items-stretch g-2">
                <div className="col-md-9">
                    <div className="equal-target">
                        <div id="layout-1">
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                    <OrderBookList styleListBidsAsk={listStyleBidsAsk} />
                                    <div className={`card card-ticker ${listStyleBidsAsk.columnsGap === true ? 'w-pr-135' : 'w-pr-100'}`}>
                                        <OrderBookTickerDetail />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body">
                                            <OrderForm currentTicker={currentTicker}  messageSuccess={messageSuccess} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="layout-3" style={{ display: "none" }}>
                            <div className="row align-items-stretch g-2">
                                <div className="col-md-9">
                                </div>
                                <div className="col-md-3">
                                    <div className="card card-new-order d-flex flex-column h-100">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0"><i className="icon bi bi-clipboard me-1"></i> New Order</h6>
                                        </div>
                                        <div className="card-body flew-grow-1">
                                            <form action="#" className="order-form">

                                                <div className="order-btn-group d-flex align-items-stretch mb-2">

                                                    <button type="button" className="btn btn-buy text-white flex-grow-1 p-2 text-center selected">
                                                        <span className="fs-5 text-uppercase">Buy</span>
                                                    </button>


                                                    <button type="button" className="btn btn-sell text-white flex-grow-1 p-2 px-2 text-center">
                                                        <span className="fs-5 text-uppercase">Sell</span>
                                                    </button>

                                                </div>
                                                <div className="mb-2 border py-1 px-2 d-flex align-items-center justify-content-between">
                                                    <label className="text text-secondary">Ticker</label>
                                                    <div className="fs-5">AAPL</div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Price</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="145.58" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="mb-2 border d-flex align-items-stretch item-input-spinbox">
                                                    <div className="flex-grow-1 py-1 px-2">
                                                        <label className="text text-secondary">Volume</label>
                                                        <input type="text" className="form-control text-end border-0 p-0 fs-5 lh-1"
                                                            value="5,000" placeholder="" />
                                                    </div>
                                                    <div className="border-start d-flex flex-column">
                                                        <button type="button" className="btn border-bottom px-2 py-1 flex-grow-1">+</button>
                                                        <button type="button" className="btn px-2 py-1 flex-grow-1">-</button>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Min lot</div>
                                                    <div><strong>100</strong></div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="text-secondary">Owned Volume</div>
                                                    <div><strong>10,000</strong></div>
                                                </div>
                                                <div className="border-top">
                                                    <a href="#" className="btn btn-placeholder btn-primary d-block fw-bold text-white mb-1">Place</a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <OrderBookTradeHistory />
                </div>
            </div>
        </div>
    </div>
};
export default OrderBookCommon;