import { useEffect, useState } from 'react';
import { MARKET_DEPTH_LENGTH } from '../../../../constants/general.constant';
import { TITLE_LIST_BID_ASK, TITLE_LIST_BID_ASK_COLUMN, TITLE_LIST_BID_ASK_SPREADSHEET } from '../../../../constants/order.constant';
import { IAskAndBidPrice, ILastQuote, IListAskBid, IPropsListBidsAsk } from '../../../../interfaces/order.interface';
import './OrderBoolListBidsAsk.css';
import * as tdpb from '../../../../models/proto/trading_model_pb';

const defaultAskBidList: IListAskBid[] = [
    {
        totalBids: '',
        numberBids: '',
        bidPrice: '',
        askPrice: '',
        numberAsks: '',
        totalAsks: '',
        tradableAsk: false,
        tradableBid: false,
        volumeAsk: '',
        volumeBid: ''
    }
]
const OrderBookList = (props: IPropsListBidsAsk) => {
    const { styleListBidsAsk, getTickerDetail, getTicerLastQuote } = props;
    const [listAsksBids, setListAsksBids] = useState<IListAskBid[]>(defaultAskBidList);
    const tradingModel: any = tdpb;
    const getListAsksBids = (itemTickerDetail: ILastQuote) => {
        let counter = MARKET_DEPTH_LENGTH - 1;
        let assgnListAsksBids: IListAskBid[] = [];
        let askList = itemTickerDetail.asksList;
        let bidList = itemTickerDetail.bidsList;
        while (counter >= 0) {
            if (askList[counter] || bidList[counter]) {
                const tradableBid = (bidList[counter] && bidList[counter].tradable) ? bidList[counter].tradable : false;
                const volumeBid = (bidList[counter] && bidList[counter].volume) ? bidList[counter].volume : '-';
                const tradableAsk = (askList[counter] && askList[counter].tradable) ? askList[counter].tradable : false;
                const volumeAsk = (askList[counter] && askList[counter].volume) ? askList[counter].volume : '-';
                const askPrice = (askList[counter] && askList[counter].price) ? askList[counter].price : '-';
                const bidPrice = (bidList[counter] && bidList[counter].price) ? bidList[counter].price : '-';
                const numberAsks = (askList[counter] && askList[counter].volume) ? askList[counter].volume.toString() : '-';
                const numberBids = (bidList[counter] && bidList[counter].volume) ? bidList[counter].volume.toString() : '-';
                const isAskNumOrder = askList[counter] && askList[counter].numOrders;
                const isBidNumOrder = bidList[counter] && bidList[counter].numOrders;
                assgnListAsksBids.push(
                    {
                        tradableBid: tradableBid,
                        volumeBid: volumeBid,
                        tradableAsk: tradableAsk,
                        volumeAsk: volumeAsk,
                        askPrice: askPrice,
                        bidPrice: bidPrice,
                        numberAsks: numberAsks,
                        numberBids: numberBids,
                        totalAsks: counter === (MARKET_DEPTH_LENGTH - 1) ?
                            numberAsks : isAskNumOrder ? (convertNumber(numberAsks) + convertNumber(assgnListAsksBids[assgnListAsksBids.length - 1].totalAsks)).toString() : numberAsks,
                        totalBids: counter === (MARKET_DEPTH_LENGTH - 1) ?
                            numberBids : isBidNumOrder ? (convertNumber(numberBids) + convertNumber(assgnListAsksBids[assgnListAsksBids.length - 1].totalBids)).toString() : numberBids,
                    }
                )
            } else {
                assgnListAsksBids.push(
                    {
                        askPrice: '-',
                        bidPrice: '-',
                        numberAsks: '-',
                        numberBids: '-',
                        totalAsks: '-',
                        totalBids: '-',
                        tradableAsk: false,
                        volumeAsk: '-',
                        tradableBid: false,
                        volumeBid: '-'
                    }
                )
            }
            counter--;
        }
        setListAsksBids(assgnListAsksBids);
    }

    const convertNumber = (value: string) => {
        return isNaN(Number(value)) ? 0 : Number(value);
    }

    const handleTicker = (itemTicker: IListAskBid, side: string) => {
        if (side === tradingModel.OrderType.OP_BUY) {
            const itemAssign: IAskAndBidPrice = {
                numOrders: Number(itemTicker.numberAsks),
                price: itemTicker.askPrice,
                tradable: itemTicker.tradableAsk,
                volume: itemTicker.volumeAsk,
                side: side,
            }
            getTicerLastQuote(itemAssign);
            return;
        }
        const itemAssign: IAskAndBidPrice = {
            numOrders: Number(itemTicker.numberBids),
            price: itemTicker.bidPrice,
            tradable: itemTicker.tradableBid,
            volume: itemTicker.volumeBid,
            side: side,
        }
        getTicerLastQuote(itemAssign);
        return;
    }
    
    useEffect(() => {
        getListAsksBids(getTickerDetail);
    }, [getTickerDetail])

    const _renderTitleStyleEarmarkSpreadSheet = () => (
        TITLE_LIST_BID_ASK.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )

    const _renderDataStyleEarmarkSpreadSheet = () => {
        return listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL)}>{item.totalBids}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL)}>{item.volumeBid}</td>
                <td className="text-end border-end border-bottom-0 text-danger" onClick={() => handleTicker(item, tradingModel.OrderType.OP_SELL)}>{item.bidPrice}</td>
                <td className="text-end border-end border-bottom-0 text-success" onClick={() => handleTicker(item, tradingModel.OrderType.OP_BUY)}>{item.askPrice}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.OrderType.OP_BUY)}>{item.volumeAsk}</td>
                <td className="text-end border-end border-bottom-0" onClick={() => handleTicker(item, tradingModel.OrderType.OP_BUY)}>{item.totalAsks}</td>
            </tr>
        })
    }

    const _renderTitleStyleSpreadsheet = () => (
        TITLE_LIST_BID_ASK_SPREADSHEET.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )

    const _renderDataStyleSpreadsheet = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0">{item.totalAsks}</td>
                <td className="text-end border-end border-bottom-0">{item.volumeAsk}</td>
                <td className="text-end border-end border-bottom-0 text-success">{item.askPrice}</td>
                <td className="text-end border-end border-bottom-0 text-danger">{item.bidPrice}</td>
                <td className="text-end border-end border-bottom-0">{item.volumeBid}</td>
                <td className="text-end border-end border-bottom-0">{item.totalBids}</td>
            </tr>
        })
    )

    const _renderDataEmp = () => (
        <>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-danger">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <span className="text-success">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>{listAsksBids[listAsksBids.length - 1].totalBids}</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>{listAsksBids[listAsksBids.length - 1].totalAsks}</strong>}
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    <strong>UNDER</strong>
                </td>
                <td className="text-end border-end border-bottom-0">
                    <strong>OVER</strong>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">
                    {styleListBidsAsk.earmarkSpreadSheet && <strong>{listAsksBids[listAsksBids.length - 1].totalAsks}</strong>}
                    {styleListBidsAsk.spreadsheet && <strong>{listAsksBids[listAsksBids.length - 1].totalBids}</strong>}
                </td>
            </tr>
        </>
    )

    const _renderTableEarmarkSpreadSheet = () => (
        <table className="table table-sm table-hover border">
            <thead>
                <tr>
                    {styleListBidsAsk.earmarkSpreadSheet && _renderTitleStyleEarmarkSpreadSheet()}
                    {styleListBidsAsk.spreadsheet && _renderTitleStyleSpreadsheet()}
                </tr>
            </thead>
            <tbody>
                {styleListBidsAsk.earmarkSpreadSheet && _renderDataStyleEarmarkSpreadSheet()}
                {styleListBidsAsk.spreadsheet && _renderDataStyleSpreadsheet()}
                {_renderDataEmp()}
            </tbody>
        </table>
    )

    const _renderTitleStyleGirdAsk = () => (
        TITLE_LIST_BID_ASK.slice(0, 3).map(item => {
            return <th className="text-end">{item}</th>
        })
    )

    const _renderDataStyleGirdBid = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end"><span>{item.totalBids}</span></td>
                <td className="text-end">{item.volumeBid}</td>
                <td className="text-end text-danger">{item.bidPrice}</td>
            </tr>
        })
    )

    const _renderTitleStyleGirdBids = () => (
        TITLE_LIST_BID_ASK.slice(3, 6).map((item, index) => {
            return <th key={index} className="text-end">{item}</th>
        })
    )

    const _renderDataStyleGirdAsk = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end text-success">{item.askPrice}</td>
                <td className="text-end">{item.volumeAsk}</td>
                <td className="text-end"><span>{item.totalAsks}</span></td>
            </tr>
        })
    )

    const _renderTableGidBids = () => (
        <div className="order-block table-responsive">
            <table className="table table-sm border table-borderless table-hover mb-0">
                <thead>
                    <tr>
                        {_renderTitleStyleGirdBids()}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-end"><strong></strong></td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">OVER</td>
                    </tr>
                    {_renderDataStyleGirdAsk()}
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end"><span className="text-success">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td className="text-end">{listAsksBids[listAsksBids.length - 1].totalAsks}</td>
                        <td className="text-end"></td>
                        <td className="text-end"><span className="text-success">&nbsp;</span></td>
                    </tr>
                </tbody>
            </table>
            <table className="table table-sm border table-borderless table-hover mb-0">
                <thead>
                    <tr>
                        {_renderTitleStyleGirdAsk()}
                    </tr>
                </thead>
                <tbody>
                    {_renderDataStyleGirdBid()}
                    <tr>
                        <td className="text-end" colSpan={2}>&nbsp;</td>
                        <td className="text-end"><span className="text-success">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td className="text-end">
                            {listAsksBids[listAsksBids.length - 1].totalBids}
                        </td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">UNDER</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )

    const _renderTitleStyleColumns = () => (
        TITLE_LIST_BID_ASK_COLUMN.map((item, index) => {
            return <th key={index} className='text-end'>{item}</th>
        })
    )

    const _renderDataStyleColumnsAsk = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end" colSpan={2}>&nbsp;</td>
                <td className={`text-end text-success
                ${((index + 1) === listAsksBids.length && styleListBidsAsk.columnsGap) ? 'bg-success-light'
                        : ((index + 1) === listAsksBids.length && styleListBidsAsk.columns) ? 'bg-danger-light' : ''}`}>
                    {item.askPrice}</td>
                <td className="text-end">{item.volumeAsk}</td>
                <td className="text-end">{item.totalAsks}</td>
            </tr>
        })
    )
    
    const _renderDataStyleColumnsBids = () => (
        listAsksBids.map((item, index) => {
            return <tr key={index}>
                <td className="text-end">{item.totalBids === '0' ? "-" : item.totalBids}</td>
                <td className="text-end">{item.volumeBid}</td>
                <td className="text-end text-danger">{item.bidPrice}</td>
                <td className="text-end" colSpan={2}>&nbsp;</td>
            </tr>
        })
    )

    const _renderTableColumns = () => (
        <table className="table table-sm table-borderless table-hover border  mb-0">
            <thead>
                <tr>
                    {_renderTitleStyleColumns()}

                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                    <td className="text-end">OVER</td>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={4}>&nbsp;</td>
                    <td className="text-end">
                        {listAsksBids[listAsksBids.length - 1].totalAsks}
                    </td>
                </tr>
                {_renderDataStyleColumnsAsk()}
                {_renderDataStyleColumnsBids()}
                <tr>
                    <td className="text-end">
                        <strong>{listAsksBids[listAsksBids.length - 1].totalBids}</strong>
                    </td>
                    <td className="text-end" colSpan={4}>&nbsp; </td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={5}>&nbsp;</td>
                </tr>
                <tr>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                    <td className="text-end">UNDER</td>
                    <td className="text-end" colSpan={2}>&nbsp;</td>
                </tr>
            </tbody>
        </table>
    )

    return <div className="order-block table-responsive">
        {(styleListBidsAsk.earmarkSpreadSheet || styleListBidsAsk.spreadsheet) && _renderTableEarmarkSpreadSheet()}
        {styleListBidsAsk.grid && _renderTableGidBids()}
        {(styleListBidsAsk.columns || styleListBidsAsk.columnsGap) && _renderTableColumns()}
    </div>
};
export default OrderBookList;