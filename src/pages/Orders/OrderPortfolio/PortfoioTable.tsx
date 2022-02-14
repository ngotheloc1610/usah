import { IPropsListPortfolio, IListPortfolio } from '../../../interfaces/order.interface'
import { formatCurrency, formatNumber } from '../../../helper/utils'
import { ISymbolList } from '../../../interfaces/ticker.interface'
import { wsService } from "../../../services/websocket-service";
import { SOCKET_CONNECTED } from '../../../constants/general.constant';
import { useEffect, useState } from 'react';
import sendMsgSymbolList from '../../../Common/sendMsgSymbolList'
function PortfolioTable(props: IPropsListPortfolio) {
    const { accountPortfolio } = props
    const [symbolList, setSymbolList] = useState<ISymbolList[]>([])

    useEffect(() => {
        const ws = wsService.getSocketSubject().subscribe(resp => {
            if (resp === SOCKET_CONNECTED) {
                sendMsgSymbolList();;
            }
        });

        const renderDataSymbolList = wsService.getSymbolListSubject().subscribe(res => {
            setSymbolList(res.symbolList)
        });

        return () => {
            ws.unsubscribe();
            renderDataSymbolList.unsubscribe();
        }
    }, [])


    const getTickerCode = (symbolId: string) => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolCode;
    }

    const getTickerName = (symbolId: string) => {
        return symbolList.find(item => item.symbolId.toString() === symbolId)?.symbolName;
    }

    const _rederPortfolioInvest = () => {
        const totalInvestedValue = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.investedValue)
        }, 0)

        const totalCurrentValue = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.currentValue)
        }, 0)

        const totalPl = accountPortfolio.reduce((acc, crr) => {
            return acc + Number(crr.unrealizedPl)
        }, 0)

        return (
            <div className="border p-3 mb-3">
                <div className="row">
                    <div className="col-md-3 text-center">
                        <div>Total Invested Value:</div>
                        <div className="fs-5 fw-bold">{formatCurrency(totalInvestedValue.toString())}</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total Current Value:</div>
                        <div className="fs-5 fw-bold">{formatCurrency(totalCurrentValue.toString())}</div>
                    </div>
                    <div className="col-md-3 text-center">
                        <div>Total P&amp;L:</div>
                        <div className="fs-5 fw-bold text-success">{formatCurrency(totalPl.toString())}</div>
                    </div>
                    <div className="col-md-3 order-0 order-md-4">
                        <p className="text-end small opacity-50 mb-2">Currency: USD</p>
                    </div>
                </div>
            </div>
        )
    }

    const _renderPortfolioTableHeader = () => (
        <tr>
            <th className="text-start fz-14 w-200" >Ticker Name</th>
            <th className="text-start fz-14 w-s" >Ticker Code</th >
            <th className="text-end fz-14 w-s" >Transactions Volume</th>
            <th className="text-end fz-14 w-s" >AVG Price</th>
            <th className="text-end fz-14 w-s" >Invested Value</th>
            <th className="text-end fz-14 w-s" >Market Price</th>
            <th className="text-end fz-14 w-s" >Current Value</th>
            <th className="text-end fz-14 w-s" >P&amp;L</th>
            <th className="text-end fz-14 w-s" >% P&amp;L</th>
            {accountPortfolio.length > 6 && <th className="text-end fz-14 w-17"></th>}
        </tr>
    )

    const _renderPortfolioTableBody = () => (
        accountPortfolio.map((item: IListPortfolio, index: number) => (
            <tr className="odd " key={index}>
                <td className="text-start w-200 td" >{getTickerName(item.symbolCode)}</td>
                <td className="text-start w-s td">{getTickerCode(item.symbolCode)}</td>
                {
                    Number(item.pendingVolume) === 0 ? <td className="text-end w-s td">&nbsp;</td> : <td className="text-end w-s td">{formatNumber(item.pendingVolume)}</td>
                }
                <td className="text-end w-s td" >{formatCurrency(item.avgPrice)}</td>
                <td className="text-end w-s td" >{formatCurrency(item.investedValue)}</td>
                <td className="text-end w-s td" >{formatCurrency(item.marketPrice)}</td>
                <td className="text-end w-s td"  >{formatCurrency(item.currentValue)}</td>
                <td className="text-end w-s td fw-600" ><span className={Number(item.unrealizedPl) > 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(item.unrealizedPl)}</span>
                </td>
                <td className="text-end w-s td fw-600"><span className={Number(item.unrealizedPl) > 0 ? "text-success" : "text-danger"}>
                    {(Number(item.unrealizedPl) / Number(item.investedValue) * 100).toFixed(2) + '%'}</span></td>
            </tr>
        ))

    )

    const _renderPortfolioTable = () => (
        <div className="table-responsive mb-3">
            <table id="table" className="table table-sm table-hover mb-0" cellSpacing="0" cellPadding="0">
                <thead className="thead">
                    {_renderPortfolioTableHeader()}
                </thead>
                <tbody className='scroll tbody'>
                    {_renderPortfolioTableBody()}
                </tbody>
            </table>
        </div>
    )

    return (
        <>
            {_rederPortfolioInvest()}
            {_renderPortfolioTable()}
        </>
    )
}

export default PortfolioTable