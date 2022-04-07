import './PopUpNotification.css';
import { IReqTradingResult, ITradingResult } from '../../../interfaces/news.interface';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FORMAT_DATE_TIME_MILLI, PAGE_SIZE, SIDE } from '../../../constants/general.constant';
import moment from 'moment';
import axios from 'axios';
import { success } from '../../../constants';
import { defindConfigGet } from '../../../helper/utils';
import { API_GET_TRADING_RESULT } from '../../../constants/api.constant';
import { FIRST_PAGE } from '../../../constants/news.constant';
interface IPopsNotification {
     listTradingResults: ITradingResult[],
     handleReaded: (item: number) => void,
     setListTradingResults: Dispatch<SetStateAction<ITradingResult[]>>
     showNotificationUnread: boolean
}
const PopUpNotification = (props: IPopsNotification) => {
     const {listTradingResults, handleReaded, setListTradingResults, showNotificationUnread} = props;
     const [elTradingActive, setElTradingActive] = useState(0);
     const [currentPageTrading, setCurrentPageTrading] = useState(FIRST_PAGE)
     const api_url = process.env.REACT_APP_API_URL;
     const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;

     useEffect(() => {
          setCurrentPageTrading(FIRST_PAGE)
          setListTradingResults([])
     }, [showNotificationUnread])
     
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
     const _renderTradingResultsItem = () => (
          listTradingResults?.map((item: ITradingResult, idx: number) => (
               <div className={!item.readFlg ? "notification-item unread" : "notification-item"
                    && elTradingActive === idx ? "notification-item active" : "notification-item"}
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
                         <div className="item-summary opacity-75 fix-line-css text-end">
                              {moment(item.execTime).fromNow()}
                         </div>
                    </div>
               </div>
          ))
     )
     
     const getDataTradingResult = (showNotificationUnread: boolean) => {
          const paramTrading = !showNotificationUnread ? {   
            page_size: PAGE_SIZE,
            page: currentPageTrading
          } : {
            page_size: PAGE_SIZE,
            page: currentPageTrading,
            read_flag: false // read_flag = false --> news unread
          }
          axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
          if (resp.status === success) {
               setListTradingResults(prev => [...prev,...resp?.data?.data?.results]);
               setCurrentPageTrading(currentPageTrading + 1)
          }
          },
          (error) => {
               console.log(error);
          });
     }

     const handleScrollToBottom = (event: any) => {
          if (event.target.offsetHeight + event.target.scrollTop + 1 >= event.target.scrollHeight) {
               getDataTradingResult(showNotificationUnread)
          }
     }

     const _renderTradingResultsList = () => (
          <div className='notification-list mh-330px' onScroll={handleScrollToBottom}>
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