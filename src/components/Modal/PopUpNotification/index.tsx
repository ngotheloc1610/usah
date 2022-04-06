import './PopUpNotification.css';
import { ITradingResult } from '../../../interfaces/news.interface';
import { useState } from 'react';
import { FORMAT_DATE_TIME_MILLI, SIDE } from '../../../constants/general.constant';
import moment from 'moment';
interface IPopsNotification {
     listTradingResults: ITradingResult[],
     handleReaded: (item: number) => void,
}
const PopUpNotification = (props: IPopsNotification) => {
     const {listTradingResults, handleReaded} = props;
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

     const _renderTradingResultsList = () => (
          <div className='notification-list mh-430px'>
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