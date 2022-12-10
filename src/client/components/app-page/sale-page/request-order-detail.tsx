import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import DoneIcon from '@mui/icons-material/Done'
import PendingIcon from '@mui/icons-material/MoreHoriz'

import {OrderDetailed} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'
import {displayDate, displayDuration} from '../../../utility/date'
import {getServicePoint} from './request-detail'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    padding: '0 !important'
  },
  content: {
    padding: '24px 32px'
  },
  title: {
    fontWeight: 600
  },
  subtitle: {
    marginTop: '16px !important',
    marginBottom: '8px !important',
  },
  serviceRow: {
    display: 'grid',
    gridTemplateColumns: 'min-content auto min-content',
    columnGap: '8px'
  },
  servicePrice: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  formFieldCards: {
    marginLeft: '-8px',
    marginRight: '-8px',
    padding: '0 0 16px'
  }
}))
const SlideUpTransition = React.forwardRef((props:TransitionProps, ref) =>
  <Slide direction='up' ref={ref} {...props}/>
)
const RequestOrderDetailDialog:React.FunctionComponent<RequestOrderDetailDialogProps> = (props) => {
  const [state, setState] = React.useState<RequestOrderDetailDialogState>({
    open: !!props.order,
    order: props.order
  })

  React.useEffect(() => {
    if(props.order) {
      setState(state => ({
        ...state,
        open: true,
        order: props.order
      }))
    } else {
      setState(state => ({
        ...state,
        open: false
      }))
      setTimeout(
        () => setState(state => ({
          ...state,
          order: state.open === false
            ? props.order
            : state.order
        })),
        300
      )
    }
  }, [props.order])

  const {onClose} = props
  const {open, order} = state
  const classes = useStyles({})
  return (
    <Dialog open={open}
      TransitionComponent={SlideUpTransition}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <DialogContent classes={{root:classes.container}}>
        <div className={classes.content}>
          <Typography variant='h4' color='textPrimary' gutterBottom>
            {order?.id} {order?.name}
          </Typography>
          <Typography variant='h6' color='textPrimary' gutterBottom>
            {order?.status.slice(0, 1).toUpperCase()}
            {order?.status.slice(1).split('-').join(' ') + ' '}
            <Typography component='span' color='textSecondary'>
              updated {order && displayDuration(Date.now() - order.time.getTime())}
            </Typography>
          </Typography>
          {order?.services
            .sort((service1, service2) => getServicePoint(service2) - getServicePoint(service1))
            .map(service => (
              <div key={service.id} className={classes.serviceRow}>
                {service.done
                  ? <DoneIcon height={24} width={24} style={{
                      color: 'rgb(76, 175, 80)'
                    }}/>
                  : <PendingIcon height={24} width={24}
                      color='secondary'
                    />
                }
                <Typography>
                  {service.name}
                </Typography>
                <div className={classes.servicePrice}>
                  <Typography>
                    RM
                  </Typography>
                  <Typography>
                    {displayCurrency(service.assignedPrice, {decimal:2})}
                  </Typography>
                </div>
              </div>
            ))
          }
          {order?.imagesBefore? (
            <>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.subtitle}}
              >
                Images before
              </Typography>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowY: 'auto'
                  }}>
                    {order.imagesBefore.map((image, index) => (
                      <div key={index} style={{
                        height: '160px',
                        width: '240px',
                        minWidth: '240px',
                        background: `url("${image.url}") center/contain no-repeat`
                      }}/>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          ):undefined}
          {order?.imagesAfter? (
            <>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.subtitle}}
              >
                Images after
              </Typography>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowY: 'auto'
                  }}>
                    {order.imagesAfter.map((image, index) => (
                      <div key={index} style={{
                        height: '160px',
                        width: '240px',
                        minWidth: '240px',
                        background: `url("${image.url}") center/contain no-repeat`
                      }}/>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          ):undefined}
          <Typography variant='h5' color='textPrimary'
            classes={{root:classes.subtitle}}
          >
            History
          </Typography>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr max-content',
            columnGap: '6px'
          }}>
            {order?.events
              .filter((event, index, events) =>
                events.findIndex(e => e._status === event._status) === index
              )
              .reverse()
              .map((event, index) => (
                <React.Fragment key={index}>
                  <Typography>
                    {index + 1}.
                  </Typography>
                  <Typography>
                    {event._status.slice(0, 1).toUpperCase()}
                    {event._status.slice(1).split('-').join(' ') + ' '}
                  </Typography>
                  <Typography color='textSecondary' style={{
                    textAlign: 'right'
                  }}>
                    {displayDate(event.time)}
                  </Typography>
                </React.Fragment>
              ))
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
type RequestOrderDetailDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type RequestOrderDetailDialogState = {
  open: boolean
  order?: OrderDetailed
}

export default RequestOrderDetailDialog