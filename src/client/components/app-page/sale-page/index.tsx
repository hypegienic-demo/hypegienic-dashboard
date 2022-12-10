import * as React from 'react'
import {useHistory} from 'react-router'
import {VariableSizeList} from 'react-window'
import {useTheme, Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, {SelectChangeEvent} from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Fab from '@mui/material/Fab'
import Snackbar from '@mui/material/Snackbar'
import AddIcon from '@mui/icons-material/Add'

import socket from '../../../store/socket'
import {useScreenState} from '../../../store/screen'
import {useStoreState} from '../../../store/store'
import {useRequestState, OrdersRequestSimplified} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'
import {highlightQuery} from '../../../utility/query'
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
  requests: {
    paddingBottom: '104px',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform']),
  },
  request: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 15px 8px',
    rowGap: '8px',
    borderRadius: '4px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    color: 'rgb(34, 39, 51)',
    textDecoration: 'none',
    userSelect: 'none'
  },
  subtitleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px !important'
  },
  customerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  ordersRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    margin: '0 -8px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: '1fr',
    }
  },
  orderCardContent: {
    padding: '7px !important',
    '&:last-child': {
      paddingBottom: '11px !important'
    }
  },
  detail: {
    maxWidth: '100%',
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
const SaleOrdersRequest:React.FC<SaleOrdersRequestProps> = ({index, data, style}) => {
  const classes = useStyles({})
  const theme = useTheme<Theme>()
  const request = data.filteredRequests[index - 1]
  return request && data.header
    ? (
        <a key={request.id} className={classes.request}
          href={data.getSalesDetailLink(request.id)}
          onClick={data.openSalesDetail(request.id)}
          style={{
            ...style,
            left: data.header.offsetLeft,
            height: (
              typeof style.height === 'string'
                ? parseFloat(style.height)
                : style.height?? 0
            ) - 8,
            width: data.width
          }}
        >
          <div className={classes.customerRow}>
            <Typography variant='h5'
              className={classes.detail}
              style={{flex:1}}
            >
              {highlightQuery(request.orderer.displayName, data.searchQuery, theme.palette.secondary.main)}
            </Typography>
            <Typography>
              RM{displayCurrency(request.price - request.paid)}
            </Typography>
          </div>
          <div className={classes.ordersRow}>
            {request.orders.map(order => (
              <Card key={order.id} variant='outlined'>
                <CardContent classes={{root:classes.orderCardContent}}>
                  <Typography variant='h6'
                    className={classes.detail}
                  >
                    {highlightQuery(`${order.id} ${order.name}`, data.searchQuery, theme.palette.secondary.main)}
                  </Typography>
                  <Typography className={classes.detail}>
                    {order.status.slice(0, 1).toUpperCase()}
                    {order.status.slice(1).split('-').join(' ')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </a>
      )
    : index === 0 && data.header 
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
type SaleOrdersRequestProps = {
  index: number
  data: SaleOrdersRequestData
  style: React.CSSProperties
}
type SaleOrdersRequestData = {
  width: number
  header: HTMLDivElement
  headerContent: JSX.Element
  filteredRequests: OrdersRequestSimplified[]
  searchQuery: string
  getSalesDetailLink: (requestId:string) => string
  openSalesDetail: (requestId:string) => (event:React.MouseEvent | React.TouchEvent) => void
}
const SalePage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<SalePageState>({
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{selectedStore, simplifiedStores}, {selectStore, displayStores}] = useStoreState()
  const [{simplifiedRequests:requests}, {displayRequests}] = useRequestState()
  const history = useHistory()
  const currentPath = '/app/sales'

  React.useEffect(() => {
    const display = async() => {
      try {
        const [stores] = await Promise.all([
          displayStores(),
          displayRequests()
        ])
        const store = stores[0]
        if(typeof selectedStore === 'undefined' && store) {
          selectStore(store.id)
        }
        setState(state => ({
          ...state,
          loading: false
        }))
        socket.on('request-added', displayRequests)
        socket.on('request-updated', displayRequests)
        socket.on('order-updated', displayRequests)
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
    return () => {
      socket.off('request-added')
      socket.off('request-updated')
      socket.off('order-updated')
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

  const getAddingSalesLink = () => {
    const store = simplifiedStores?.find(store => store.id === selectedStore)
    return store
      ? `${currentPath}/add/${store.id}`
      : ''
  }
  const openAddingSales = (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    history.push(getAddingSalesLink())
  }
  const getSalesDetailLink = (requestId:string) => {
    return `${currentPath}/${requestId}`
  }
  const openSalesDetail = (requestId:string) => (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    history.push(getSalesDetailLink(requestId))
  }

  const selectChangeStore = (event:SelectChangeEvent) => {
    selectStore(event.target.value)
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
  const filteredRequests = requests
    ?.filter(request =>
      request.store.id === selectedStore
    )
    .filter(request => [
      request.orderer.displayName,
      ...request.orders.map(order =>
        `${order.id} ${order.name}`
      )
    ].some(property =>
      property?.toLowerCase().includes(searchQuery)?? false
    ))
  const headerContent = (
    <>
      <Toolbar/>
      <Typography variant='h3' gutterBottom>
        Sales
      </Typography>
      <Typography variant='body1' gutterBottom>
        This is where all our in-progress orders are stored.
      </Typography>
      <Typography variant='body1' gutterBottom>
        Click into a particular order to update its status.
      </Typography>
      <Divider classes={{root:classes.divider}}/>
      <div className={classes.subtitleRow} style={{
        flexDirection: smallScreen? 'column':'row'
      }}>
        <Typography variant='h4'>
          Orders
        </Typography>
        <FormControl variant='outlined' size='small' style={{
          maxWidth: 'calc(100vw - 80px)'
        }}>
          <InputLabel id='order-store-label'>Store branch</InputLabel>
          <Select
            labelId='order-store-label'
            value={selectedStore?? ''}
            onChange={selectChangeStore}
            label='Store branch'
          >
            {simplifiedStores?.map(store => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  )
  const [width, height] = header && body? [
    Math.min(
      header.clientWidth + 32,
      window.innerWidth - 48
    ),
    body.clientHeight
  ]:[]
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
            href={getAddingSalesLink()}
            onClick={openAddingSales}
          >
            <AddIcon/>
          </Fab>
        </div>
      </div>
      <div className={classes.body} ref={setBodyRef}>
        {header && body? (
          <VariableSizeList
            outerRef={setScrollTarget}
            className={classes.requests}
            style={loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {}
            }
            width={screenType === 'lg-desktop'
              ? window.innerWidth + 16 - sideBarWidth
              : window.innerWidth + 16
            }
            height={height?? 0}
            itemData={{
              width: width?? 0,
              header,
              headerContent,
              filteredRequests: filteredRequests?? [],
              searchQuery,
              getSalesDetailLink,
              openSalesDetail
            }}
            itemSize={index => {
              const request = filteredRequests?.[index - 1]
              if(request) {
                return (smallScreen? 86:62) + (
                  Math.ceil(
                    request.orders.length /
                    (smallScreen? 1:3)
                  ) * 84
                )
              } else if(index === 0) {
                return header.clientHeight
              } else {
                return 0
              }
            }}
            estimatedItemSize={146}
            itemCount={1 + Math.ceil(
              filteredRequests?.length?? 0
            )}
          >
            {SaleOrdersRequest}
          </VariableSizeList>
        ):undefined}
      </div>
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
type SalePageState = {
  header?: HTMLDivElement
  body?: HTMLDivElement
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default SalePage