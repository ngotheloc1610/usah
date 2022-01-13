import * as React from 'react';
import { IOrderDropdownModel } from '../../constants/route.interface';
import OrderDropdownItem from './OrderDropdownItem';

export interface ITabBarItem {
    itemDropDown?: IOrderDropdownModel,
    itemData?: IOrderDropdownModel
}


const TabBarItem = (props: ITabBarItem) => {
    const { itemDropDown, itemData } = props;
    const [activeElement, setActiveElement] = React.useState('');

    React.useEffect(() => {
        handleActive();
    }, [])


    const handleActive = () => {
        const currentUrl = window.location.pathname;
        setActiveElement(currentUrl);
    }

    const _renderTabBar = () => (

        <li className="nav-item" >
            <a href={itemData?.navigation} className={activeElement === itemData?.navigation ? 'nav-link active' : 'nav-link color-not-active'}>
                <i className={itemData?.icon}></i>
                <span className="d-none d-lg-inline-block">{itemData?.title}</span>
            </a>
        </li>
    )

    const _renderDropDown = () => (
        <li className="nav-item dropdown" >
            <a className="nav-link dropdown-toggle color-not-active" role="button" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i className={itemDropDown?.icon}></i>
                <span className="d-none d-lg-inline-block">{itemDropDown?.title}</span></a>
            <OrderDropdownItem item={itemDropDown?.subTab} />
        </li>
    )

    return (
        <div>
            {itemDropDown !== undefined && _renderDropDown()}
            {itemDropDown === undefined && _renderTabBar()}
        </div>
    )

}

TabBarItem.defaultProps = {
    itemDropDown: undefined,
    itemData: undefined
}

export default TabBarItem