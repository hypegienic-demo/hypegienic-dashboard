import * as React from 'react'
import {RouteComponentProps} from 'react-router'
import {Router, Switch, Route} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import CssBaseline from '@mui/material/CssBaseline'

import Async from './async'
import AppPage, {paths as appPaths} from './app-page'
import {useAuthenticationState} from '../store/authentication'

const authenticationPage = () => import(/* webpackChunkName:'authentication-page' */ './authentication-page')
const invoiceViewerPage = () => import(/* webpackChunkName:'invoice-viewer-page' */ './app-page/sale-page/invoice-viewer')
const notFoundPage = () => import(/* webpackChunkName:'404-page' */ './404-page')

export const history = createBrowserHistory()
const RouterApp:React.FunctionComponent = () => {
  const [authenticationState] = useAuthenticationState()

  const redirectAuthentication = () => {
    const pathname = history.location.pathname
    const {authenticated, authenticatingResult} = authenticationState
    if(
      ['/', '/login'].includes(pathname) &&
      authenticated !== null &&
      !authenticatingResult
    ) {
      history.push('/app')
    } else if(
      (pathname === '/' ||
      pathname.startsWith('/app')) &&
      authenticated === null
    ) {
      history.push('/login')
    }
  }
  redirectAuthentication()
  React.useEffect(redirectAuthentication, [
    authenticationState.authenticated,
    authenticationState.authenticatingResult
  ])
  return (
    <>
      <CssBaseline/>
      <Router history={history}>
        <Switch>
          <Route exact strict path={`/login`} render={(routeComponentProps:RouteComponentProps<any>) =>
            <Async module={authenticationPage} props={routeComponentProps}/>
          }/>
          <Route exact strict path={appPaths} render={() =>
            <AppPage/>
          }/>
          <Route exact strict path={`/app/sales/invoice/:requestId(\\d+)`} render={(routeComponentProps:RouteComponentProps<any>) =>
            <Async module={invoiceViewerPage} props={routeComponentProps}/>
          }/>
          <Route path='*' render={(routeComponentProps:RouteComponentProps<any>) =>
            <Async module={notFoundPage} props={routeComponentProps}/>
          }/>
        </Switch>
      </Router>
    </>
  )
}

export default RouterApp