export const ROUTER = [
    {
        link: '/',
        icon: 'icon bi bi-app-indicator me-1',
        name: 'Dashboard',
        children: []
    },
    {
        link: '/news',
        icon: 'icon bi bi-card-text me-1',
        name: 'News',
        children: []
    },
    {
        link: '/orders',
        icon: 'icon bi bi-clipboard me-1',
        name: 'Order',
        children: [
            {
                link: '/orders/monitoring',
                icon: '',
                name: 'Order Monitoring'
            },
            {
                link: '/orders/history',
                icon: '',
                name: 'Order History'
            },
            {
                link: '/orders/tradeHistory',
                icon: '',
                name: 'Trade History'
            },
            {
                link: '/orders/porfolio',
                icon: '',
                name: 'Portfolio'
            },
            {
                link: '/orders/new',
                icon: '',
                name: 'New'
            },
            {
                link: '/orders/modify-cancel',
                icon: '',
                name: 'Modify - Cancel Order'
            }
        ]
    },
    {
        link: '/customerInfo',
        icon: 'icon bi bi-person-workspace me-1',
        name: 'Customer Infomation',
        children: []
    },
    {
        link: '/report',
        icon: 'icon bi bi-clipboard-data me-1',
        name: 'Report',
        children: []
    }
];

export const ROUTE_NAME = {
    dashboard: 'dashboard',
    news: 'news',
    order: 'orders',
    custome: 'customerInfo',
    report: 'report'
};
