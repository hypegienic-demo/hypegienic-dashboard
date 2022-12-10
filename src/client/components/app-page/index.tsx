import * as React from 'react'
import {RouteComponentProps, matchPath} from 'react-router'
import {Router, Switch, Route, useHistory} from 'react-router-dom'
import {useTheme, Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Hidden from '@mui/material/Hidden'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Slide from '@mui/material/Slide'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Input from '@mui/material/Input'
import Popover from '@mui/material/Popover'
import MenuIcon from '@mui/icons-material/Menu'
import ProfileIcon from '@mui/icons-material/AccountCircleOutlined'
import SearchIcon from '@mui/icons-material/Search'

import {history} from '../'
import Async from '../async'
import socket from '../../store/socket'
import {useAuthenticationState} from '../../store/authentication'
import {conformToMobileNumber} from '../common/text-field/mobile-number'

export type RoutePageProps<T extends HTMLElement> = RouteComponentProps & {
  setScrollTarget: React.Ref<T>
  searchQuery: string
}

const mainPage = () => import(/* webpackChunkName:'main-page' */ './main-page')
const financePage = () => import(/* webpackChunkName:'finance-page' */ './finance-page')
const transactionsPage = () => import(/* webpackChunkName:'transactions-page' */ './finance-page/transactions')
const serviceProductPage = () => import(/* webpackChunkName:'service-product-page' */ './service-product-page')
const userPage = () => import(/* webpackChunkName:'user-page' */ './user-page')
const salePage = () => import(/* webpackChunkName:'sale-page' */ './sale-page')
const addRequestPage = () => import(/* webpackChunkName:'add-request-page' */ './sale-page/add-request')
const saleDetailPage = () => import(/* webpackChunkName:'sale-detail-page' */ './sale-page/request-detail')

const currentPath = '/app'
const routes = [{
  title: '',
  paths: [{
    urls: [''],
    page: mainPage
  }]
}, {
  title: 'Finance',
  paths: [{
    urls: ['/finance'],
    page: financePage
  }, {
    urls: ['/finance/:storeId(\\d+)'],
    page: transactionsPage
  }]
}, {
  title: 'Services & Products',
  paths: [{
    urls: ['/service-product'],
    page: serviceProductPage
  }]
}, {
  title: 'Users',
  paths: [{
    urls: ['/user', '/user/add', '/user/:userId(\\d+)'],
    page: userPage
  }]
}, {
  title: 'Sales',
  paths: [{
    urls: ['/sales'],
    page: salePage
  }, {
    urls: ['/sales/add/:storeId(\\d+)', '/sales/add/:storeId(\\d+)/customer', '/sales/add/:storeId(\\d+)/order', '/sales/add/:storeId(\\d+)/product'],
    page: addRequestPage
  }, {
    urls: ['/sales/:requestId(\\d+)', '/sales/:requestId(\\d+)/:orderId(\\d+)'],
    page: saleDetailPage
  }]
}]
export const paths = routes
  .flatMap(route =>
    route.paths.flatMap(path => path.urls.map(url => currentPath + url))
  )

export const sideBarWidth = 260
const useStyles = makeStyles((theme:Theme) => ({
  container: {
    width: '100%',
    height: '100vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row'
  },
  appBarIcon: {
    transition: theme.transitions.create(['transform'])
  },
  sideBarContainer: {
    position: 'relative',
    zIndex: 30
  },
  sideBar: {
    width: `${sideBarWidth}px`,
    height: '100%',
    flexShrink: 0,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)'
  },
  logo: {
    fontWeight: 600,
    cursor: 'pointer'
  },
  sideBarHeader: {
    padding: '24px 24px 0'
  },
  sideBarContent: {
    transition: theme.transitions.create(['opacity', 'transform'])
  },
  sideBarButton: {
    padding: '8px 24px !important',
    color: 'rgb(97, 97, 97) !important',
    '&:hover': {
      color: 'rgb(33, 33, 33) !important'
    }
  },
  sideBarButtonSelected: {
    '& span': {
      color: 'rgb(33, 33, 33)',
      fontWeight: 600
    }
  },
  content: {
    position: 'relative',
    flex: 1,
    transition: theme.transitions.create(['opacity', 'transform']),
    overflow: 'hidden'
  },
  profilePopOut: {
    width: '280px'
  },
  profilePopOutTextContent: {
    padding: '16px 24px'
  }
}))
const AppPage:React.FunctionComponent = () => {
  const routeHistory = useHistory()
  const [state, setState] = React.useState<AppPageState>({
    sideBarOpen: false,
    searchBarOpen: false,
    searchQuery: '',
    loading: true
  })
  const [authenticationState, {
    signOut,
    displayProfile
  }] = useAuthenticationState()

  React.useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])
  React.useEffect(() => {
    const display = async() => {
      try {
        await displayProfile()
        setState(state => ({...state, loading:false}))
      } catch {}
    }
    display()
  }, [authenticationState.authenticated])
  React.useEffect(() => {
    setState(state => ({...state, scrollContent:undefined}))
  }, [routeHistory.location.pathname])
  React.useEffect(() => {
    const {searchInput, searchBarOpen} = state
    if(searchInput && searchBarOpen) {
      searchInput.focus()
    }
  }, [state.searchInput, state.searchBarOpen])

  const setScrollContentRef:React.Ref<HTMLElement> = React.useCallback((scrollContent:HTMLElement) => {
    if(scrollContent && !state.scrollContent) {
      setState(state => ({...state, scrollContent}))
    }
  }, [state.scrollContent])
  const setSearchIconRef:React.Ref<HTMLElement> = React.useCallback((searchIcon:HTMLElement) => {
    if(searchIcon && !state.searchIcon) {
      setState(state => ({...state, searchIcon}))
    }
  }, [state.searchIcon])
  const setSearchInputRef:React.Ref<HTMLInputElement> = React.useCallback((searchInput:HTMLInputElement) => {
    if(searchInput && !state.searchInput) {
      setState(state => ({...state, searchInput}))
    }
  }, [state.searchInput])


  const goToRoute = (route:string) => (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    setState(state => ({
      ...state,
      sideBarOpen: false
    }))
    routeHistory.push(route)
  }

  const toggleDrawer = (open:boolean) => (
    event: React.KeyboardEvent | React.MouseEvent | React.TouchEvent
  ) => {
    const keyboardEvent = event?.type === 'keydown'
      ? event as React.KeyboardEvent
      : undefined
    if(
      keyboardEvent?.key === 'Tab' ||
      keyboardEvent?.key === 'Shift'
    ) {
      return
    }
    setState(state => ({...state, sideBarOpen:open}))
  }
  const toggleProfile = (open:boolean) => (
    event: React.KeyboardEvent | React.MouseEvent | React.TouchEvent
  ) => {
    setState(state => ({
      ...state,
      profileAnchor: open && event?.type === 'click'
        ? (event as React.MouseEvent<HTMLDivElement>).currentTarget
        : undefined
    }))
  }
  const toggleSearchBar = (open:boolean) => (
    event: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent
  ) => {
    setState(state => ({
      ...state,
      searchBarOpen: open
    }))
  }

  const updateSearchQuery = (event:React.ChangeEvent<HTMLInputElement>) => {
    setState(state => ({
      ...state,
      searchQuery: event.target.value
    }))
  }

  const {sideBarOpen, searchBarOpen, scrollContent, profileAnchor, searchIcon, searchQuery, loading} = state
  const {profile} = authenticationState
  const classes = useStyles({})
  const theme = useTheme<Theme>()
  const employee = profile?.employee?? 'unauthorized'
  const mapRoute = (route:typeof routes[0]) => {
    const pathnames = route.paths.flatMap(path =>
      path.urls.map(url => currentPath + url)
    )
    return (
      <ListItem key={route.paths.flatMap(path => path.urls).join('|')}
        button dense
        selected={pathnames.some(path =>
          matchPath(
            routeHistory.location.pathname,
            {path, exact:true, strict:true}
          )?.isExact?? false
        )}
        onClick={goToRoute(pathnames[0])}
        classes={{
          button: classes.sideBarButton,
          selected: classes.sideBarButtonSelected
        }}
      >
        <ListItemText primary={route.title}/>
      </ListItem>
    )
  }
  const sideBar = (
    <>
      <Toolbar>
        <a href={currentPath}
          onClick={goToRoute(currentPath)}
          style={{
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          <Typography variant='h6' classes={{root:classes.logo}}>
            HYPEGUARDIAN
          </Typography>
        </a>
      </Toolbar>
      <Divider/>
      <div className={classes.sideBarContent}
        style={loading
          ? {opacity:0, transform:'translateY(32px)'}
          : {opacity:1}
        }
      >
        {['admin'].includes(employee)? (
          <>
            <div className={classes.sideBarHeader}>
              <Typography variant='h6'>Monitor</Typography>
            </div>
            <List>
              {routes.slice(1, 2).map(mapRoute)}
            </List>
          </>
        ):undefined}
        {['admin', 'staff'].includes(employee)? (
          <>
            <div className={classes.sideBarHeader}>
              <Typography variant='h6'>Manage</Typography>
            </div>
            <List>
              {routes.slice(2).map(mapRoute)}
            </List>
          </>
        ):undefined}
      </div>
    </>
  )
  const hideSearchIcon = routeHistory.location.pathname === currentPath
  const renderToolbar = (clipped:boolean, child:JSX.Element) => (
    <Toolbar style={{
      backgroundColor: clipped
        ? 'rgb(255, 255, 255)'
        : 'rgb(33, 33, 33)',
      clipPath: clipped && searchIcon
        ? (searchBarOpen
            ? `circle(100vw at ${searchIcon.offsetLeft + searchIcon.offsetWidth / 2}px ${searchIcon.offsetTop + searchIcon.offsetHeight / 2}px)`
            : `circle(0 at ${searchIcon.offsetLeft + searchIcon.offsetWidth / 2}px ${searchIcon.offsetTop + searchIcon.offsetHeight / 2}px)`
          )
        : undefined,
      transition: clipped
        ? theme.transitions.create(['clip-path'], {
            duration: 320
          })
        : undefined
    }}>
      <Hidden lgUp>
        <IconButton edge='start' color='inherit'
          onClick={toggleDrawer(!sideBarOpen)}
          style={{
            color: clipped
              ? 'rgb(33, 33, 33)'
              : 'rgb(255, 255, 255)'
          }}
        >
          <MenuIcon/>
        </IconButton>
      </Hidden>
      <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: clipped
          ? 'rgb(33, 33, 33)'
          : 'rgb(255, 255, 255)'
      }}>
        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          {child}
        </div>
        <IconButton edge='end' color='inherit'
          ref={!clipped? setSearchIconRef:undefined}
          onClick={toggleSearchBar(true)}
          classes={{root:classes.appBarIcon}}
          style={{
            transform: hideSearchIcon
              ? 'scale(0)'
              : 'scale(1)',
            pointerEvents: hideSearchIcon? 'none':'all'
          }}
        >
          <SearchIcon/>
        </IconButton>
        <IconButton edge='end' color='inherit'
          onClick={toggleProfile(true)}
        >
          <ProfileIcon/>
        </IconButton>
      </div>
    </Toolbar>
  )
  return (
    <div className={classes.container}>
      <ClickAwayListener onClickAway={toggleSearchBar(false)}>
        <Slide direction='down' in={!useScrollTrigger({target:scrollContent})}>
          <AppBar style={{
            overflow: 'hidden'
          }}>
            <div style={{position:'relative'}}>
              {renderToolbar(false, (
                <a href={currentPath}
                  onClick={goToRoute(currentPath)}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none'
                  }}
                >
                  <Typography variant='h6' classes={{root:classes.logo}}>
                    HYPEGUARDIAN
                  </Typography>
                </a>
              ))}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: '0',
                pointerEvents: !searchBarOpen
                  ? 'none'
                  : 'all'
              }}>
                {renderToolbar(true, (
                  <Input disableUnderline fullWidth
                    value={searchQuery}
                    onChange={updateSearchQuery}
                    inputRef={setSearchInputRef}
                  />
                ))}
              </div>
            </div>
          </AppBar>
        </Slide>
      </ClickAwayListener>
      <nav className={classes.sideBarContainer}>
        <Hidden lgUp>
          <SwipeableDrawer
            anchor='left'
            open={sideBarOpen}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
            classes={{paper:classes.sideBar}}
            ModalProps={{keepMounted:true}}
          >
            {sideBar}
          </SwipeableDrawer>
        </Hidden>
        <Hidden mdDown>
          <Drawer
            variant='permanent'
            open
            classes={{
              root: classes.sideBar,
              paper: classes.sideBar
            }}
          >
            {sideBar}
          </Drawer>
        </Hidden>
      </nav>
      <Popover
        open={!!profileAnchor}
        anchorEl={profileAnchor}
        anchorOrigin={{vertical:'bottom', horizontal:'right'}}
        transformOrigin={{vertical:'top', horizontal:'right'}}
        onClose={toggleProfile(false)}
        classes={{paper:classes.profilePopOut}}
        elevation={3}
      >
        {profile? (
          <div className={classes.profilePopOutTextContent}>
            <Typography variant='h6'>{profile.displayName}</Typography>
            <Typography color='textSecondary'>{employee}</Typography>
            <Typography variant='caption' component='p' color='textSecondary'>{conformToMobileNumber(profile.mobileNumber)}</Typography>
            <Typography variant='caption' component='p' color='textSecondary'>{profile.email}</Typography>
          </div>
        ):undefined}
        <Divider/>
        <List>
          <ListItem
            button dense
            onClick={signOut}
            classes={{button:classes.sideBarButton}}
          >
            <ListItemText primary='Log out'/>
          </ListItem>
        </List>
      </Popover>
      <div className={classes.content} style={{
        minHeight: '100%',
        ...loading
          ? {opacity:0, transform:'translateY(32px)'}
          : {opacity:1}
      }}>
        {!loading
          ? (
              <Router history={history}>
                <Switch>
                  {routes.flatMap(route =>
                    route.paths.map(path => (
                      <Route exact strict key={path.urls.join('|')}
                        path={path.urls.map(path => currentPath + path)}
                        render={(routeComponentProps:RouteComponentProps<any>) =>
                          <Async module={path.page} props={{
                            ...routeComponentProps,
                            setScrollTarget: setScrollContentRef,
                            searchQuery: searchQuery.toLowerCase()
                          }}/>
                        }
                      />
                    )
                  ))}
                </Switch>
              </Router>
            )
          : undefined
        }
      </div>
      {searchBarOpen? (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}/>
      ):undefined}
    </div>
  )
}
type AppPageState = {
  sideBarOpen: boolean
  searchBarOpen: boolean
  scrollContent?: HTMLElement
  searchIcon?: HTMLElement
  searchInput?: HTMLInputElement
  profileAnchor?: HTMLDivElement
  searchQuery: string
  loading: boolean
}

export default AppPage