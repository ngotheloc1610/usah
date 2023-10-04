export const ROUTER_MONITORING = [
    {
        navigation: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/',
        icon: 'icon bi bi-app-indicator me-1',
        title: 'Dashboard',
        subTab: []
    },
    {
        navigation: `${process.env.PUBLIC_URL}/news`,
        icon: 'icon bi bi-card-text me-1',
        title: 'News',
        subTab: []
    },
    {
        navigation: `${process.env.PUBLIC_URL}/orders`,
        icon: 'icon bi bi-clipboard me-1',
        title: 'Order',
        subTab: [
            {
                navigation: `${process.env.PUBLIC_URL}/orders/big-order-monitoring`,
                icon: '',
                title: 'Big Order Monitoring',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/monitoring`,
                icon: '',
                title: 'Order Monitoring',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/history`,
                icon: '',
                title: 'Order History',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/tradeHistory`,
                icon: '',
                title: 'Trade History',
                subTab: []
            },
            {
                navigation: '',
                icon: '',
                title: 'Summary',
                subTab: [
                    {
                        navigation: `${process.env.PUBLIC_URL}/orders/summary-trading`,
                        icon: '',
                        title: 'Summary Trading',
                        subTab: [],
                    },
                    {
                        navigation: `${process.env.PUBLIC_URL}/orders/multi-trader-control`,
                        icon: '',
                        title: 'Multi Trader Control',
                        subTab: [],
                    },
                ]
            },
            {
                navigation: `${process.env.PUBLIC_URL}/order-book`,
                icon: '',
                title: 'Order Book',
                subTab: []
            },
            {
                navigation: '',
                icon: '',
                title: 'New Order',
                subTab: [
                    {
                        navigation: `${process.env.PUBLIC_URL}/orders/new`,
                        icon: '',
                        title: 'Single Order',
                        subTab: [],
                    },
                    {
                        navigation: `${process.env.PUBLIC_URL}/order/multi-orders`,
                        icon: '',
                        title: 'Multiple Order',
                        subTab: [],
                    }
                ]
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/modify-cancel`,
                icon: '',
                title: 'Modify - Cancel Order',
                subTab: []
            }
        ]
    }
    // BA said: function report in POEM Square don't use but in My Page Square can use it.
    // {
    //     navigation: '/report',
    //     icon: 'icon bi bi-clipboard-data me-1',
    //     title: 'Report',
    //     subTab: []
    // }
];

export const ROUTER_TRADER = [
    {
        navigation: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/',
        icon: 'icon bi bi-app-indicator me-1',
        title: 'Dashboard',
        subTab: []
    },
    {
        navigation: `${process.env.PUBLIC_URL}/news`,
        icon: 'icon bi bi-card-text me-1',
        title: 'News',
        subTab: []
    },
    {
        navigation: `${process.env.PUBLIC_URL}/orders`,
        icon: 'icon bi bi-clipboard me-1',
        title: 'Order',
        subTab: [
            {
                navigation: `${process.env.PUBLIC_URL}/orders/big-order-monitoring`,
                icon: '',
                title: 'Big Order Monitoring',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/monitoring`,
                icon: '',
                title: 'Order Monitoring',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/history`,
                icon: '',
                title: 'Order History',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/tradeHistory`,
                icon: '',
                title: 'Trade History',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/summary-trading`,
                icon: '',
                title: 'Summary Trading',
                subTab: []
            },
            {
                navigation: `${process.env.PUBLIC_URL}/order-book`,
                icon: '',
                title: 'Order Book',
                subTab: []
            },
            {
                navigation: '',
                icon: '',
                title: 'New Order',
                subTab: [
                    {
                        navigation: `${process.env.PUBLIC_URL}/orders/new`,
                        icon: '',
                        title: 'Single Order',
                        subTab: [],
                    },
                    {
                        navigation: `${process.env.PUBLIC_URL}/order/multi-orders`,
                        icon: '',
                        title: 'Multiple Order',
                        subTab: [],
                    }
                ]
            },
            {
                navigation: `${process.env.PUBLIC_URL}/orders/modify-cancel`,
                icon: '',
                title: 'Modify - Cancel Order',
                subTab: []
            }
        ]
    }
];