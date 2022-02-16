export const ROUTER = [
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
                navigation: '/orders/portfolio',
                icon: '',
                title: 'Portfolio',
                subTab: []
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
                        navigation: '/order/multi-modify',
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
    },
    {
        navigation: '/customerInfo',
        icon: 'icon bi bi-person-workspace me-1',
        title: 'Customer Infomation',
        subTab: []
    },
    {
        navigation: '/report',
        icon: 'icon bi bi-clipboard-data me-1',
        title: 'Report',
        subTab: []
    }
];

