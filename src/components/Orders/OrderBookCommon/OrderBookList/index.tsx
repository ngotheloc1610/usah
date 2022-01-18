import { TITLE_LIST_BID_ASK, TITLE_LIST_BID_ASK_COLUMN, TITLE_LIST_BID_ASK_SPREADSHEET } from '../../../../constants/order.constant';
import { IPropsListBidsAsk } from '../../../../interfaces/order.interface';
import { Mock_Bids_Ask } from '../../../../mocks';
import './OrderBoolListBidsAsk.css';
const OrderBookList = (props: IPropsListBidsAsk) => {
    const { styleListBidsAsk } = props;
    // const { getTicerLastQuote } = props;
    
    const _renderTitleStyleEarmarkSpreadSheet = () => (
        TITLE_LIST_BID_ASK.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )
    const _renderDataStyleEarmarkSpreadSheet = () => (
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0">{item.totalBids}</td>
                <td className="text-end border-end border-bottom-0">{item.numberBids}</td>
                <td className="text-end border-end border-bottom-0 text-danger">{item.bidPrice}</td>
                <td className="text-end border-end border-bottom-0 text-info">{item.askPrice}</td>
                <td className="text-end border-end border-bottom-0">{item.numberAsk}</td>
                <td className="text-end border-end border-bottom-0">{item.totalAsk}</td>
            </tr>
        })
    )

    const _renderTitleStyleSpreadsheet = () => (
        TITLE_LIST_BID_ASK_SPREADSHEET.map((item, index) => {
            return <th key={index} className="border-end">{item}</th>
        })
    )

    const _renderDataStyleSpreadsheet = () => (
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end border-end border-bottom-0">{item.totalAsk}</td>
                <td className="text-end border-end border-bottom-0">{item.numberAsk}</td>
                <td className="text-end border-end border-bottom-0 text-danger">{item.askPrice}</td>
                <td className="text-end border-end border-bottom-0 text-info">{item.bidPrice}</td>
                <td className="text-end border-end border-bottom-0">{item.numberBids}</td>
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
                    <span className="text-info">&nbsp;</span>
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
                    <span className="text-info">&nbsp;</span>
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
                    <span className="text-info">&nbsp;</span>
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
                    <span className="text-info">&nbsp;</span>
                </td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
                <td className="text-end border-end border-bottom-0">&nbsp;</td>
            </tr>
            <tr>
                <td className="text-end border-end border-bottom-0">
                    <strong>113</strong>
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
                    <strong>113</strong>
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
    const _renderDataStyleGirdAsk = () => (
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end">{item.totalBids}</td>
                <td className="text-end">{item.numberBids}</td>
                <td className="text-end"><span className="text-info">{item.bidPrice}</span></td>
            </tr>
        })
    )
    const _renderTitleStyleGirdBids = () => (
        TITLE_LIST_BID_ASK.slice(3, 6).map((item, index) => {
            return <th key={index} className="text-end">{item}</th>
        })
    )
    const _renderDataStyleGirdBids = () => (
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end">{item.totalAsk}</td>
                <td className="text-end">{item.numberAsk}</td>
                <td className="text-end"><span className="text-info">{item.askPrice}</span></td>
            </tr>
        })
    )
    const _renderTable2 = () => (
        <div className="order-block table-responsive">
            <table className="table table-sm border table-borderless table-hover mb-0">
                <thead>
                    <tr>
                        {_renderTitleStyleGirdBids()}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-end"><strong>144</strong></td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">OVER</td>
                    </tr>
                    {_renderDataStyleGirdBids()}
                    <tr>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end">&nbsp;</td>
                        <td className="text-end"><span className="text-info">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td className="text-end">23</td>
                        <td className="text-end">23</td>
                        <td className="text-end"><span className="text-info">&nbsp;</span></td>
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
                    {_renderDataStyleGirdAsk()}
                    <tr>
                        <td className="text-end" colSpan={2}>&nbsp;</td>
                        <td className="text-end"><span className="text-info">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td className="text-end">113</td>
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
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end" colSpan={2}>&nbsp;</td>
                <td className={`text-end 
                ${((index + 1) === Mock_Bids_Ask.length && styleListBidsAsk.columnsGap) ? 'bg-success-light'
                        : ((index + 1) === Mock_Bids_Ask.length && styleListBidsAsk.columns) ? 'bg-danger-light' : ''}`}>
                    {item.askPrice}</td>
                <td className="text-end">{item.numberAsk}</td>
                <td className="text-end">{item.totalAsk}</td>
            </tr>
        })
    )
    const _renderDataStyleColumnsBids = () => (
        Mock_Bids_Ask.map((item, index) => {
            return <tr key={index}>
                <td className="text-end">{item.totalAsk}</td>
                <td className="text-end">{item.numberBids}</td>
                <td className="text-end">{item.bidPrice}</td>
                <td className="text-end" colSpan={2}>&nbsp;</td>
            </tr>
        })
    )
    const _renderTable4 = () => (
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
                    <td className="text-end">144</td>
                </tr>
                {_renderDataStyleColumnsAsk()}
                {_renderDataStyleColumnsBids()}
                <tr>
                    <td className="text-end"><strong>113</strong></td>
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
        {styleListBidsAsk.grid && _renderTable2()}
        {(styleListBidsAsk.columns || styleListBidsAsk.columnsGap) && _renderTable4()}
    </div>
};
export default OrderBookList;