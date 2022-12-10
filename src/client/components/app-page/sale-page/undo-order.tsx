import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrderDetailed} from '../../../store/request'

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
const UndoOrderDialog:React.FunctionComponent<UndoOrderDialogProps> = (props) => {
  const [state, setState] = React.useState<UndoOrderDialogState>({
    loading: false
  })
  const [, {confirmUndo}] = useRequestState()
  
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
    if(order) {
      setState(state => ({...state, loading:true}))
      try {
        await confirmUndo({
          orderId: order.id
        })
        setState(state => ({
          ...state,
          loading: false
        }))
        props.onClose()
      } catch(error:any) {
        setError(error.message)
      }
    }
  }

  const {order, onClose} = props
  const {loading, error} = state
  const classes = useStyles({})
  return (
    <>
      <Dialog open={!!order}
        TransitionComponent={SlideUpTransition}
        onClose={onClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <div className={classes.content}>
            <div className={classes.titleSection}>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.title}}
              >
                Undo Order Update
              </Typography>
              <Typography variant='body1' color='textSecondary'
                gutterBottom
              >
                {order?.id} {order?.name} to previous state or update
              </Typography>
            </div>
          </div>
        </DialogContent>
        <Divider/>
        <DialogActions classes={{root:classes.container}}>
          <div className={classes.footer}>
            <LoadingButton variant='contained' color='primary' size='large' disableElevation
              onClick={next}
              loading={loading}
            >
              Confirm
            </LoadingButton>
          </div>
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
type UndoOrderDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type UndoOrderDialogState = {
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default UndoOrderDialog