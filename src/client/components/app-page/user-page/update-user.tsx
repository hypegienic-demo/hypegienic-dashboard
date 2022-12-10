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
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useUserState, User} from '../../../store/user'
import MobileNumberTextField, {mobileNumberRegExp, conformToMobileNumber} from '../../common/text-field/mobile-number'
import EmailTextField, {emailRegExp} from '../../common/text-field/email'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    padding: '0 !important'
  },
  content: {
    padding: '20px 24px 8px'
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
  userCardContent: {
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
const UpdateUserDialog:React.FunctionComponent<UpdateUserDialogProps> = (props) => {
  const [state, setState] = React.useState<UpdateUserDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [, {updateUser}] = useUserState()

  React.useEffect(() => {
    const {user} = props
    if(user) {
      setState(state => ({
        ...state,
        form: {
          displayName: user.displayName,
          mobileNumber: user.mobileNumber.replace(/^\+60/, ''),
          email: user.email,
          address: user.address
        },
        fields: {}
      }))
    }
  }, [props.user])
  React.useEffect(() => {
    setTimeout(() => state.updateHeight?.())
  }, [state.updateHeight, state.form.address])

  const setInputRef:(label:keyof UpdateUserDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const focusStepInput = async(step:number) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if(step === 0) {
      focusInput('displayName')
    }
  }
  const focusNext = (label:keyof UpdateUserDialogState['fields']) => {
    const inputs = [
      'displayName' as const,
      'mobileNumber' as const,
      'email' as const,
      'address' as const
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
  const focusInput = (label:keyof UpdateUserDialogState['fields']) => {
    state.fields[label]?.focus()
  }
  const onChangeForm = (form:Partial<UpdateUserDialogState['form']>) => {
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
    const {user} = props
    if(state.step === 0) {
      const {displayName, mobileNumber, email} = state.form
      if(!displayName || displayName === '') {
        setError('Please fill in your name first')
        return
      } else if(!mobileNumber || mobileNumber === '') {
        setError('Please fill in mobile number first')
        return
      }
      const cleanedNumber = `+60${mobileNumber.replace(/\D/g, '')}`
      if(!mobileNumberRegExp.test(cleanedNumber)) {
        setError('Please complete mobile number first')
      } else if(!email || email === '') {
        setError('Please fill in your email address first')
      } else if(!emailRegExp.test(email)) {
        setError('Please complete your email address first')
      } else {
        setState(state => ({...state, step:1}))
      }
    } else if(state.step === 1 && user) {
      const {displayName, mobileNumber, email, address} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await updateUser({
          userId: user.id,
          displayName: displayName !== user.displayName
            ? displayName
            : undefined,
          mobileNumber: `+60${mobileNumber?.replace(/\D/g, '')}` !== user.mobileNumber
            ? `+60${mobileNumber?.replace(/\D/g, '')}`
            : undefined,
          email: email !== user.email
            ? email
            : undefined,
          address: address !== user.address && address !== ''
            ? address
            : undefined
        })
        setState(state => ({
          ...state,
          step: 0,
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
      await focusStepInput(state.step - 1)
    }
  }

  const {user, onClose} = props
  const {step, form, loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <Dialog open={!!user}
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
                  Edit User
                </Typography>
              </div>
              <div className={classes.formFields}>
                <TextField
                  inputRef={setInputRef('displayName')}
                  label='Name'
                  value={form.displayName?? ''}
                  onChange={event => onChangeForm({
                    displayName: event.target.value
                  })}
                  onKeyPress={event => {
                    if(event.key === 'Enter' && !loading) {
                      focusNext('displayName')
                    }
                  }}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('displayName')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  autoFocus
                  fullWidth
                  classes={{root:classes.formField}}
                />
                <MobileNumberTextField
                  inputRef={setInputRef('mobileNumber')}
                  label='Mobile Number'
                  value={form.mobileNumber?? ''}
                  onChange={event => onChangeForm({
                    mobileNumber: event.target.value
                  })}
                  onKeyPress={event => {
                    if(event.key === 'Enter' && !loading) {
                      focusNext('mobileNumber')
                    }
                  }}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('mobileNumber')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  disabled={!!user?.firebaseId}
                  fullWidth
                  classes={{root:classes.formField}}
                />
                <EmailTextField
                  inputRef={setInputRef('email')}
                  label='Email Address'
                  value={form.email?? ''}
                  onChange={event => onChangeForm({
                    email: event.target.value
                  })}
                  onKeyPress={event => {
                    if(event.key === 'Enter' && !loading) {
                      focusNext('email')
                    }
                  }}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('email')
                    }
                  }}
                  variant='outlined'
                  size='small'
                  disabled={!!user?.firebaseId}
                  fullWidth
                  classes={{root:classes.formField}}
                />
                <TextField
                  inputRef={setInputRef('address')}
                  label='Home Address'
                  value={form.address?? ''}
                  onChange={event => onChangeForm({
                    address: event.target.value
                  })}
                  onSubmit={() => {
                    if(!loading) {
                      focusNext('address')
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
                  classes={{root:classes.title}} gutterBottom
                >
                  Update User
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.userCardContent}}>
                    <Typography variant='h6' color='textPrimary'>
                      {form.displayName}
                    </Typography>
                    <Typography color='textSecondary'>
                      {conformToMobileNumber(form.mobileNumber?? '')}
                    </Typography>
                    <Typography color='textSecondary'>
                      {form.email}
                    </Typography>
                    <Typography color='textSecondary'>
                      {form.address}
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
type UpdateUserDialogProps = {
  user?: User
  onClose: () => void
}
type UpdateUserDialogState = {
  step: number
  form: {
    displayName?: string
    mobileNumber?: string
    email?: string
    address?: string
  }
  fields: {
    displayName?: HTMLInputElement
    mobileNumber?: HTMLInputElement
    email?: HTMLInputElement
    address?: HTMLInputElement
  }
  updateHeight?: () => void
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default UpdateUserDialog