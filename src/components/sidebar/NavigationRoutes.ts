export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'oteador',
      displayName: 'menu.oteador',
      meta: {
        icon: 'vuestic-iconset-components'
      }

    },
    {
      name: 'search-by-user',
      displayName: 'menu.searchByUser',
      meta: {
        icon: 'vuestic-iconset-user',
      },
    },
    {
      name: 'search-by-course',
      displayName: 'menu.searchByCourse',
      meta: {
        icon: 'vuestic-iconset-statistics',
      },
    },
  ] as INavigationRoute[],
}
