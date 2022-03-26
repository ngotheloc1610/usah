export const ROUTER_MONITORING = [
    {
        navigation: '/',
        icon: 'icon bi bi-app-indicator me-1',
        title: 'Dashboard',
        subTab: []
    },
    {
        navigation: '/news',
        icon: 'icon bi bi-card-text me-1',
        title: 'News',
        subTab: []
    },
    {
        navigation: '/orders',
        icon: 'icon bi bi-clipboard me-1',
        title: 'Order',
        subTab: [
            {
                navigation: '/orders/monitoring',
                icon: '',
                title: 'Order Monitoring',
                subTab: []
            },
            {
                navigation: '/orders/history',
                icon: '',
                title: 'Order History',
                subTab: []
            },
            {
                navigation: '/orders/tradeHistory',
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
                        navigation: '/orders/portfolio',
                        icon: '',
                        title: 'Summary Trading',
                        subTab: [],
                    },
                    {
                        navigation: '/orders/multi-trader-control',
                        icon: '',
                        title: 'Multi Trader Control',
                        subTab: [],
                    },
                ]
            },
            {
                navigation: '/order-book',
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
                        navigation: '/orders/new',
                        icon: '',
                        title: 'Single Order',
                        subTab: [],
                    },
                    {
                        navigation: '/order/multi-orders',
                        icon: '',
                        title: 'Multiple Order',
                        subTab: [],
                    }
                ]
            },
            {
                navigation: '/orders/modify-cancel',
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
        navigation: '/',
        icon: 'icon bi bi-app-indicator me-1',
        title: 'Dashboard',
        subTab: []
    },
    {
        navigation: '/news',
        icon: 'icon bi bi-card-text me-1',
        title: 'News',
        subTab: []
    },
    {
        navigation: '/orders',
        icon: 'icon bi bi-clipboard me-1',
        title: 'Order',
        subTab: [
            {
                navigation: '/orders/monitoring',
                icon: '',
                title: 'Order Monitoring',
                subTab: []
            },
            {
                navigation: '/orders/history',
                icon: '',
                title: 'Order History',
                subTab: []
            },
            {
                navigation: '/orders/tradeHistory',
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
                        navigation: '/orders/portfolio',
                        icon: '',
                        title: 'Summary Trading',
                        subTab: [],
                    }
                ]
            },
            {
                navigation: '/order-book',
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
                        navigation: '/orders/new',
                        icon: '',
                        title: 'Single Order',
                        subTab: [],
                    },
                    {
                        navigation: '/order/multi-orders',
                        icon: '',
                        title: 'Multiple Order',
                        subTab: [],
                    }
                ]
            },
            {
                navigation: '/orders/modify-cancel',
                icon: '',
                title: 'Modify - Cancel Order',
                subTab: []
            }
        ]
    }
];