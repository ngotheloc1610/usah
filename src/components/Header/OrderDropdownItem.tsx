import { IOrderDropdownModel } from '../../constants/route.interface'

interface IOrderDropdownItem {
    item: IOrderDropdownModel[];
}

const defaultProps: IOrderDropdownItem = {
    item: []
};

const OrderDropdownItem = (props: IOrderDropdownItem) => {
    const { item } = props;

    const _renderListChildMenu = (data: IOrderDropdownModel[]) => {
        return data.map((item: IOrderDropdownModel, index: number) => {
            if (item.subTab.length === 0) {
                return <li key={index}><a className="dropdown-item" href={item.navigation}>{item.title}</a></li>
            }
            return <li key={index} className="dropdown-submenu">
                <a className="dropdown-item">{item.title}</a>
                <ul className="dropdown-menu">
                    {_renderListChildMenu(item.subTab)}
                </ul>
            </li>
        })
    }

    return (
        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
            {_renderListChildMenu(item)}
        </ul>
    )
}
OrderDropdownItem.defaultProps = defaultProps;
export default OrderDropdownItem