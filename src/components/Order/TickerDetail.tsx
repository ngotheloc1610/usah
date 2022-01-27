import { useState } from 'react'
import { ITickerInfo } from '../../interfaces/order.interface'
import { ITickerDetail } from '../../interfaces/ticker.interface'
import '../../pages/Orders/OrderNew/OrderNew.scss'

interface ITickerDetailProps {
    currentTicker: ITickerInfo;
}

const defaultProps = {
    currentTicker: {}
}

const defaultTickerDetails: ITickerDetail = {
    symbolId: 0,
    tickerName: '-',
    ticker: '-',
    stockPrice: '0',
    previousClose: '0',
    open: '0',
    high: '0',
    low: '0',
    lastPrice: '0',
    volume: '0',
    change: '0',
    changePrecent: '0',
    lotSize: '0',
    minimumBizSize: '0'
}

const TickerDetail = (props: ITickerDetailProps) => {
    const { currentTicker } = props;

    const _renderIconTicker = (changeDisplay: number) => (
        <i className={changeDisplay < 0 ? 'bi bi-arrow-down' : 'bi bi-arrow-up'}></i>
    )

    const _renderLastPriceTemplate = (lastPrice: string, change: string, changePercent: string) => {
        const lastPriceDisplay = lastPrice ? lastPrice : defaultTickerDetails.lastPrice;
        const changeDisplay = change ? change : defaultTickerDetails.change;
        const changePercentDisplay = changePercent ? changePercent : defaultTickerDetails.changePrecent;
        let textColor = '';
        if (Number(changeDisplay) === 0) {
            textColor = 'text-warning';
        } else if (Number(changeDisplay) < 0) {
            textColor = 'text-danger';
        } else {
            textColor = 'text-success';
        }
        return (
            <td className="text-end w-precent-19">
                <div className={`${textColor} fs-20 fw-bold lastPriceStyle fw-600`}>
                    {Number(changeDisplay) !== 0 && _renderIconTicker(Number(changeDisplay))}
                    {lastPriceDisplay}
                </div>
                <div className={`${textColor} fw-600`}>
                    {changeDisplay}
                    ({changePercentDisplay}%)
                </div>
            </td>
        )

    }

    const _renderLastPrice = () => (
        <tr className="align-middle">
            <th className='w-precent-15'>
                <div>Last Price</div>
                <div className='mt-10'>Change</div>
            </th>
            {_renderLastPriceTemplate(currentTicker.lastPrice, currentTicker.change, currentTicker.changePrecent)}
            <th className='w-precent-15'>Open</th>
            <td className="text-end fw-600">{currentTicker.open ? currentTicker.open : defaultTickerDetails.open}</td>
        </tr>
    )

    const _renderGeneralTemplate = (title1: string, value1: string, title2: string, value2: string) => (
        <tr className="align-middle">
            <th>
                <div className="h-50px">{title1}</div>
            </th>
            <td className="text-end fw-600 w-precent-41">{currentTicker.ticker ? value1 : '0'}</td>
            <th className='w-precent-15'>{title2}</th>
            <td className="text-end fw-600">{currentTicker.ticker ? value2 : '0'}</td>
        </tr>
    )

    const _renderMiniumSize = () => (
        <tr className="align-middle">
            <th className='w-precent-15'>
                <div>Minimum Lot Size</div>
                <div className='mt-10'>Minimum Bid Size</div>
            </th>
            <td className="text-end fw-600 w-precent-41">
                <div>0</div>
                <div>0</div>
            </td>
            <th className='w-precent-15'>Low</th>
            <td className="text-end fw-600">0</td>
        </tr>
    )

    const _renderTickerDetail = () => (
        <div>
            <div className="text-uppercase small text-secondary mb-2"><strong>Ticker Detail</strong></div>
            <div className="table-responsive">
                <table cellPadding="0" cellSpacing="0" className="table border table-i table-sm">
                    <tbody className='fs-17'>
                        {_renderLastPrice()}
                        {_renderGeneralTemplate('Lot Size', '100', 'High', '145.75')}
                        {_renderMiniumSize()}
                    </tbody>
                </table>
            </div>
        </div>
    )
    return <div>{_renderTickerDetail()}</div>
}

TickerDetail.defaultProps = defaultProps;

export default TickerDetail