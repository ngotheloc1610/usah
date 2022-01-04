import './Modal.css'
import '../../pages/Orders/OrderNew/OrderNew.css'
import PropTypes from 'prop-types'
import { IParamOrder } from '../../interfaces/order.interface'
import { useState } from 'react'
import { wsService } from '../../services/websocket-service'

interface IProps {
    handleClose: any;
    params: IParamOrder
}

const defaultProps = {
    handleClose: null,
    params: {},
}

const ConfirmOrder = (props: IProps) => {
    const { handleClose, params } = props;
    const [currentSide, setCurrentSide] = useState(params.side);
    const sendOrder = () => {
        let wsConnected = wsService.getWsConnected();
    }
    const _renderListConfirm = () => (
        <div>
            <table style={{ width: '354px' }}>
                <tbody>
                    <tr>
                        <td className='text-left w-150'><b>Ticker</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.tickerCode} - {params.tickerName}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Volume</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.volume}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Price</b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.price}</td>
                    </tr>
                    <tr>
                        <td className='text-left w-150'><b>Value &nbsp;&nbsp; <span>($)</span></b></td>
                        <td className='text-left w-90'>:</td>
                        <td className='text-left'>{params.volume * params.price}</td>
                    </tr>
                    <tr className='h-100'>
                        <td><b>Trading Pin</b></td>
                        <td></td>
                        <td><input type="password" /></td>
                    </tr>
                </tbody>
            </table>
            <div style={{marginTop: '30px'}}>
                <button className='btn-primary-custom' style={{ width: '100px' }} onClick={sendOrder}>Place</button>
            </div>
        </div>


    )

    const _renderTamplate = () => (
        <div>
            <div className="box">
                <div>
                    Confirm order
                    <span className="close-icon" onClick={handleClose}>x</span>
                </div>
            </div>
            <div className='content text-center'>
                <div>
                    <span className='fs-18'><b>Would you like to place order</b></span> &nbsp; &nbsp; &nbsp;
                    <span className={currentSide === '1' ? 'order-type text-success' : 'order-type text-danger'}><b>
                        {currentSide === '1' ? 'buy' : 'sell'}
                    </b></span>
                </div>
                <div className='table-content'>
                    {_renderListConfirm()}
                </div>
            </div>
        </div>
    )

    return <div className="popup-box">

        {_renderTamplate()}
    </div>
}

ConfirmOrder.protoType = {
    handleClose: PropTypes.func,
    params: PropTypes.object,
};

ConfirmOrder.defaultProps = defaultProps;

export default ConfirmOrder