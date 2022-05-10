export const TITLE_LIST_BID_ASK = ['Total Bids', 'Number of Bids', 'Bid Price', 'Ask Price', 'Number of Asks', 'Total Asks'];
export const STYLE_LIST_BIDS_ASK = {
    earmarkSpreadSheet: 'file-earmark-spreadsheet',
    spreadsheet: 'file-spreadsheet',
    grid: 'grid-3x2',
    columns: 'columns',
    columnsGap: 'columns-gap'
}
export const TITLE_LIST_BID_ASK_SPREADSHEET = ['Total Asks', 'Number of Asks', 'Ask Price', 'Bid Price', 'Number of Bids', 'Total Bids'];
export const TITLE_LIST_BID_ASK_COLUMN = ['Total Bids', 'Number of Bids', 'Price', 'Number of Asks', 'Total Asks'];
export const TITLE_LIST_BID_ASK_COLUMN_GAB = ['Total Asks',  'Number of Asks', 'Price', 'Number of Bids', 'Total Bids']
export const TITLE_TRADE_HISTORY = ['Datetime', 'Vol', 'Price'];

export const TYPE_ORDER_RES = {
    Cancel: 'Cancel',
    Order: 'Order',
    Modify: 'Modify',
}

export const MSG_ERROR = {
    minValue: 'Order not enough min order value',
    modifiedSuccess: 'Modified success',
    cancelSuccess: 'Cancel success',
    invalidPrice: 'Order invalid price range',
    invalidTickSize: 'Order invalid tick size',
    holidaySession: 'Order in holiday session'
}

export const MSG_ERR_DIS = {
    minValue: 'The order is less than USD 20,000. Kindly revise the number of shares',
    modifiedSuccess: 'Modified successfully',
    cancelSuccess: 'Cancelled successfully',
    invalidPrice: 'Out of price range',
    invalidTickSize: 'Invalid price',
    holidaySession: 'Market is closed during holiday'
}