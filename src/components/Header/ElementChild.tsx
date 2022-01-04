import PropTypes from 'prop-types'
import { useState } from 'react'
import { IChildRoute } from '../../constants/route.interface'

const ElementChild = (props: any) => {
    const [data, setData] = useState(props.data)

    const _renderListChildMenu = (data: IChildRoute[]) => (
        data.map((item: IChildRoute, index: number) => (
            <li key={index}><a className="dropdown-item" href={item.link}>{item.name}</a></li>
        ))
    )

    return <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
        {_renderListChildMenu(data)}
    </ul>
}

ElementChild.protoType = {
    data: PropTypes.array,
}

ElementChild.defaultProps = {
    data: []
}

export default ElementChild