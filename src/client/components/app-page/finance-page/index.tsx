import * as React from 'react'
import {useHistory} from 'react-router'
import {Theme} from '@mui/material/styles'
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
import Button from '@mui/material/Button'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import Snackbar from '@mui/material/Snackbar'
import ArrowRightIcon from '@mui/icons-material/ArrowRightAlt'
import TransferIcon from '@mui/icons-material/SwapVert'
import ListIcon from '@mui/icons-material/List'
import {XYChart, Curve} from '@visx/visx'

import socket from '../../../store/socket'
import {useScreenState} from '../../../store/screen'
import {useAuthenticationState} from '../../../store/authentication'
import {useStoreState} from '../../../store/store'
import {displayCurrency} from '../../../utility/string'
import {displayDate} from '../../../utility/date'
import {sideBarWidth, RoutePageProps} from '..'
import FundsAddDialog from './funds-add'
import FundsSubtractDialog from './funds-subtract'
import FundsTransferDialog from './funds-transfer'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    width: '100%',
    height: '100%',
    overflow: 'auto'
  },
  errorPage: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '100%',
    maxWidth: '840px',
    padding: '48px 40px',
    margin: '0 auto',
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  header: {
    transition: theme.transitions.create(['opacity', 'transform']),
  },
  divider: {
    margin: '32px 0 !important'
  },
  subtitleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px !important'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform']),
    marginBottom: '8px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    }
  },
  statCardContent: {
    padding: '7px 15px !important',
    '&:last-child': {
      paddingBottom: '12px !important'
    }
  },
  graphs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '8px',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform'])
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8px',
    margin: '12px 0'
  },
  button: {
    minWidth: '0 !important',
    borderRadius: '20px !important'
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      marginRight: '0'
    }
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
  fabAction: {
    color: 'rgb(255, 255, 255) !important',
    backgroundColor: 'rgb(99, 99, 99) !important'
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const ServicePage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<ServicePageState>({
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{profile}, {displayProfile}] = useAuthenticationState()
  const [{selectedStore, simplifiedStores, detailedStores}, {selectStore, displayStores, displayStore}] = useStoreState()
  const currentPath = `/app/finance`
  const history = useHistory()

  React.useEffect(() => {
    const display = async() => {
      try {
        const profile = await displayProfile()
        if(profile.employee === 'admin') {
          const stores = await displayStores()
          const store = stores[0]
          if(typeof selectedStore === 'undefined' && store) {
            selectStore(store.id)
          }
        }
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
  }, [])
  React.useEffect(() => {
    const display = async() => {
      try {
        if(typeof selectedStore === 'string') {
          await displayStore(selectedStore)
        }
        setState(state => ({...state, loading:false}))
        socket.on('block-added', async() => {
          if(typeof selectedStore === 'string') {
            await displayStore(selectedStore)
          }
        })
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
    return () => {
      socket.off('block-added')
    }
  }, [selectedStore])

  const selectChangeStore = (event:SelectChangeEvent) => {
    selectStore(event.target.value)
  }

  const getTransactionsLink = (storeId:string) => {
    return `${currentPath}/${storeId}`
  }
  const openTransactions = (storeId:string) => (event:React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    history.push(getTransactionsLink(storeId))
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

  const closeDialog = () => {
    setState(state => ({
      ...state,
      modal: undefined
    }))
  }
  const openFundsAddDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'funds-add'
      }
    }))
  }
  const openFundsSubtractDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'funds-subtract'
      }
    }))
  }
  const openFundsTransferDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'funds-transfer'
      }
    }))
  }

  const {setScrollTarget} = props
  const {modal, loading, error} = state
  const classes = useStyles({})
  const smallScreen = screenType === 'xs-phone'
  const store = selectedStore? detailedStores?.[selectedStore]:undefined
  const now = new Date()
  return (
    <>
      {profile?.employee === 'admin'? (
        <div className={classes.page}
          ref={setScrollTarget}
        >
          <div className={classes.container}>
            <div className={classes.header}
              style={loading
                ? {opacity:0, transform:'translateY(32px)'}
                : {opacity:1}
              }
            >
              <Toolbar/>
              <Typography variant='h3' gutterBottom>
                Finance
              </Typography>
              <Typography variant='body1' gutterBottom>
                This is where you can monitor the health of your stores
              </Typography>
              <Divider classes={{root:classes.divider}}/>
              <div className={classes.subtitleRow} style={{
                flexDirection: smallScreen? 'column':'row'
              }}>
                <Typography variant='h4'>
                  Statistics
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
              <div className={classes.stats}
                style={loading
                  ? {opacity:0, transform:'translateY(32px)'}
                  : {opacity:1}
                }
              >
                {[{
                  label: 'Cash',
                  value: store?.balance.cash
                }, {
                  label: 'Bank',
                  value: store?.balance.bank
                }, {
                  label: 'Payment Gateway',
                  value: store?.balance.paymentGateway
                }].map(detail => (
                  <Card key={detail.label} variant='outlined'>
                    <CardContent classes={{root:classes.statCardContent}}>
                      <Typography color='textSecondary'>
                        {detail.label}
                      </Typography>
                      <Typography variant='h6'>
                        {typeof detail.value === 'number'
                          ? `RM${displayCurrency(detail.value, {decimal:2})}`
                          : 'RM0'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className={classes.graphs}
                style={loading
                  ? {opacity:0, transform:'translateY(32px)'}
                  : {opacity:1}
                }
              >
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.statCardContent}}>
                    <Typography color='textSecondary'>
                      Profit/Expense
                    </Typography>
                    {store? (
                      <XYChart.XYChart height={320} xScale={{type:'band'}} yScale={{type:'linear'}}
                        theme={XYChart.buildChartTheme({
                          ...XYChart.lightTheme,
                          colors: ['rgb(102, 187, 106)', 'rgb(211, 47, 47)']
                        } as any)}
                      >
                        <XYChart.Axis orientation='left'/>
                        <XYChart.Axis orientation='bottom'/>
                        <XYChart.LineSeries
                          dataKey='Profit'
                          data={Array(5).fill(undefined)
                            .map((_, index) => {
                              const date = new Date()
                              date.setMonth(now.getMonth() - (4 - index))
                              return date
                            })
                            .map<{x:string, y:number}>(date => {
                              const profit = store.transactions
                                .filter(transaction =>
                                  transaction.type === 'profit' &&
                                  transaction.time.getMonth() === date.getMonth()
                                )
                                .reduce((profit, transaction) => profit + transaction.amount, 0)
                              return {
                                x: displayDate(date, smallScreen? 'MM':'MMM, yyyy'),
                                y: profit
                              }
                            })
                          }
                          xAccessor={(data:any) => data.x}
                          yAccessor={(data:any) => data.y}
                          curve={Curve.curveCardinal}
                        />
                        <XYChart.LineSeries
                          dataKey='Expense'
                          data={Array(5).fill(undefined)
                            .map((_, index) => {
                              const date = new Date()
                              date.setMonth(now.getMonth() - (4 - index))
                              return date
                            })
                            .map<{x:string, y:number}>(date => {
                              const profit = store.transactions
                                .filter(transaction =>
                                  transaction.type === 'expense' &&
                                  transaction.time.getMonth() === date.getMonth()
                                )
                                .reduce((profit, transaction) => profit + transaction.amount, 0)
                              return {
                                x: displayDate(date, smallScreen? 'MM':'MMM, yyyy'),
                                y: profit
                              }
                            })
                          }
                          xAccessor={(data:any) => data.x}
                          yAccessor={(data:any) => data.y}
                          curve={Curve.curveCardinal}
                        />
                      </XYChart.XYChart>
                    ):undefined}
                  </CardContent>
                </Card>
              </div>
              <div className={classes.buttons}>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  href={selectedStore? getTransactionsLink(selectedStore):undefined}
                  onClick={selectedStore? openTransactions(selectedStore):undefined}
                >
                  <ListIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'View transactions':undefined}
                </Button>
              </div>
            </div>
            <div className={classes.fabContainer}>
              <SpeedDial
                ariaLabel='Add'
                icon={<SpeedDialIcon />}
                classes={{root:classes.fab}}
              >
                {[{
                  icon: <TransferIcon/>,
                  name: 'Transfer',
                  onClick: openFundsTransferDialog
                }, {
                  icon: <ArrowRightIcon style={{transform:'rotate(-90deg)'}}/>,
                  name: 'Outflow',
                  onClick: openFundsSubtractDialog
                }, {
                  icon: <ArrowRightIcon style={{transform:'rotate(90deg)'}}/>,
                  name: 'Inflow',
                  onClick: openFundsAddDialog
                }].map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    tooltipOpen
                    onClick={action.onClick}
                    classes={{
                      fab: classes.fabAction,
                      staticTooltipLabel: classes.fabAction
                    }}
                  />
                ))}
              </SpeedDial>
            </div>
          </div>
        </div>
      ):(
        <div className={classes.errorPage}>
          <Typography color='textPrimary' variant='h5'>
            UNAUTHORIZED
          </Typography>
        </div>
      )}
      <FundsAddDialog
        store={modal?.type === 'funds-add'? store:undefined}
        onClose={closeDialog}
      />
      <FundsSubtractDialog
        store={modal?.type === 'funds-subtract'? store:undefined}
        onClose={closeDialog}
      />
      <FundsTransferDialog
        store={modal?.type === 'funds-transfer'? store:undefined}
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
type ServicePageState = {
  modal?:
    | {
        type: 'funds-add'
      }
    | {
        type: 'funds-subtract'
      }
    | {
        type: 'funds-transfer'
      }
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default ServicePage