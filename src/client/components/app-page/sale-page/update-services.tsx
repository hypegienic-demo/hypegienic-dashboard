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
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import Snackbar from '@mui/material/Snackbar'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import {useRequestState, OrderDetailed} from '../../../store/request'
import {useServiceState, Service} from '../../../store/service'
import CurrencyTextField from '../../common/text-field/currency'
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
    padding: '0 24px !important',
    '& .MuiOutlinedInput-input.MuiInputBase-input.MuiInputBase-inputSizeSmall': {
      padding: '6px 8px'
    }
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
const UpdateServicesDialog:React.FunctionComponent<UpdateServicesDialogProps> = (props) => {
  const [state, setState] = React.useState<UpdateServicesDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [{services}, {displayServices}] = useServiceState()
  const [, {updateServices}] = useRequestState()

  React.useEffect(() => {
    const {order} = props
    if(order) {
      const updateForm = async() => {
        await displayServices()
        setState(state => ({
          ...state,
          form: {
            ...state.form,
            services: order.services.map(service => ({
              id: service.id,
              price: service.assignedPrice
            }))
          },
          fields: {}
        }))
      }
      updateForm()
    }
  }, [props.order])

  const setInputRef:(label:keyof UpdateServicesDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const onChangeForm = (form:Partial<UpdateServicesDialogState['form']>) => {
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
      const {services:chosen} = state.form
      if(!chosen) {
        setError('Please choose a service first')
        return
      }
      const chosenServices = chosen.flatMap(({id, price}) => {
        const service = services?.find(service => service.id === id)
        return service? [{service, price}]:[]
      })
      const variablePricedServices = chosenServices.filter(({service}) => service.price.type === 'variable')
      if(!variablePricedServices.every(({price}) => typeof price === 'number')) {
        setError('Please fill in all the pricing')
      } else {
        setState(state => ({...state, step:1}))
      }
    } else if(state.step === 1 && order) {
      const {services:chosenServices} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await updateServices({
          orderId: order.id,
          services: chosenServices?.flatMap(({id, price}) => {
            return typeof price === 'number'? [{id, price}]:[]
          })?? []
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
  const {step, form, fields, loading, error} = state
  const classes = useStyles({})
  const chosenMainServices = form.services
    ?.map(({id}) => {
      return services?.find(service => service.id === id)
    })
    .flatMap(service => service?.type === 'main'? [service]:[])
  const renderService = (service:Service) => {
    const chosen = form.services?.find(({id}) => id === service.id)
    const onCheck = () => onChangeForm({
      services: [
        ...service.type === 'main' && form.services
          ? form.services.filter(({id}) =>
              !service.exclude.includes(id)
            )
          : form.services?? [],
        ...!form.services?.some(({id}) => id === service.id)
          ? [{
              id: service.id,
              price: service.price.type === 'fixed'
                ? service.price.amount
                : undefined
            }]
          : []
      ]
    })
    const onUncheck = () => onChangeForm({
      services: form.services?.filter(({id}) => id !== service.id)?? []
    })
    return (
      <ListItem key={service.id} dense
        onClick={() => {
          if(!chosen) {
            fields[`service.${service.id}`]?.focus()
            onCheck()
          } else {
            onUncheck()
          }
        }}
        button
        disabled={chosenMainServices?.some(chosen =>
          chosen?.exclude.includes(service.id)
        )}
        classes={{dense:classes.listItem}}
      >
        <ListItemIcon>
          <Checkbox edge='start'
            checked={!!chosen}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={service.name}
          secondary={
            <CurrencyTextField
              inputRef={setInputRef(`service.${service.id}`)}
              value={chosen?.price??
                (service.price.type === 'fixed'? service.price.amount:'')
              }
              onClick={event => event.stopPropagation()}
              onFocus={() => onCheck()}
              onChange={event => {
                const value = parseFloat(event.target.value.replace(/[^0-9]/g, '')?? '')
                onChangeForm({
                  services: [
                    ...form.services?.filter(({id}) => id !== service.id)?? [],
                    chosen
                      ? {...chosen, price:value && !isNaN(value)? value:''}
                      : {id:service.id, price:value && !isNaN(value)? value:''}
                  ]
                })
              }}
              variant='outlined'
              size='small'
              fullWidth
            />
          }
        />
      </ListItem>
    )
  }
  return (
    <>
      <Dialog open={!!order && !!services}
        TransitionComponent={SlideUpTransition}
        onClose={() => onClose()}
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
                  Update Services
                </Typography>
              </div>
              <div className={classes.formFields}>
                <List subheader={
                  <ListSubheader classes={{root:classes.listSection}}>
                    Main Services
                  </ListSubheader>
                }>
                  {services
                    ?.filter(service => service.type === 'main')
                    .map(renderService)
                  }
                </List>
                <List subheader={
                  <ListSubheader classes={{root:classes.listSection}}>
                    Additional Services
                  </ListSubheader>
                }>
                  {services
                    ?.filter(service => service.type === 'additional')
                    .map(renderService)
                  }
                </List>
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Update Order
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div className={classes.orderCardContent} style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {form.services?.flatMap(({id, price}) => {
                      const service = services?.find(service => service.id === id)
                      return service? [(
                        <Typography key={service.id} color='textPrimary'>
                          {service.name + ' '}
                          <Typography component='span' color='textSecondary'>
                            RM{typeof price === 'number' && displayCurrency(price)}
                          </Typography>
                        </Typography>
                      )]:[]
                    })}
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
type UpdateServicesDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type UpdateServicesDialogState = {
  step: number
  form: {
    services?: {
      id: string
      price?: number | ''
    }[]
  }
  fields: Record<string, HTMLInputElement>
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default UpdateServicesDialog