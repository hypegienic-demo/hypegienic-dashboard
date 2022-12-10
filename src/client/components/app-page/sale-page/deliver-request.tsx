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
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrderDetailed, LockerUnit, Locker} from '../../../store/request'
import {DisplayLockerUnit} from './retrieve-request'

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
const DeliverRequestDialog:React.FunctionComponent<DeliverRequestDialogProps> = (props) => {
  const [state, setState] = React.useState<DeliverRequestDialogState>({
    step: 0,
    loading: false
  })
  const [, {requestDeliverLocker, confirmClosedLocker}] = useRequestState()

  React.useEffect(() => {
    const {order} = props
    if(!order) {
      setState(state => ({
        ...state,
        opened: false
      }))
    }
  }, [props.order])
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
    const {order} = props
    const {lockerUnit} = state
    if(state.step === 0 && order) {
      setState(state => ({...state, loading:true}))
      try {
        const lockerUnit = await requestDeliverLocker({
          orderId: order.id
        })
        setState(state => ({
          ...state,
          step: 1,
          lockerUnit,
          loading: false
        }))
      } catch(error:any) {
        setError(error.message)
      }
    } else if(state.step === 1 && lockerUnit) {
      setState(state => ({...state, loading:true}))
      try {
        await confirmClosedLocker({
          lockerUnitId: lockerUnit.id
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
    }
  }

  const {order, onClose} = props
  const {step, lockerUnit, loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <Dialog open={!!order}
        TransitionComponent={SlideUpTransition}
        onClose={() => onClose()}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Update Order
                </Typography>
                <Typography variant='body1' color='textSecondary'
                  gutterBottom
                >
                  {order?.id} {order?.name} to delivered locker
                </Typography>
              </div>
            </div>
            <DisplayLockerUnit
              play={!!order && step === 1}
              title='Deliver Order'
              description='Please place the order into the locker and close back the locker unit'
              lockerUnit={lockerUnit}
            />
          </SwipeableViews>
        </DialogContent>
        <Divider/>
        <DialogActions classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled>
            {[
              {primary:'Confirm'},
              {primary:'Done', secondary:'Back'}
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
type DeliverRequestDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type DeliverRequestDialogState = {
  step: number
  lockerUnit?: LockerUnit & {
    locker: Locker & {
      units: LockerUnit[]
    }
  }
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default DeliverRequestDialog