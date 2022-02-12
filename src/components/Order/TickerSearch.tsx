import { ISymbolList } from '../../interfaces/ticker.interface'
import '../../pages/Orders/OrderNew/OrderNew.scss'
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { getSymbolId } from '../../helper/utils';
interface ITickerSearch {
    handleTicker: (event: any) => void;
    listTicker: ISymbolList[];
}

const defaultProps = {
    handleTicker: null
}

const TickerSearch = (props: ITickerSearch) => {
    const { handleTicker, listTicker } = props;
    const [ticker, setTicker] = useState<string | undefined>('')
    const [symbolName, setSymbolName] = useState<string[]>([])

    useEffect(() => {
        const listSymbolName: string[] = []
        listTicker.forEach((item: any) => {
            listSymbolName.push(`${item.symbolName} (${item.symbolCode})`);
        });
        setSymbolName(listSymbolName)
    }, [listTicker])

    const _renderRecentSearch = () => (
        <div className="d-md-flex align-items-md-center text-center">
            <div>Recent Search:</div> &nbsp; &nbsp;
            <div>
                <a href="# " className='color-primary'>Apple Inc. [AAPL]</a> &nbsp; &nbsp;
                <a href="# " className='color-primary'>Adobe Inc. [ADBE]</a>&nbsp; &nbsp;
                <a className='color-primary' href="# ">Amazon.com, Inc. [AMZN]</a>
            </div>
        </div>
    )

    const handleChangeTicker = (event: any) => {
        const string = event.target.innerText
        if (string !== undefined) {
            setTicker(getSymbolId(string, listTicker))
        } else {
            setTicker('0')
        }
    }

    const handleKeyUp = (event: any) => {
        const string = event.target.value
        if (string !== undefined) {
            setTicker(getSymbolId(string, listTicker))
        } else {
            setTicker('0')
        }
    }

    const renderOptionTicker = () => (
        <Autocomplete
            className='ticker-input'
            onChange={handleChangeTicker}
            onKeyUp={handleKeyUp}
            disablePortal
            options={symbolName}
            renderInput={(params) => <TextField {...params} placeholder="Search" />}
        />
    )

    const handleSelectTicker = () => {
        handleTicker(ticker);
    }

    const _renderTemplate = () => (
        <div className="row g-2 align-items-end" onKeyDown={handleSelectTicker}>
            <div className="col-lg-2 col-md-3 mb-1 mb-md-0">
                <label className="d-block text-secondary">Ticker <span className="text-danger ">*</span></label>
            </div>
            <div className="col-lg-3 col-md-6">
                {renderOptionTicker()}
            </div>
            <div className="col-lg-1 col-md-3 mb-2 mb-md-0 ">
                <a href="# " className="btn btn-sm d-block btn-primary-custom" onClick={handleSelectTicker}><strong>Search</strong></a>
            </div>
            <div className="col-lg-6">
                {_renderRecentSearch()}
            </div>
        </div>
    )

    return <div className="card-body bg-gradient-light">
        {_renderTemplate()}
    </div>
}

TickerSearch.defaultProps = defaultProps;

export default TickerSearch