export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  requiresProfessor?: boolean
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
     {
      name: 'search-by-group',
      displayName: 'menu.searchByGroup',
      meta: {
        icon: 'vuestic-iconset-graph',
      },
      requiresProfessor: true,
    }
  ] as INavigationRoute[],
}
