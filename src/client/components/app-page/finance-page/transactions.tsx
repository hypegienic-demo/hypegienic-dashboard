import * as React from 'react'
import {useParams, useHistory} from 'react-router'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, {SelectChangeEvent} from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DatePicker from '@mui/lab/DatePicker'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Snackbar from '@mui/material/Snackbar'

import socket from '../../../store/socket'
import {useStoreState, StoreDetailed} from '../../../store/store'
import {displayDate} from '../../../utility/date'
import {displayCurrency} from '../../../utility/string'
import {sideBarWidth, RoutePageProps} from '../'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    height: '100%',
    width: '100%',
    overflow: 'auto'
  },
  container: {
    width: '100%',
    maxWidth: '840px',
    padding: '48px 40px',
    margin: '0 auto',
    transition: theme.transitions.create(['opacity', 'transform']),
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  inputs: {
    flexDirection: 'row',
    gap: '8px',
    marginBottom: '4px'
  },
  input: {
    marginLeft: '8px !important',
    marginBottom: '8px !important'
  },
  card: {
    padding: '8px 0',
    margin: '0 -16px'
  },
  table: {
    minWidth: '600px'
  },
  tableRow: {
    '&:last-child td, &:last-child th': {
      border: '0'
    }
  },
  divider: {
    margin: '32px 0 !important'
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const SaleDetailPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<SaleDetailPageState>({
    range: 'day',
    date: new Date(new Date().setHours(0, 0, 0, 0)),
    loading: true
  })
  const [, {displayTransactions}] = useStoreState()
  const {storeId} = useParams<{storeId:string}>()

  const getDateRange = (range:'month' | 'day', date:Date) => {
    if(range === 'month') {
      return {
        from: new Date(date.getFullYear(), date.getMonth(), 1),
        to: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      }
    } else {
      return {
        from: date,
        to: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }
  }
  React.useEffect(() => {
    const display = async() => {
      try {
        const store = await displayTransactions(storeId,
          getDateRange(state.range, state.date)
        )
        setState(state => ({
          ...state,
          store,
          loading: false
        }))
        socket.on('block-added', async() => {
          const store = await displayTransactions(storeId,
            getDateRange(state.range, state.date)
          )
          setState(state => ({...state, store}))
        })
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
    return () => {
      socket.off('block-added')
    }
  }, [storeId, state.range, state.date])

  const selectRange = (event:SelectChangeEvent) => {
    setState(state => ({
      ...state,
      range: event.target.value as 'month' | 'day'
    }))
  }
  const selectDate = (date:Date | null) => {
    if(date instanceof Date) {
      setState(state => ({
        ...state,
        date
      }))
    }
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

  const {setScrollTarget} = props
  const {store, range, date, loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <div className={classes.page}
        ref={setScrollTarget}
      >
        <div className={classes.container}
          style={loading
            ? {opacity:0, transform:'translateY(32px)'}
            : {opacity:1}
          }
        >
          <Toolbar/>
          {store? (
            <>
              <Typography variant='h3' gutterBottom>
                {store.name}
              </Typography>
              <div className={classes.inputs}>
                <FormControl variant='outlined' size='small'
                  classes={{root:classes.input}}
                  style={{maxWidth:'calc(100vw - 80px)'}}
                >
                  <InputLabel id='date-range-label'>Range</InputLabel>
                  <Select
                    labelId='date-range-label'
                    value={range}
                    onChange={selectRange}
                    label='Range'
                  >
                    {[{
                      key: 'month',
                      display: 'Monthly'
                    }, {
                      key: 'day',
                      display: 'Daily'
                    }].map(range => (
                      <MenuItem key={range.key} value={range.key}>
                        {range.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label='Date'
                    views={range === 'month'? ['year', 'month']:['year', 'month', 'day']}
                    value={date}
                    onChange={selectDate}
                    renderInput={props =>
                      <TextField
                        {...props}
                        variant='outlined'
                        size='small'
                        classes={{root:classes.input}}
                      />
                    }
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </div>
              <Card variant='outlined' classes={{root:classes.card}}>
                <TableContainer>
                  <Table classes={{root:classes.table}}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell align='right'>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {store.transactions.map(transaction => (
                        <TableRow key={transaction.time.getTime()}
                          classes={{root:classes.tableRow}}
                          style={{backgroundColor:transaction.type === 'profit'
                            ? 'rgb(102, 187, 106, 0.05)'
                            : 'rgb(211, 47, 47, 0.05)'
                          }}
                        >
                          <TableCell component='th' scope='row'>
                            {transaction.detail}
                          </TableCell>
                          <TableCell>{displayDate(transaction.time, 'MMM d, h:mma')}</TableCell>
                          <TableCell align='right'>
                            RM{displayCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </>
          ):undefined}
        </div>
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
type SaleDetailPageState = {
  store?: StoreDetailed
  range: 'month' | 'day'
  date: Date
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default SaleDetailPage