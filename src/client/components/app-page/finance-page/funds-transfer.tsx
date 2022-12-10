import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import ArrowIcon from '@mui/icons-material/ArrowForward'

import {useStoreState, StoreDetailed} from '../../../store/store'
import {displayCurrency} from '../../../utility/string'
import CurrencyTextField from '../../common/text-field/currency'
import FileField from '../../common/text-field/file' 

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    padding: '0 !important'
  },
  content: {
    padding: '24px 32px 8px'
  },
  titleSection: {
    paddingBottom: '8px'
  },
  title: {
    fontWeight: 600
  },
  formFields: {
    padding: '0 0 16px'
  },
  formFieldCards: {
    marginLeft: '-8px',
    marginRight: '-8px',
    padding: '0 0 16px'
  },
  formField: {
    marginBottom: '12px !important'
  },
  orderCardContent: {
    padding: '8px !important',
    '&:last-child': {
      paddingBottom: '12px !important'
    }
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '8px 24px 12px'
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const SlideUpTransition = React.forwardRef((props:TransitionProps, ref) =>
  <Slide direction='up' ref={ref} {...props}/>
)
const FundsTransferDialog:React.FunctionComponent<FundsTransferDialogProps> = (props) => {
  const [state, setState] = React.useState<FundsTransferDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [, {addTransaction}] = useStoreState()

  React.useEffect(() => {
    if(props.store !== undefined) {
      setState(state => ({
        ...state,
        form: {
          ...state.form,
          datetime: new Date()
        }
      }))
    }
  }, [props.store])
  React.useEffect(() => {
    setTimeout(() => state.updateHeight?.())
  }, [
    state.updateHeight,
    state.form.remark,
    state.form.attachments
  ])

  const setInputRef:(label:keyof FundsTransferDialogState['fields']) => React.Ref<HTMLInputElement> =
    React.useCallback(label => (input:HTMLInputElement) => {
      if(input && !state.fields[label]) {
        setState(state => ({
          ...state,
          fields: {
            ...state.fields,
            [label]: input
          }
        }))
      }
    }, [state.fields])
  const onSwipeableAction = (hooks:{updateHeight:() => void}) => {
    setState(state => ({
      ...state,
      updateHeight: hooks.updateHeight
    }))
  }
  const focusNext = (label:keyof FundsTransferDialogState['fields']) => {
    const [inputs1, inputs2] = [
      [
        'from' as const,
        'to' as const,
        'amount' as const,
      ],
      [
        'datetime' as const,
        'remark' as const,
        'attachments' as const
      ]
    ].map((inputs:(keyof FundsTransferDialogState['fields'])[]) =>
      inputs.filter(label => {
        const field = state.fields[label]
        return field && !field.disabled
      })
    )
    const nextLabel = inputs1.indexOf(label) >= 0
      ? inputs1[inputs1.indexOf(label) + 1]
      : inputs2[inputs2.indexOf(label) + 1]
    if(nextLabel) {
      focusInput(nextLabel)
    } else {
      next()
    }
  }
  const focusInput = (label:keyof FundsTransferDialogState['fields']) => {
    state.fields[label]?.focus()
  }

  const onChangeForm = (form:Partial<FundsTransferDialogState['form']>) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        ...form
      }
    }))
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
  const next = async() => {
    const {store} = props
    if(state.step === 0 && store) {
      const {from, to} = state.form
      const amount = form.amount
        ? parseFloat(form.amount.replace(/[^0-9\.]/g, ''))
        : 0
      if(!['cash', 'bank', 'payment-gateway'].includes(from?? '')) {
        setError('Please choose a valid source')
      } else if(!['cash', 'bank', 'payment-gateway'].includes(to?? '')) {
        setError('Please set a valid destination')
      } else if(amount === undefined || amount <= 0) {
        setError('Please set a valid amount')
      } else if(
        (from === 'cash' && store.balance.cash < amount) ||
        (from === 'bank' && store.balance.bank < amount) ||
        (from === 'payment-gateway' && store.balance.paymentGateway < amount)
      ) {
        setError('Theres insufficient balance in the source to continue')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1) {
      setState(state => ({
        ...state,
        step: 2
      }))
    } else if(state.step === 2 && store) {
      const {amount, from, to, datetime, remark, attachments} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await addTransaction({
          transaction: 'transfer',
          amount: amount? parseFloat(amount.replace(/[^0-9\.]/g, '')):0,
          remark: remark?? '',
          attachments: attachments?? [],
          time: datetime,
          from: {
            storeId: store.id,
            balance: from?? 'cash'
          },
          to: {
            storeId: store.id,
            balance: to?? 'cash'
          }
        })
        setState(state => ({
          ...state,
          step: 0,
          form: {},
          loading: false
        }))
        props.onClose()
      } catch(error:any) {
        setError(error.message)
      }
    }
  }
  const back = () => {
    if(state.step > 0) {
      setState(state => ({
        ...state,
        step: state.step - 1
      }))
    }
  }

  const {store, onClose} = props
  const {step, form, loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <Dialog open={!!store}
        TransitionComponent={SlideUpTransition}
        onClose={onClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled
            {...{action:onSwipeableAction} as any}
          >
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Funds Transfer
                </Typography>
              </div>
              <div className={classes.formFields}>
                <FormControl variant='outlined'
                  size='small' fullWidth
                  classes={{root:classes.formField}}
                >
                  <InputLabel id='source-label'>From</InputLabel>
                  <Select
                    labelId='source-label'
                    value={form.from?? ''}
                    onChange={event => onChangeForm({
                      from: event.target.value as 'cash' | 'bank' | 'payment-gateway'
                    })}
                    label='From'
                    onSubmit={() => {
                      if(!loading) {
                        focusNext('from')
                      }
                    }}
                  >
                    {[{
                      key: 'cash',
                      display: 'Cash'
                    }, {
                      key: 'bank',
                      display: 'Bank'
                    }, {
                      key: 'payment-gateway',
                      display: 'Payment gateway'
                    }].map(source => (
                      <MenuItem key={source.key} value={source.key}
                        disabled={form.to === source.key}
                      >
                        {source.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant='outlined'
                  size='small' fullWidth
                  classes={{root:classes.formField}}
                >
                  <InputLabel id='destination-label'>To</InputLabel>
                  <Select
                    labelId='destination-label'
                    value={form.to?? ''}
                    onChange={event => onChangeForm({
                      to: event.target.value as 'cash' | 'bank' | 'payment-gateway'
                    })}
                    label='To'
                    onSubmit={() => {
                      if(!loading) {
                        focusNext('to')
                      }
                    }}
                  >
                    {[{
                      key: 'cash',
                      display: 'Cash'
                    }, {
                      key: 'bank',
                      display: 'Bank'
                    }, {
                      key: 'payment-gateway',
                      display: 'Payment gateway'
                    }].map(destination => (
                      <MenuItem key={destination.key} value={destination.key}
                        disabled={form.from === destination.key}
                      >
                        {destination.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <CurrencyTextField
                  inputRef={setInputRef('amount')}
                  label='Amount'
                  value={form.amount?? ''}
                  allowDecimal
                  onChange={event => {
                    onChangeForm({amount:event.target.value})
                  }}
                  onKeyPress={event => {
                    if(event.key === 'Enter' && !loading) {
                      focusNext('amount')
                    }
                  }}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('amount')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  fullWidth
                  classes={{root:classes.formField}}
                />
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Edit Detail
                </Typography>
              </div>
              <div className={classes.formFields}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    inputRef={setInputRef('datetime')}
                    label='Date'
                    value={form.datetime}
                    onChange={datetime => onChangeForm({
                      datetime: datetime?? undefined
                    })}
                    renderInput={props =>
                      <TextField
                        {...props}
                        onSubmit={() => {
                          if(!loading) {
                            focusNext('datetime')
                          }
                        }}
                        variant='outlined'
                        size='small'
                        fullWidth
                        classes={{root:classes.formField}}
                      />
                    }
                    maxDateTime={new Date()}
                  />
                </LocalizationProvider>
                <TextField
                  inputRef={setInputRef('remark')}
                  label='Remark'
                  value={form.remark?? ''}
                  onChange={event => onChangeForm({
                    remark: event.target.value
                  })}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('remark')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  fullWidth
                  multiline
                  classes={{root:classes.formField}}
                />
                <FileField
                  inputRef={setInputRef('attachments')}
                  label='Attachments'
                  values={form.attachments}
                  onChange={attachments => onChangeForm({attachments})}
                  extensions={['png', 'jpg', 'jpeg', 'pdf']}
                />
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Confirm Transfer
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.orderCardContent}}>
                    <Typography variant='h6' color='textPrimary'>
                      {store?.name}
                    </Typography>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      columnGap: '8px'
                    }}>
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: '8px'
                      }}>
                        <Typography variant='h6' color='textPrimary'>
                          {form.from?.slice(0, 1).toUpperCase()}
                          {form.from?.slice(1).replace('-', ' ')}
                        </Typography>
                        <ArrowIcon width={16} height={16}/>
                        <Typography variant='h6' color='textPrimary'>
                          {form.to?.slice(0, 1).toUpperCase()}
                          {form.to?.slice(1).replace('-', ' ')}
                        </Typography>
                      </div>
                      <Typography variant='h6' color='textPrimary'>
                        RM{displayCurrency(
                          form.amount
                            ? parseFloat(form.amount.replace(/[^0-9\.]/g, ''))
                            : 0,
                          {decimal:2}
                        )}
                      </Typography>
                    </div>
                    <Typography color='textSecondary'>
                      {form.remark}
                    </Typography>
                  </CardContent>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowY: 'auto'
                  }}>
                    {form.attachments?.map((file, index) => {
                      if(file.type.startsWith('image')) {
                        const source = URL.createObjectURL(file)
                        return (
                          <div key={index} style={{
                            height: '160px',
                            width: '240px',
                            minWidth: '240px',
                            background: `url("${source}") center/contain no-repeat`
                          }}/>
                        )
                      } else {
                        return (
                          <div key={index} style={{
                            height: '160px',
                            width: '240px',
                            minWidth: '240px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(34, 39, 51, 0.1)'
                          }}>
                            <Typography variant='h6' color='textSecondary'>
                              {file.type.split('/').slice(1)[0]}
                            </Typography>
                          </div>
                        )
                      }
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </SwipeableViews>
        </DialogContent>
        <Divider/>
        <DialogActions classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled>
            {[
              {primary:'Continue'},
              {primary:'Continue', secondary:'Back'},
              {primary:'Confirm', secondary:'Back'}
            ].map((buttons, index) => (
              <div key={index} className={classes.footer}>
                <ButtonGroup>
                  {buttons.secondary? (
                    <Button variant='outlined' color='inherit' size='large'
                      onClick={back}
                    >
                      {buttons.secondary}
                    </Button>
                  ):undefined}
                  <LoadingButton variant='contained' color='primary' size='large' disableElevation
                    onClick={next}
                    loading={loading}
                  >
                    {buttons.primary}
                  </LoadingButton>
                </ButtonGroup>
              </div>
            ))}
          </SwipeableViews>
        </DialogActions>
      </Dialog>
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
type FundsTransferDialogProps = {
  store?: StoreDetailed
  onClose: () => void
}
type FundsTransferDialogState = {
  step: number
  form: {
    from?: 'cash' | 'bank' | 'payment-gateway'
    to?: 'cash' | 'bank' | 'payment-gateway'
    amount?: string
    datetime?: Date
    remark?: string
    attachments?: File[]
  }
  fields: {
    from?: HTMLSelectElement
    to?: HTMLSelectElement
    amount?: HTMLInputElement
    datetime?: HTMLInputElement
    remark?: HTMLInputElement
    attachments?: HTMLInputElement
  }
  updateHeight?: () => void
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default FundsTransferDialog