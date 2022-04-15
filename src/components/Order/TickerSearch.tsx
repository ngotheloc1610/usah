import { ISymbolList } from '../../interfaces/ticker.interface'
import '../../pages/Orders/OrderNew/OrderNew.scss'
import { useEffect, useState } from "react";
import { Autocomplete, TextField } from '@mui/material';
import { LIST_TICKER_INFO, SYMBOL_LIST } from '../../constants/general.constant';
import ReduxPersist from '../../config/ReduxPersist';
import { ITickerBindingOrder, ITickerInfo } from '../../interfaces/order.interface';
interface ITickerSearch {
    handleTicker: (event: any) => void;
    listTicker: ISymbolList[];
}

const defaultProps = {
    handleTicker: null
}

const TickerSearch = (props: ITickerSearch) => {
    const { handleTicker, listTicker } = props;
    const [ticker, setTicker] = useState('')
    const [listSymbolCode, setListSymbolCode] = useState<string[]>([]);
    const [symbolsLocals, setSymbolsLocals] = useState<ITickerBindingOrder[]>([]);
    const [symbolSelected, setSymbolSeleted] = useState('');

    useEffect(() => {
        setSymbolsLocals(JSON.parse(localStorage.getItem(SYMBOL_LIST) || '[{}]'));
        const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        const listSymbolCode: string[] = [];
        tickerList.forEach((item: ISymbolList) => {
            const displayText = `${item.symbolCode} - ${item.symbolName}`;
            listSymbolCode.push(displayText);
        });
        if (listSymbolCode && listSymbolCode.length > 0) {
            setSymbolSeleted(listSymbolCode[0]);
        }
        setListSymbolCode(listSymbolCode);
    }, [])

    useEffect(() => {
        const symbolCode = symbolSelected?.split('-')[0]?.trim();
        const itemTickerInfor = listTicker.find(item => item.symbolCode === symbolCode?.toUpperCase());
        setTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
        handleTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
    }, [symbolSelected, listTicker]);

    const handleSymbols = (symbolCode: string) => {
        const tickerList = JSON.parse(localStorage.getItem(LIST_TICKER_INFO) || '[{}]');
        const element = tickerList.find(o => o?.symbolCode === symbolCode);
        if (element) {
            setTicker(element.symbolCode);
            handleTicker(element.symbolCode);
        }
        setSymbolSeleted(`${symbolCode} - ${element.symbolName}`)
    }

    const _renderRecentSearch = () => {
        if (symbolsLocals[0]?.symbolCode) {
            return symbolsLocals.map((ite: ITickerBindingOrder, index: number) =>
                (<a key={index} href="# " onClick={() => handleSymbols(ite.symbolCode)} className='color-primary mr-10'><span title={ite.symbolName}>{ite.symbolCode}</span></a>))
        } else {
            return <></>
        }
    }

    const getTickerSearch = (e: any) => {
        if (e.key !== 'Enter') {
            const symbolCode = e.target.innerText !== undefined ? e.target.innerText?.split('-')[0]?.trim() : '';
            setSymbolSeleted(e.target?.innerText);
            const itemTickerInfor = listTicker.find(item => item.symbolCode === symbolCode?.toUpperCase());
            storageSymbolList(symbolCode?.split('-')[0]?.trim(), e.target.innerText?.split('-')[1]?.trim());
            setTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
            handleTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
        }
    }

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            const symbolCode = event.target.value.split('-')[0]?.trim();
            setSymbolSeleted(event.target.value);
            storageSymbolList(event.target.value?.split('-')[0]?.trim(), event.target.value?.split('-')[1]?.trim());
            const itemTickerInfor = listTicker.find(item => item.symbolCode === symbolCode.toUpperCase());
            setTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
            handleTicker(itemTickerInfor ? itemTickerInfor.symbolCode : '');
        }
    }

    const storageSymbolList = (symbolCode: string, symbolName: string) => {
        ReduxPersist.storeConfig.storage.getItem(SYMBOL_LIST).then(resp => {
            const symbols: any = [];
            if (resp) {
                const lstSymbols = JSON.parse(resp);
                const item = lstSymbols.find(o => o.symbolCode === symbolCode);
                if (!item && symbolCode && symbolName) {
                    let newLstSymbols = lstSymbols.length > 2 ? lstSymbols.splice(1, 2) : lstSymbols;
                    newLstSymbols.push({
                        symbolCode: symbolCode,
                        symbolName: symbolName
                    });
                    ReduxPersist.storeConfig.storage.setItem(SYMBOL_LIST, JSON.stringify(newLstSymbols));
                    setSymbolsLocals(JSON.parse(localStorage.getItem(SYMBOL_LIST) || '[{}]'))
                }
            } else {
                const obj = {
                    symbolCode: symbolCode,
                    symbolName: symbolName
                }
                symbols.push(obj);
                ReduxPersist.storeConfig.storage.setItem(SYMBOL_LIST, JSON.stringify(symbols));
                setSymbolsLocals(JSON.parse(localStorage.getItem(SYMBOL_LIST) || '[{}]'))
            }
        });
    }

    const _renderTemplate = () => (
        <div className="row g-2 align-items-end" >
            <div className="col-xl-2 col-lg-2 col-md-2 mb-1 mb-md-0">
                <label className="d-block text-secondary">Ticker <span className="text-danger ">*</span></label>
            </div>
            <div className="col-xl-4 col-lg-5 col-md-7">
                <Autocomplete
                    onChange={getTickerSearch}
                    onKeyUp={handleKeyUp}
                    disablePortal
                    options={listSymbolCode}
                    value={symbolSelected}
                    sx={{ width: 350 }}
                    renderInput={(params) => <TextField {...params} placeholder="Search Ticker" />}
                />
            </div>
            <div className="col-xl-6 col-lg-5 col-md-3">
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