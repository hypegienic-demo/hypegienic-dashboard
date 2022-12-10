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

import {useRequestState, OrdersRequestDetailed} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'
import CurrencyTextField from '../../common/text-field/currency'

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
const AddPaymentDialog:React.FunctionComponent<AddPaymentDialogProps> = (props) => {
  const [state, setState] = React.useState<AddPaymentDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [, {addPayment}] = useRequestState()

  React.useEffect(() => {
    if(props.request !== undefined) {
      setState(state => ({
        ...state,
        form: {
          ...state.form,
          datetime: new Date()
        }
      }))
    }
  }, [props.request])
  React.useEffect(() => {
    setTimeout(() => state.updateHeight?.())
  }, [state.updateHeight, state.form.reference])

  const setInputRef:(label:keyof AddPaymentDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const focusNext = (label:keyof AddPaymentDialogState['fields']) => {
    const inputs = [
      'type' as const,
      'amount' as const,
      'reference' as const,
      'datetime' as const
    ].filter(label => {
      const field = state.fields[label]
      return field && !field.disabled
    })
    const nextLabel = inputs[inputs.indexOf(label) + 1]
    if(nextLabel) {
      focusInput(nextLabel)
    } else {
      next()
    }
  }
  const focusInput = (label:keyof AddPaymentDialogState['fields']) => {
    state.fields[label]?.focus()
  }

  const onChangeForm = (form:Partial<AddPaymentDialogState['form']>) => {
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
    const {request} = props
    if(state.step === 0) {
      const {type, amount, reference} = state.form
      if(!['cash', 'bank-transfer', 'credit-debit-card', 'cheque'].includes(type?? '')) {
        setError('Please choose a valid payment type')
      } else if(!amount) {
        setError('Please set a valid payment amount')
      } else if(['bank-transfer', 'credit-debit-card', 'cheque'].includes(type?? '') && !reference) {
        setError('Please add a reference')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1 && request) {
      const {type, amount, reference, datetime} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await addPayment({
          requestId: request.id,
          payment: {
            type: type?? '',
            amount: amount?? 0,
            reference,
            time: datetime?.toISOString()
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
  const back = async() => {
    if(state.step > 0) {
      setState(state => ({
        ...state,
        step: state.step - 1
      }))
    }
  }

  const {request, onClose} = props
  const {step, form, loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <Dialog open={!!request}
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
                  Add Payment
                </Typography>
              </div>
              <div className={classes.formFields}>
                <FormControl variant='outlined'
                  size='small' fullWidth
                  classes={{root:classes.formField}}
                >
                  <InputLabel id='payment-type-label'>Type</InputLabel>
                  <Select
                    labelId='payment-type-label'
                    value={form.type?? ''}
                    onChange={event => onChangeForm({
                      type: event.target.value as string
                    })}
                    label='Type'
                    onSubmit={() => {
                      if(!loading) {
                        focusNext('type')
                      }
                    }}
                  >
                    {[{
                      key: 'cash',
                      display: 'Cash'
                    }, {
                      key: 'bank-transfer',
                      display: 'Bank Transfer'
                    }, {
                      key: 'credit-debit-card',
                      display: 'Credit/Debit Card'
                    }, {
                      key: 'cheque',
                      display: 'Cheque'
                    }].map(store => (
                      <MenuItem key={store.key} value={store.key}>
                        {store.display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <CurrencyTextField
                  inputRef={setInputRef('amount')}
                  label='Amount'
                  value={form.amount?? ''}
                  onChange={event => {
                    const value = parseFloat(event.target.value.replace(/[^0-9]/g, '')?? '')
                    onChangeForm({
                      amount: !isNaN(value)? value:undefined
                    })
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
                <TextField
                  inputRef={setInputRef('reference')}
                  label='Reference'
                  value={form.reference?? ''}
                  disabled={!form.type || !['bank-transfer', 'credit-debit-card', 'cheque'].includes(form.type)}
                  onChange={event => onChangeForm({
                    reference: event.target.value
                  })}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('reference')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  fullWidth
                  multiline
                  classes={{root:classes.formField}}
                />
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
                    minDateTime={request?.invoice.time}
                    maxDateTime={new Date()}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Confirm Payment
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.orderCardContent}}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant='h6' color='textPrimary'>
                        {form.type?.slice(0, 1).toUpperCase()}
                        {form.type?.slice(1).split('-').join(' ')}
                      </Typography>
                      <Typography variant='h6' color='textPrimary'>
                        RM{displayCurrency(form.amount?? 0)}
                      </Typography>
                    </div>
                    <Typography color='textSecondary'>
                      {form.reference}
                    </Typography>
                  </CardContent>
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
type AddPaymentDialogProps = {
  request?: OrdersRequestDetailed
  onClose: () => void
}
type AddPaymentDialogState = {
  step: number
  form: {
    type?: string
    amount?: number
    reference?: string
    datetime?: Date
  }
  fields: {
    type?: HTMLInputElement
    amount?: HTMLInputElement
    reference?: HTMLInputElement
    datetime?: HTMLInputElement
  }
  updateHeight?: () => void
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default AddPaymentDialog