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
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrderDetailed, ServiceOrdered} from '../../../store/request'
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
  listContent: {
    padding: '24px 0 8px'
  },
  listSection: {
    lineHeight: '32px',
    padding: '0 24px !important'
  },
  listItem: {
    padding: '0 24px !important'
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
const UpdateServiceStatusDialog:React.FunctionComponent<UpdateServiceStatusDialogProps> = (props) => {
  const [state, setState] = React.useState<UpdateServiceStatusDialogState>({
    step: 0,
    form: {},
    loading: false
  })
  const [, {updateServiceStatus}] = useRequestState()

  const onChangeForm = (form:Partial<UpdateServiceStatusDialogState['form']>) => {
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
    const {order} = props
    if(state.step === 0) {
      const {servicesDone} = state.form
      if(!servicesDone || servicesDone.length === 0) {
        setError('Please add in at least 1 service first')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1 && order) {
      const {servicesDone} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await updateServiceStatus({
          orderId: order.id,
          servicesDone: servicesDone?? []
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

  const {order, onClose} = props
  const {step, form, loading, error} = state
  const classes = useStyles({})
  const renderService = (service:ServiceOrdered) => {
    const selected = form.servicesDone?.includes(service.id)?? false
    const onCheck = () => onChangeForm({
      servicesDone: [
        ...form.servicesDone?? [],
        service.id
      ]
    })
    const onUncheck = () => onChangeForm({
      servicesDone: form.servicesDone?.filter(id => service.id !== id)
    })
    return (
      <ListItem key={service.id} dense
        onClick={() => 
          !selected
            ? onCheck()
            : onUncheck()
        }
        button
        disabled={service.done}
        classes={{dense:classes.listItem}}
      >
        <ListItemIcon>
          <Checkbox edge='start'
            checked={service.done || selected}
            tabIndex={-1}
            disabled={service.done}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={service.name}
          secondary={`RM${displayCurrency(service.assignedPrice, {decimal:2})}`}
        />
      </ListItem>
    )
  }
  return (
    <>
      <Dialog open={!!order}
        TransitionComponent={SlideUpTransition}
        onClose={onClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled>
            <div className={classes.listContent}>
              <div className={[classes.listSection, classes.titleSection].join(' ')}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Mark Services as Done
                </Typography>
              </div>
              <div className={classes.formFields}>
                <List subheader={
                  <ListSubheader classes={{root:classes.listSection}}>
                    Main Services
                  </ListSubheader>
                }>
                  {order?.services
                    ?.filter(service => service.type === 'main')
                    .map(renderService)
                  }
                </List>
                <List subheader={
                  <ListSubheader classes={{root:classes.listSection}}>
                    Additional Services
                  </ListSubheader>
                }>
                  {order?.services
                    ?.filter(service => service.type === 'additional')
                    .map(renderService)
                  }
                </List>
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}}
                >
                  Update Order
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div className={classes.orderCardContent} style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, auto)'
                  }}>
                    {order?.services?.map(service => (
                      <React.Fragment key={service.id}>
                        <Typography color='textPrimary'>
                          {service.name + ' '}
                          <Typography component='span' color='textSecondary'>
                            RM{displayCurrency(service.assignedPrice)}
                          </Typography>
                        </Typography>
                        <Typography align='right'
                          color={form.servicesDone?.includes(service.id)? 'textPrimary':'textSecondary'}
                        >
                          {service.done || form.servicesDone?.includes(service.id)
                            ? 'done':'in progress'
                          }
                        </Typography>
                      </React.Fragment>
                    ))}
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
type UpdateServiceStatusDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type UpdateServiceStatusDialogState = {
  step: number
  form: {
    servicesDone?: string[]
  }
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default UpdateServiceStatusDialog