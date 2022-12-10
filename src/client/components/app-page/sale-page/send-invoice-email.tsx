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
import {usePDF} from '@react-pdf/renderer'

import {useRequestState, OrdersRequestDetailed} from '../../../store/request'
import {InvoiceDocument} from './invoice-viewer'

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
const SendInvoiceEmailDialog:React.FunctionComponent<SendInvoiceEmailDialogProps> = (props) => {
  const [state, setState] = React.useState<SendInvoiceEmailDialogState>({
    loading: false
  })
  const [, {sendEmail}] = useRequestState()
  const [document, updateDocument] = usePDF({
    document: props.request? (
      <InvoiceDocument request={props.request}/>
    ):(
      <React.Fragment/>
    )
  })

  React.useEffect(() => {
    updateDocument()
  }, [props.request])
  
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
    if(request && document.blob) {
      setState(state => ({...state, loading:true}))
      try {
        const invoiceId = `INV${[
          ...new Array(Math.max(5 - request.invoice.number.toString().length, 0)).fill('0'),
          request.invoice.number
        ].join('').slice(-5)}`
        const invoice = new File(
          [document.blob],
          `${invoiceId}.pdf`,
          {type:'application/pdf'}
        )
        await sendEmail({
          to: request.orderer.id,
          subject: `HypeGuardian Invoice ${invoiceId}`,
          text: `Dear ${request.orderer.displayName},` + '\n\n' +
            `Thanks for trusting your shoes with us` + '\n' +
            `You can find the invoice of your orders attached` + '\n' +
            `We hope you'll have a nice day` + '\n\n' +
            `Regards`,
          attachments: [invoice]
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

  const {request, onClose} = props
  const {loading, error} = state
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
          <div className={classes.content}>
            <div className={classes.titleSection}>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.title}}
              >
                Email Invoice
              </Typography>
              <Typography variant='body1' color='textSecondary'
                gutterBottom
              >
                Email the generated invoice to {request?.orderer.email}
              </Typography>
            </div>
          </div>
        </DialogContent>
        <Divider/>
        <DialogActions classes={{root:classes.container}}>
          <div className={classes.footer}>
            <LoadingButton variant='contained' color='primary' size='large' disableElevation
              onClick={next}
              loading={loading || document.loading}
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
type SendInvoiceEmailDialogProps = {
  request?: OrdersRequestDetailed
  onClose: () => void
}
type SendInvoiceEmailDialogState = {
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default SendInvoiceEmailDialog