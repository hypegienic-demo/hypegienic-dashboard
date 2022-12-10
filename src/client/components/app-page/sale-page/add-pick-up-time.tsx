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
import DatePicker from '@mui/lab/DatePicker'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrdersRequestDetailed} from '../../../store/request'
import {displayDate} from '../../../utility/date'

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
const AddPickUpTimeDialog:React.FunctionComponent<AddPickUpTimeDialogProps> = (props) => {
  const [state, setState] = React.useState<AddPickUpTimeDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [, {updatePickUpTime}] = useRequestState()

  React.useEffect(() => {
    if(props.request !== undefined) {
      setState(state => ({
        ...state,
        form: {
          ...state.form,
          datetime: props.request?.pickUpTime?? new Date()
        }
      }))
    }
  }, [props.request])

  const setInputRef:(label:keyof AddPickUpTimeDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const focusNext = (label:keyof AddPickUpTimeDialogState['fields']) => {
    const inputs = [
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
  const focusInput = (label:keyof AddPickUpTimeDialogState['fields']) => {
    state.fields[label]?.focus()
  }

  const onChangeForm = (form:Partial<AddPickUpTimeDialogState['form']>) => {
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
      const {datetime} = state.form
      if(request?.pickUpTime && datetime &&
        displayDate(request.pickUpTime) === displayDate(datetime)
      ) {
        setError('Please choose a different pick up date')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1 && request) {
      const {datetime} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await updatePickUpTime({
          requestId: request.id,
          time: datetime?.toISOString()?? ''
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
          <SwipeableViews index={step} animateHeight disabled>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Add Pick Up Time
                </Typography>
              </div>
              <div className={classes.formFields}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
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
                    minDate={request?.invoice.time}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Confirm Pick Up Time
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.orderCardContent}}>
                    <Typography variant='h6' color='textPrimary'>
                      {form.datetime? displayDate(form.datetime):''}
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
type AddPickUpTimeDialogProps = {
  request?: OrdersRequestDetailed
  onClose: () => void
}
type AddPickUpTimeDialogState = {
  step: number
  form: {
    datetime?: Date
  }
  fields: {
    datetime?: HTMLInputElement
  }
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default AddPickUpTimeDialog