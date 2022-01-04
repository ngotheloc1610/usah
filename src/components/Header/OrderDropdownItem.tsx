import PropTypes from 'prop-types'
import { useState } from 'react'
import { IOrderDropdownModel } from '../../constants/route.interface'

interface IOrderDropdownItem {
    item: IOrderDropdownModel[];
}

const defaultProps: IOrderDropdownItem = {
    item: []
};

const OrderDropdownItem = (props: IOrderDropdownItem) => {
    const { item } = props;

    const _renderListChildMenu = (data: IOrderDropdownModel[]) => (
        data.map((item: IOrderDropdownModel, index: number) => (
            <li key={index}><a className="dropdown-item" href={item.navigation}>{item.title}</a></li>
        ))
    )

    return (
        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
            {_renderListChildMenu(item)}
        </ul>
    )
}
OrderDropdownItem.defaultProps = defaultProps;
export default OrderDropdownItem