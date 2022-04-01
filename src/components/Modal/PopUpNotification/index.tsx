import './PopUpNotification.css';
import axios from 'axios';
import { IReqTradingResult, ITradingResult } from '../../../interfaces/news.interface';
import { API_GET_TRADING_RESULT, API_POST_TRADING_RESULT } from '../../../constants/api.constant';
import { defindConfigGet, defindConfigPost } from '../../../helper/utils';
import { success } from '../../../constants';
import { useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE_FOR_NEWS } from '../../../constants/news.constant';
import { FORMAT_DATE_TIME_MILLI, SIDE, START_PAGE } from '../../../constants/general.constant';
import moment from 'moment';


interface IPopsNotification {
     listTradingResults: ITradingResult[],
     totalItem: number;
     pageSizeTrading: number
     handleScrollNoti: (item: number) => void,
     handleReaded: (item: number) => void,
}
const PopUpNotification = (props: IPopsNotification) => {
     const {listTradingResults, totalItem, handleScrollNoti, handleReaded, pageSizeTrading} = props;
     const [elTradingActive, setElTradingActive] = useState(0);
     
     const handleClickTradingResult = (itemTrading: ITradingResult, index: number) => {
          setElTradingActive(index);
          if (itemTrading) {
               if (!itemTrading.readFlg) {
                    handleReaded(itemTrading?.id);
               }
          }
     }
     const getSideName = (side: number) => {
          return SIDE.find(item => item.code === side)?.title;
     }
     const convertTime = (item: string) => {
          return moment(item).format(FORMAT_DATE_TIME_MILLI)
     }

     const handleWheel = () => {
          if (totalItem >= Number(pageSizeTrading)) {
               const pageSizeChange = Number(pageSizeTrading) + 2;
               handleScrollNoti(pageSizeChange);
          }
     }
     const _renderTradingResultsItem = () => (
          listTradingResults?.map((item: ITradingResult, idx: number) => (
               <div className={!item.readFlg ? "notification-item unread" : "notification-item"
                    && elTradingActive === idx ? "notification-item active" : "notification-item" && 'tableFixHead m-3'}
                    key={idx}
                    onClick={() => handleClickTradingResult(item, idx)}
               >
                    <div className="item-icon">
                         <i className="bi bi-cash-stack"></i>
                    </div>
                    <div className="item-content">
                         <h5 className="item-title mb-0">Trading Results Information</h5>
                         <div className="item-summary opacity-75 fix-line-css">
                              {getSideName(Number(item.orderSide))} {item.execVolume} {item.symbolCode} price {item.execPrice.toFixed(2)}
                         </div>
                         <div className="item-summary opacity-75 fix-line-css">
                              {convertTime(item.execTime)}
                         </div>
                    </div>
               </div>
          ))
     )

     const _renderTradingResultsList = () => (
          <div className='notification-list mh-430px' onWheel={handleWheel}>
               <div id='notification-list'>
                    {_renderTradingResultsItem()}
               </div>
          </div>
     )
     return (
          _renderTradingResultsList()
     )
}
export default PopUpNotification;