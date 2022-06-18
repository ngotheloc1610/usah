import './PopUpNotification.css';
import { IReqTradingResult, ITradingResult } from '../../../interfaces/news.interface';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FORMAT_DATE_NEW_OR_RESULT, FORMAT_DATE_TIME_MILLIS, PAGE_SIZE, SIDE } from '../../../constants/general.constant';
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
}
const PopUpNotification = (props: IPopsNotification) => {
     const {listTradingResults, handleReaded, setListTradingResults} = props;
     const [elTradingActive, setElTradingActive] = useState(0);
     const [currentPageTrading, setCurrentPageTrading] = useState(FIRST_PAGE)
     const api_url = window.globalThis.apiUrl;
     const urlGetTradingResult = `${api_url}${API_GET_TRADING_RESULT}`;
     const [isLastPage, setIsLastPage] = useState(false);
     
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
          return moment(item).format(FORMAT_DATE_TIME_MILLIS)
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
                         <div className="item-summary opacity-75 fix-line-css">
                              {moment(item.execTime).format(FORMAT_DATE_NEW_OR_RESULT)}
                         </div>
                    </div>
               </div>
          ))
     )
     
     const getDataTradingResult = () => {
          const paramTrading = {   
            page_size: PAGE_SIZE,
            page: currentPageTrading
          }
          axios.get<IReqTradingResult, IReqTradingResult>(urlGetTradingResult, defindConfigGet(paramTrading)).then((resp) => {
          if (resp.status === success) {
               if(resp?.data?.data) {
                    if (currentPageTrading !== FIRST_PAGE) {
                         setListTradingResults(prev => [...prev,...resp?.data?.data?.results]);
                    }
                    const nextPage = resp?.data?.data?.next_page;
                    setIsLastPage(nextPage === currentPageTrading);
                    setCurrentPageTrading(currentPageTrading + 1)
               }
          }
          },
          (error) => {
               console.log(error);
          });
     }

     const handleScrollToBottom = (event: any) => {
          if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight && !isLastPage) {
               getDataTradingResult()
          }
     }

     const _renderTradingResultsList = () => (
          <div className='notification-list mh-700px' onScroll={handleScrollToBottom}>
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