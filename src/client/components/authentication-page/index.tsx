import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import ButtonGroup from '@mui/material/ButtonGroup'
import Snackbar from '@mui/material/Snackbar'

import HypeGuardianLogo from '../../../asset/img/hypeguardian-logo.svg'
import {useAuthenticationState} from '../../store/authentication'
import MobileNumberTextField, {mobileNumberRegExp} from '../common/text-field/mobile-number'
import PasscodeTextField from '../common/text-field/passcode'
import EmailTextField, {emailRegExp} from '../common/text-field/email'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pageContainer: {
    width: '1200px',
    maxWidth: '100%',
    minHeight: '100%',
    padding: '32px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      padding: '24px',
    }
  },
  hypeguardianLogo: {
    width: '100px',
    marginLeft: '16px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      width: '80px'
    }
  },
  titleSection: {
    padding: '24px 32px 8px'
  },
  swipeableSection: {
    padding: '8px 32px 24px'
  },
  title: {
    fontWeight: 600
  },
  fieldSection: {
    flex: 1
  },
  formCard: {
    width: '100%',
    maxWidth: '380px'
  },
  formFields: {
    padding: '0 0 16px'
  },
  formField: {
    marginBottom: '12px !important'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const SignInPage:React.FunctionComponent = () => {
  const [state, setState] = React.useState<SignInPageState>({
    step: 0,
    form: {},
    fields: {}
  })
  const [, {
    signInMobile,
    submitPasscode,
    registerProfile
  }] = useAuthenticationState()

  const setInputRef:(label:keyof SignInPageState['fields']) => React.Ref<HTMLInputElement> =
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
  const onChangeForm = (form:Partial<SignInPageState['form']>) => {
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
  const focusInput = async(step:number) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if(step === 0) {
      state.fields.mobileNumber?.focus()
    } else if(step === 1) {
      state.fields.passcode?.focus()
    } else if(step === 2) {
      state.fields.displayName?.focus()
    }
  }
  const next = async() => {
    if(state.step === 0) {
      const {mobileNumber} = state.form
      if(!mobileNumber || mobileNumber === '') {
        setError('Please fill in mobile number first')
        return
      }
      const cleanedNumber = `+60${mobileNumber.replace(/\D/g, '')}`
      if(!mobileNumberRegExp.test(cleanedNumber)) {
        setError('Please complete mobile number first')
      } else {
        setState(state => ({...state, loading:true}))
        try {
          await signInMobile(cleanedNumber)
          setState(state => ({
            ...state,
            step: 1,
            loading: false
          }))
          await focusInput(1)
        } catch(error:any) {
          setState(state => ({...state, loading:false}))
          setError(error.message)
        }
      }
    } else if(state.step === 1) {
      const {passcode} = state.form
      if(!passcode || passcode === '') {
        setError('Please fill in the OTP first')
      } else if(!/^\d{6}$/.test(passcode)) {
        setError('Please complete the OTP first')
      } else {
        setState(state => ({...state, loading:true}))
        try{
          const response = await submitPasscode(passcode)
          if(!response.detail?.employee) {
            setState(state => ({
              ...state,
              step: 3,
              loading: false
            }))
          } else if(!response.registered) {
            setState(state => ({
              ...state,
              step: 2,
              form: {
                ...state.form,
                ...response.detail
              },
              loading: false
            }))
          } else {
            setState(state => ({...state, loading:false}))
          }
        } catch(error:any) {
          setState(state => ({...state, loading:false}))
          setError(error.message)
        }
      }
    } else if(state.step === 2) {
      const {displayName, email} = state.form
      if(!displayName || displayName === '') {
        setError('Please fill in your name first')
      } else if(!email || email === '') {
        setError('Please fill in your email address first')
      } else if(!emailRegExp.test(email)) {
        setError('Please complete your email address first')
      } else {
        setState(state => ({...state, loading:true}))
        try {
          const profile = await registerProfile({displayName, email})
          if(profile.employee) {
            setState(state => ({
              ...state,
              step: 2,
              loading: false
            }))
          } else {
            setState(state => ({
              ...state,
              step: 3,
              loading: false
            }))
          }
        } catch(error:any) {
          setState(state => ({...state, loading:false}))
          setError(error.message)
        }
      }
    }
  }
  const back = async() => {
    if(state.step > 0) {
      setState(state => ({
        ...state,
        step: state.step - 1
      }))
      await focusInput(state.step - 1)
    }
  }
  const restart = async() => {
    setState(state => ({
      ...state,
      step: 0
    }))
    await focusInput(0)
  }

  const {step, form, fields, loading, error} = state
  const classes = useStyles({})
  return (
    <div className={classes.container}>
      <Grid container direction='column' alignItems='center' classes={{container:classes.pageContainer}}>
        <Grid container direction='column' alignItems='flex-end'>
          <img className={classes.hypeguardianLogo} src={HypeGuardianLogo}/>
        </Grid>
        <Grid container direction='column' justifyContent='center' alignItems='center' classes={{container:classes.fieldSection}}>
          <Card variant='outlined' classes={{root:classes.formCard}}>
            <CardContent classes={{root:classes.titleSection}}>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.title}}
              >
                HYPEGUARDIAN
              </Typography>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                This portal is only intended for internal use
              </Typography>
            </CardContent>
            <SwipeableViews index={step} animateHeight disabled>
              <CardContent classes={{root:classes.swipeableSection}}>
                <div className={classes.formFields}>
                  <MobileNumberTextField
                    inputRef={setInputRef('mobileNumber')}
                    label='Mobile Number'
                    value={form.mobileNumber?? ''}
                    onChange={event => onChangeForm({
                      mobileNumber: event.target.value
                    })}
                    onKeyPress={event => {
                      if(event.key === 'Enter' && !loading) {
                        next()
                      }
                    }}
                    variant='outlined'
                    size='small'
                    autoFocus
                    fullWidth
                    classes={{root:classes.formField}}
                  />
                </div>
                <div className={classes.buttons}>
                  <ButtonGroup>
                    <LoadingButton variant='contained' color='primary' size='large' disableElevation
                      onClick={next}
                      loading={loading}
                    >
                      Continue
                    </LoadingButton>
                  </ButtonGroup>
                </div>
              </CardContent>
              <CardContent classes={{root:classes.swipeableSection}}>
                <div className={classes.formFields}>
                  <PasscodeTextField
                    inputRef={setInputRef('passcode')}
                    label='One Time Passcode'
                    value={form.passcode?? ''}
                    onChange={event => onChangeForm({
                      passcode: event.target.value
                    })}
                    onKeyPress={event => {
                      if(event.key === 'Enter' && !loading) {
                        next()
                      }
                    }}
                    variant='outlined'
                    size='small'
                    autoFocus
                    fullWidth
                    classes={{root:classes.formField}}
                  />
                </div>
                <div className={classes.buttons}>
                  <ButtonGroup>
                    <Button variant='outlined' color='inherit' size='large'
                      onClick={back}
                    >
                      Back
                    </Button>
                    <LoadingButton variant='contained' color='primary' size='large' disableElevation
                      onClick={next}
                      loading={loading}
                    >
                      Continue
                    </LoadingButton>
                  </ButtonGroup>
                </div>
              </CardContent>
              <CardContent classes={{root:classes.swipeableSection}}>
                <div className={classes.formFields}>
                  <Typography variant='body1' color='textPrimary' gutterBottom>
                    Please confirm your details
                  </Typography>
                  <TextField
                    inputRef={setInputRef('displayName')}
                    label='Name'
                    value={form.displayName?? ''}
                    onChange={event => onChangeForm({
                      displayName: event.target.value
                    })}
                    onKeyPress={event => {
                      if(event.key === 'Enter' && !loading) {
                        fields.email?.focus()
                      }
                    }}
                    variant='outlined'
                    size='small'
                    autoFocus
                    fullWidth
                    classes={{root:classes.formField}}
                  />
                  <EmailTextField
                    inputRef={setInputRef('email')}
                    label='Email'
                    value={form.email?? ''}
                    onChange={event => onChangeForm({
                      email: event.target.value
                    })}
                    onKeyPress={event => {
                      if(event.key === 'Enter' && !loading) {
                        next()
                      }
                    }}
                    variant='outlined'
                    size='small'
                    fullWidth
                    classes={{root:classes.formField}}
                  />
                </div>
                <div className={classes.buttons}>
                  <ButtonGroup>
                    <LoadingButton variant='contained' color='primary' size='large' disableElevation
                      onClick={next}
                      loading={loading}
                    >
                      Register
                    </LoadingButton>
                  </ButtonGroup>
                </div>
              </CardContent>
              <CardContent classes={{root:classes.swipeableSection}}>
                <div className={classes.formFields}>
                  <Typography variant='body1' color='textPrimary'>
                    It seems like you are unauthorized, please check with your superior.
                  </Typography>
                </div>
                <div className={classes.buttons}>
                  <ButtonGroup>
                    <Button variant='outlined' color='inherit' size='large'
                      onClick={restart}
                    >
                      Restart
                    </Button>
                  </ButtonGroup>
                </div>
              </CardContent>
            </SwipeableViews>
          </Card>
        </Grid>
      </Grid>
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
    </div>
  )
}
type SignInPageState = {
  step: number
  form: {
    mobileNumber?: string
    passcode?: string
    displayName?: string
    email?: string
  }
  fields: {
    mobileNumber?: HTMLDivElement
    passcode?: HTMLDivElement
    displayName?: HTMLDivElement
    email?: HTMLDivElement
  }
  loading?: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default SignInPage