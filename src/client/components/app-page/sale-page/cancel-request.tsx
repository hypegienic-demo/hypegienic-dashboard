import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrdersRequestDetailed} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'

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
  text: {
    lineHeight: '1.2 !important'
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
    display: 'flex',
    flexDirection: 'column',
    padding: '7px 15px !important',
    '&:last-child': {
      paddingBottom: '11px !important'
    },
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }
  },
  orderService: {
    display: 'grid',
    columnGap: '8px',
    gridTemplateColumns: '2fr 1fr',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: '1fr',
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
const CancelRequestDialog:React.FunctionComponent<CancelRequestDialogProps> = (props) => {
  const [state, setState] = React.useState<CancelRequestDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [, {cancelRequest}] = useRequestState()

  React.useEffect(() => {
    setTimeout(() => state.updateHeight?.())
  }, [state.updateHeight])

  const setInputRef:(label:keyof CancelRequestDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const focusNext = (label:keyof CancelRequestDialogState['fields']) => {
    const inputs = [
      'request' as const
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
  const focusInput = (label:keyof CancelRequestDialogState['fields']) => {
    state.fields[label]?.focus()
  }

  const onChangeForm = (form:Partial<CancelRequestDialogState['form']>) => {
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
      const {request:requestId} = state.form
      if(requestId !== request?.invoice.number.toString()) {
        setError('Please enter the invoice number to continue')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1 && request) {
      setState(state => ({...state, loading:true}))
      try {
        await cancelRequest({
          requestId: request.id
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
                  classes={{root:classes.title}}
                >
                  Cancel Sales
                </Typography>
                <Typography variant='body1' color='textSecondary'
                  gutterBottom
                >
                  {request?.invoice.number} to cancelled, note that this process is irreversible.
                </Typography>
                <Typography variant='body1' color='textSecondary'
                  gutterBottom
                >
                  Please write <strong>{request?.invoice.number}</strong> in the input below to continue.
                </Typography>
              </div>
              <div className={classes.formFields}>
                <TextField
                  inputRef={setInputRef('request')}
                  label='Invoice number'
                  value={form.request?? ''}
                  onChange={event => onChangeForm({
                    request: event.target.value
                  })}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('request')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  fullWidth
                  multiline
                  classes={{root:classes.formField}}
                />
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Confirm Cancellation
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  {request?.orders.map((order, index) => (
                    <CardContent key={index} classes={{root:classes.orderCardContent}}>
                      <Typography variant='h6'>
                        {order.name}
                      </Typography>
                      {order.services.map((service) => (
                        <div key={service.id} className={classes.orderService}>
                          <Typography>
                            {service.name}
                          </Typography>
                          <Typography color='textSecondary'>
                            RM{displayCurrency(
                              service.assignedPrice,
                              {decimal:2}
                            )}
                          </Typography>
                        </div>
                      ))}
                    </CardContent>
                  ))}
                  {request?.products.map((product, index) => (
                    <CardContent key={index} classes={{root:classes.orderCardContent}}>
                      <div key={product.id} className={classes.orderService}>
                        <Typography>
                          {product.name}
                        </Typography>
                        <Typography color='textSecondary'>
                          {product.quantity + ' × '}
                          RM{displayCurrency(product.assignedPrice, {decimal:2})}
                        </Typography>
                      </div>
                    </CardContent>
                  ))}
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
type CancelRequestDialogProps = {
  request?: OrdersRequestDetailed
  onClose: () => void
}
type CancelRequestDialogState = {
  step: number
  form: {
    request?: string
  }
  fields: {
    request?: HTMLInputElement
  }
  updateHeight?: () => void
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default CancelRequestDialog