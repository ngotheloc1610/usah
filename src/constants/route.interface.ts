export interface IRouter {
    link: string;
    icon: string;
    name: string;
    children: IChildRoute[];
}

export interface IChildRoute {
    link: string;
    icon: string;
    name: string;
}

