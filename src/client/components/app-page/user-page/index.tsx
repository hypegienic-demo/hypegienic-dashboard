import * as React from 'react'
import {useParams, useHistory, useRouteMatch} from 'react-router'
import {VariableSizeGrid} from 'react-window'
import {useTheme, Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Fab from '@mui/material/Fab'
import Snackbar from '@mui/material/Snackbar'
import AddIcon from '@mui/icons-material/Add'

import socket from '../../../store/socket'
import {useScreenState, ScreenType} from '../../../store/screen'
import {useUserState, User} from '../../../store/user'
import {highlightQuery} from '../../../utility/query'
import {conformToMobileNumber} from '../../common/text-field/mobile-number'
import AddUserDialog from './add-user'
import UpdateUserDialog from './update-user'
import {sideBarWidth, RoutePageProps} from '../'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    width: '100%',
    maxWidth: '840px',
    padding: '0 40px',
    margin: '0 auto',
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  header: {
    position: 'absolute',
    width: 'calc(100% - 80px)',
    maxWidth: '760px',
    paddingTop: '48px'
  },
  body: {
    minHeight: '100%',
  },
  divider: {
    margin: '32px 0 !important'
  },
  users: {
    paddingBottom: '104px',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform']),
  },
  userCardContent: {
    padding: '7px 15px !important',
    '&:last-child': {
      paddingBottom: '11px !important'
    }
  },
  detail: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  fabContainer: {
    position: 'fixed',
    bottom: '0',
    width: 'calc(100% - 80px)',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '32px 0',
    pointerEvents: 'none',
    zIndex: 300,
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      width: 'calc(100% - 300px)'
    }
  },
  fab: {
    pointerEvents: 'all',
    transition: theme.transitions.create(['transform'])
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const UserProfile:React.FC<UserProfileProps> = ({columnIndex, rowIndex, data, style}) => {
  const classes = useStyles({})
  const theme = useTheme<Theme>()
  const smallScreen = data.screenType === 'xs-phone'
  const user = data.filteredUsers?.[
    columnIndex + (rowIndex - 1) * (smallScreen? 1:3)
  ]
  return user && data.header
    ? (
        <a key={user.id}
          href={data.getEditingUserLink(user.id)}
          onClick={data.openEditingUser(user.id)}
          style={{
            ...style,
            left: data.header.offsetLeft + 
              columnIndex * ((smallScreen? data.width:((data.width - 16) / 3)) + 8),
            textDecoration: 'none'
          }}
        >
          <Card variant='outlined' style={{
            height: (
              typeof style.height === 'string'
                ? parseFloat(style.height)
                : style.height?? 0
            ) - 8
          }}>
            <CardContent classes={{root:classes.userCardContent}}>
              <Typography variant='h6'
                className={classes.detail}
              >
                {highlightQuery(user.displayName, data.searchQuery, theme.palette.secondary.main)}
              </Typography>
              <Typography
                className={classes.detail}
              >
                {user.employee? 'Staff':'Customer'}
              </Typography>
              <Typography color='textSecondary'
                className={classes.detail}
              >
                {highlightQuery(
                  conformToMobileNumber(user.mobileNumber),
                  data.searchQuery,
                  theme.palette.secondary.main,
                  {ignored:'\\s\\-'}
                )}
              </Typography>
              {user.email? (
                <Typography color='textSecondary'
                  className={classes.detail}
                >
                  {highlightQuery(user.email, data.searchQuery, theme.palette.secondary.main)}
                </Typography>
              ):undefined}
            </CardContent>
          </Card>
        </a>
      )
    : columnIndex + rowIndex === 0 && data.header
    ? (
        <div key='header'
          style={{
            ...style,
            top: 48,
            left: data.header.offsetLeft + 16,
            height: data.header.clientHeight,
            width: data.width - 32
          }}
        >
          {data.headerContent}
        </div>
      )
    : null
}
type UserProfileProps = {
  columnIndex: number
  rowIndex: number
  data: UserProfileData
  style: React.CSSProperties
}
type UserProfileData = {
  width: number
  screenType: ScreenType
  header: HTMLDivElement
  headerContent: JSX.Element
  filteredUsers: User[]
  searchQuery: string
  getEditingUserLink: (userId:string) => string
  openEditingUser: (userId:string) => (event:React.MouseEvent | React.TouchEvent) => void
}
const UserPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<UserPageState>({
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{users}, {displayUsers}] = useUserState()
  const history = useHistory()
  const {userId} = useParams<{userId?:string}>()
  const currentPath = '/app/user'
  const addingUser = useRouteMatch(`${currentPath}/add`)?.isExact?? false
  const updatingUser = useRouteMatch(`${currentPath}/:userId(\\d+)`)?.isExact
    ? users?.find(user => user.id === userId)
    : undefined

  React.useEffect(() => {
    const display = async() => {
      try {
        await displayUsers()
        setState(state => ({...state, loading:false}))
        socket.on('user-added', displayUsers)
        socket.on('user-updated', displayUsers)
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
    const resizeListener = () => setState(state => ({...state}))
    window.addEventListener('resize', resizeListener)
    return () => {
      socket.off('user-added')
      socket.off('user-updated')
      window.removeEventListener('resize', resizeListener)
    }
  }, [])

  const setHeaderRef:React.Ref<HTMLDivElement> = React.useCallback((header:HTMLDivElement) => {
    if(header && !state.header) {
      setState(state => ({...state, header}))
    }
  }, [state.header])
  const setBodyRef:React.Ref<HTMLDivElement> = React.useCallback((body:HTMLDivElement) => {
    if(body && !state.body) {
      setState(state => ({...state, body}))
    }
  }, [state.body])

  const getAddingUserLink = () => {
    return `${currentPath}/add`
  }
  const openAddingUser = (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    history.push(getAddingUserLink())
  }
  const getEditingUserLink = (userId:string) => {
    return `${currentPath}/${userId}`
  }
  const openEditingUser = (userId:string) => (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    history.push(getEditingUserLink(userId))
  }
  const closeDialog = () => {
    history.push(currentPath)
  }

  const removeError = () => {
    setState(state => ({
      ...state,
      error: state.error
        ? {...state.error, open:false}
        : undefined
    }))
  }
  const setError = (error:string) =>
    setState(state => ({
      ...state,
      loading: false,
      error: {
        open: true,
        message: error
      }
    }))

  const {setScrollTarget, searchQuery} = props
  const {header, body, loading, error} = state
  const classes = useStyles({})
  const smallScreen = screenType === 'xs-phone'
  const filteredUsers = users?.filter(user =>
    [
      user.displayName,
      user.mobileNumber,
      user.email
    ].some(property =>
      property?.toLowerCase().includes(searchQuery)?? false
    )
  )
  const headerContent = (
    <>
      <Toolbar/>
      <Typography variant='h3' gutterBottom>
        Users
      </Typography>
      <Typography variant='body1' gutterBottom>
        This is where all our registered users are stored, user needs to be created
        before a sales can be recorded.
      </Typography>
      <Divider classes={{root:classes.divider}}/>
      <Typography variant='h4' gutterBottom>
        Users
      </Typography>
    </>
  )
  return (
    <>
      <div className={classes.page}>
        <div className={classes.header} ref={setHeaderRef} style={{
          pointerEvents: 'none',
          opacity: 0,
        }}>
          {headerContent}
        </div>
        <div className={classes.fabContainer}>
          <Fab color='primary'
            classes={{root:classes.fab}}
            style={loading
              ? {transform:'scale(0)'}
              : {}
            }
            href={getAddingUserLink()}
            onClick={openAddingUser}
          >
            <AddIcon/>
          </Fab>
        </div>
      </div>
      <div className={classes.body} ref={setBodyRef}>
        {header && body? (() => {
          const width = Math.min(
            header.clientWidth + 32,
            window.innerWidth - 48
          )
          const height = body.clientHeight
          return (
            <VariableSizeGrid
              outerRef={setScrollTarget}
              className={classes.users}
              style={loading
                ? {opacity:0, transform:'translateY(32px)'}
                : {}
              }
              width={screenType === 'lg-desktop'
                ? window.innerWidth + 16 - sideBarWidth
                : window.innerWidth + 16
              }
              height={height}
              itemData={{
                width: width?? 0,
                screenType,
                header,
                headerContent,
                filteredUsers: filteredUsers?? [],
                searchQuery,
                getEditingUserLink,
                openEditingUser
              }}
              columnWidth={index =>
                smallScreen? width:((width - 16) / 3)
              }
              columnCount={smallScreen? 1:3}
              rowHeight={index =>
                index === 0? header.clientHeight:130
              }
              estimatedRowHeight={130}
              rowCount={1 + Math.ceil(
                (filteredUsers?.length?? 0) / (smallScreen? 1:3)
              )}
            >
              {UserProfile}
            </VariableSizeGrid>
          )
        })():undefined}
      </div>
      <AddUserDialog
        open={addingUser}
        onClose={closeDialog}
      />
      <UpdateUserDialog
        user={updatingUser}
        onClose={closeDialog}
      />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={error?.open === true}
        onClose={removeError}
        message={error?.message}
        autoHideDuration={6000}
        classes={{root:classes.snackbar}}
      />
    </>
  )
}
type UserPageState = {
  header?: HTMLDivElement
  body?: HTMLDivElement
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default UserPage