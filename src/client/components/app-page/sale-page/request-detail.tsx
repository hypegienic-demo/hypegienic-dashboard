import * as React from 'react'
import {useParams, useHistory} from 'react-router'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined'
import DetailsIcon from '@mui/icons-material/Details'
import DoneIcon from '@mui/icons-material/Done'
import PendingIcon from '@mui/icons-material/MoreHoriz'
import ShoppingIcon from '@mui/icons-material/ShoppingCartOutlined'
import UpdateIcon from '@mui/icons-material/Redo'
import UndoIcon from '@mui/icons-material/Undo'
import EditIcon from '@mui/icons-material/EditOutlined'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/SaveOutlined'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import SendIcon from '@mui/icons-material/SendOutlined'

import socket from '../../../store/socket'
import {useScreenState} from '../../../store/screen'
import {useRequestState, OrderDetailed, ServiceOrdered} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'
import {displayDate, displayDuration} from '../../../utility/date'
import {conformToMobileNumber} from '../../common/text-field/mobile-number'
import RequestOrderDetailDialog from './request-order-detail'
import RetrieveRequestDialog from './retrieve-request'
import AddBeforeImagesDialog from './add-before-images'
import UpdateServiceStatusDialog from './update-service-status'
import AddAfterImagesDialog from './add-after-images'
import DeliverRequestDialog from './deliver-request'
import ConfirmRetrievalDialog from './confirm-retrieval'
import UndoOrderDialog from './undo-order'
import UpdateServicesDialog from './update-services'
import UpdateProductsDialog from './update-products'
import AddPaymentDialog from './add-payment'
import AddPickUpTimeDialog from './add-pick-up-time'
import CancelRequestDialog from './cancel-request'
import SendInvoiceEmailDialog from './send-invoice-email'
import {sideBarWidth, RoutePageProps} from '../'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    height: '100%',
    width: '100%',
    overflow: 'auto'
  },
  container: {
    width: '100%',
    maxWidth: '840px',
    padding: '48px 40px',
    margin: '0 auto',
    transition: theme.transitions.create(['opacity', 'transform']),
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  divider: {
    margin: '32px 0 !important'
  },
  orders: {
    display: 'grid',
    gridTemplateColumns: 'auto min-content',
    columnGap: '16px'
  },
  serviceStatusRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px'
  },
  servicePriceRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  formField: {
    marginBottom: '12px !important'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8px',
    margin: '12px 0'
  },
  button: {
    minWidth: '0 !important',
    borderRadius: '20px !important'
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      marginRight: '0'
    }
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
export const getServicePoint = (service:ServiceOrdered) => {
  switch(service.type) {
  case 'main': return 1
  case 'additional': return 0
  }
}
const SaleDetailPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<SaleDetailPageState>({
    form: {},
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{detailedRequests:requests}, {displayRequest, updateRemark}] = useRequestState()
  const {requestId, orderId} = useParams<{requestId:string, orderId?:string}>()
  const currentPath = `/app/sales/${requestId}`
  const history = useHistory()
  const request = requests?.[requestId]
  const order = request?.type === 'physical'
    ? request.orders.find(order => order.id === orderId)
    : request?.orders.find(order => order.id === orderId)

  React.useEffect(() => {
    const display = async() => {
      try {
        const request = await displayRequest(requestId)
        setState(state => ({
          ...state,
          form: {
            ...state.form,
            remark: request.remark
          },
          loading: false
        }))
        socket.on('request-updated', async(payload) => {
          if(request.id === payload.requestId) {
            await displayRequest(requestId)
          }
        })
        socket.on('order-updated', async(payload) => {
          if(request.orders.some(order => order.id === payload.orderId)) {
            await displayRequest(requestId)
          }
        })
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
    return () => {
      socket.off('request-updated')
      socket.off('order-updated')
    }
  }, [])
  React.useEffect(() => {
    if(request?.status === 'cancelled') {
      history.goBack()
    }
  }, [request])
  React.useEffect(() => {
    const {remark} = state.form
    window.onbeforeunload = () => {
      if(remark !== request?.remark) {
        return `Are you sure you want to leave? You haven't save your changes to remark yet`
      }
    }
  }, [request?.remark, state.form.remark])

  const goBack = () => {
    history.goBack()
  }

  const getInvoiceLink = () =>
    `/app/sales/invoice/${requestId}`

  const onChangeForm = (form:Partial<SaleDetailPageState['form']>) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        ...form
      }
    }))
  }
  const onSaveRemark = async() => {
    const {remark} = state.form
    if(remark !== undefined) {
      await updateRemark({
        requestId,
        remark
      })
    }
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

  const closeDialog = () => {
    setState(state => ({
      ...state,
      modal: undefined
    }))
  }
  const openOrderDialog = (orderId:string) => {
    history.push(`${currentPath}/${orderId}`)
  }
  const openUpdateDialog = (orderId:string) => {
    const order = request?.orders.find(order => order.id === orderId)
    if(order) {
      setState(state => ({
        ...state,
        modal: {
          type: 'forward',
          order
        }
      }))
    }
  }
  const openUndoDialog = (orderId:string) => {
    const order = request?.orders.find(order => order.id === orderId)
    if(order) {
      setState(state => ({
        ...state,
        modal: {
          type: 'undo',
          order
        }
      }))
    }
  }
  const openServicesDialog = (orderId:string) => {
    const order = request?.orders.find(order => order.id === orderId)
    if(order) {
      setState(state => ({
        ...state,
        modal: {
          type: 'services',
          order
        }
      }))
    }
  }
  const openProductsDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'products'
      }
    }))
  }
  const openPaymentDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'payment'
      }
    }))
  }
  const openPickUpTimeDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'pick-up-time'
      }
    }))
  }
  const openCancellationDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'cancellation'
      }
    }))
  }
  const openSendInvoiceDialog = () => {
    setState(state => ({
      ...state,
      modal: {
        type: 'send-invoice'
      }
    }))
  }

  const getNextAction = (order:OrderDetailed) => {
    if(order.type === 'locker' && order.status === 'deposited') {
      return 'retrive-request' as const
    } else if(
      (order.type === 'physical' && order.status === 'deposited') ||
      (order.type === 'locker' && order.status === 'retrieved-store')
    ) {
      return 'add-before-images' as const
    } else if(
      order.status === 'delivered-store' && !order.services.every(service => service.done)
    ) {
      return 'update-service-status' as const
    } else if(
      order.status === 'delivered-store' && order.services.every(service => service.done)
    ) {
      return 'add-after-images' as const
    } else if(
      order.type === 'locker' && order.status === 'cleaned'
    ) {
      return 'deliver-request' as const
    } else if(
      order.type === 'physical' && order.status === 'cleaned'
    ) {
      return 'confirm-retrieval' as const
    } else {
      return undefined
    }
  }

  const {setScrollTarget} = props
  const {form, modal, loading, error} = state
  const classes = useStyles({})
  const smallScreen = screenType === 'xs-phone'
  const totalPrice = request
    ? request.products.reduce(
        (price, product) => price + product.quantity * product.assignedPrice, 0
      ) +
      request.orders.reduce(
        (price, order) =>
          price + order.services.reduce(
            (price, service) => price + service.assignedPrice, 0
          ),
        0
      )
    : 0
  const totalPaid = request?.payments.reduce(
    (total, payment) => total + payment.amount,
    0
  )?? 0
  return (
    <>
      <div className={classes.page}
        ref={setScrollTarget}
      >
        <div className={classes.container}
          style={loading
            ? {opacity:0, transform:'translateY(32px)'}
            : {opacity:1}
          }
        >
          <Toolbar/>
          {request? (
            <>
              <Typography variant='h3' gutterBottom>
                {request.orderer.displayName}
              </Typography>
              <Typography variant='h6' color='textSecondary' style={{
                wordBreak: 'break-word'
              }}>
                {[
                  conformToMobileNumber(request.orderer.mobileNumber),
                  request.orderer.email
                ].join(' • ')}
              </Typography>
              {request.pickUpTime? (
                <Typography variant='body1' color='textSecondary'
                  gutterBottom
                >
                  Pick up {displayDate(request.pickUpTime)}
                </Typography>
              ):undefined}
              <div className={classes.buttons}>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  href={getInvoiceLink()}
                  target='_blank'
                >
                  <DescriptionIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'View invoice':undefined}
                </Button>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  onClick={openSendInvoiceDialog}
                >
                  <SendIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'Send invoice':undefined}
                </Button>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  onClick={openPickUpTimeDialog}
                >
                  <EditIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'Edit pick up date':undefined}
                </Button>
                <Button color='error'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  onClick={openCancellationDialog}
                >
                  <CancelIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'Cancel sales':undefined}
                </Button>
              </div>
              <Divider classes={{root:classes.divider}}/>
              <div className={classes.orders}>
                {request.orders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    {index !== 0? <div style={{gridColumnEnd:'span 2'}}><br/></div>:undefined}
                    <Typography variant='h4' gutterBottom style={{
                      gridColumnEnd: 'span 2'
                    }}>
                      {order.id} {order.name}
                    </Typography>
                    <Typography gutterBottom style={{
                      gridColumnEnd: 'span 2'
                    }}>
                      {order.status.slice(0, 1).toUpperCase()}
                      {order.status.slice(1).split('-').join(' ') + ' '}
                      <Typography component='span' color='textSecondary'>
                        updated {displayDuration(Date.now() - order.time.getTime())}
                      </Typography>
                    </Typography>
                    {order.services
                      .sort((service1, service2) => getServicePoint(service2) - getServicePoint(service1))
                      .map(service => (
                        <React.Fragment key={service.id}>
                          <div className={classes.serviceStatusRow}>
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
                          </div>
                          <div className={classes.servicePriceRow}>
                            <Typography>
                              RM
                            </Typography>
                            <Typography>
                              {displayCurrency(service.assignedPrice, {decimal:2})}
                            </Typography>
                          </div>
                        </React.Fragment>
                      ))
                    }
                    <div className={classes.buttons} style={{
                      gridColumnEnd: 'span 2'
                    }}>
                      <Button
                        color='primary' variant='outlined' size='small'
                        classes={{root:classes.button}}
                        onClick={() => openOrderDialog(order.id)}
                      >
                        <DetailsIcon className={classes.extendedIcon}/>
                        {!smallScreen? 'Details':undefined}
                      </Button>
                      {[{
                        label: 'Retrieve from locker',
                        enabled: getNextAction(order) === 'retrive-request'
                      }, {
                        label: 'Add before images',
                        enabled: getNextAction(order) === 'add-before-images'
                      }, {
                        label: 'Update service progress',
                        enabled: getNextAction(order) === 'update-service-status'
                      }, {
                        label: 'Add after images',
                        enabled: getNextAction(order) === 'add-after-images'
                      }, {
                        label: 'Deliver to locker',
                        enabled: getNextAction(order) === 'deliver-request'
                      }, {
                        label: 'Confirm retrieval',
                        enabled: getNextAction(order) === 'confirm-retrieval'
                      }].map(button => button.enabled? (
                        <Button key={button.label}
                          color='primary' variant='outlined' size='small'
                          classes={{root:classes.button}}
                          onClick={() => openUpdateDialog(order.id)}
                        >
                          <UpdateIcon className={classes.extendedIcon}/>
                          {!smallScreen? button.label:undefined}
                        </Button>
                      ):undefined)}
                      {(order.type === 'physical'
                        ? ['deposited', 'delivered-store'].includes(order.status)
                        : ['opened-locker', 'deposited', 'retrieved-store', 'delivered-store'].includes(order.status))? (
                        <Button color='primary'
                          variant='outlined' size='small'
                          classes={{root:classes.button}}
                          onClick={() => openServicesDialog(order.id)}
                        >
                          <EditIcon className={classes.extendedIcon}/>
                          {!smallScreen? 'Update services':undefined}
                        </Button>
                      ):undefined}
                      {order.events.length > 1? (
                        <Button color='primary'
                          variant='outlined' size='small'
                          classes={{root:classes.button}}
                          onClick={() => openUndoDialog(order.id)}
                        >
                          <UndoIcon className={classes.extendedIcon}/>
                          {!smallScreen? 'Undo update':undefined}
                        </Button>
                      ):undefined}
                    </div>
                  </React.Fragment>
                ))}
                {request.products.map((product, index) => (
                  <React.Fragment key={product.id}>
                    {index !== 0 || request.orders.length !== 0? (
                      <div style={{gridColumnEnd:'span 2'}}><br/></div>
                    ):undefined}
                    <div className={classes.serviceStatusRow}>
                      <ShoppingIcon height={24} width={24} style={{
                        color: 'rgb(76, 175, 80)'
                      }}/>
                      <Typography>
                        {product.name + ' × ' + product.quantity}
                      </Typography>
                    </div>
                    <div className={classes.servicePriceRow}>
                      <Typography>
                        RM
                      </Typography>
                      <Typography>
                        {displayCurrency(product.quantity * product.assignedPrice, {decimal:2})}
                      </Typography>
                    </div>
                  </React.Fragment>
                ))}
                <div className={classes.buttons} style={{
                  gridColumnEnd: 'span 2'
                }}>
                  <Button color='primary'
                    variant='outlined' size='small'
                    classes={{root:classes.button}}
                    onClick={openProductsDialog}
                  >
                    <EditIcon className={classes.extendedIcon}/>
                    {!smallScreen? 'Update products':undefined}
                  </Button>
                </div>
                <Divider classes={{root:classes.divider}} style={{
                  gridColumnEnd: 'span 2'
                }}/>
                <div className={classes.serviceStatusRow}/>
                <div className={classes.servicePriceRow}>
                  <Typography>RM</Typography>
                  <Typography>
                    {displayCurrency(
                      totalPrice,
                      {decimal:2}
                    )}
                  </Typography>
                </div>
                {request.payments.map((payment, index) => (
                  <React.Fragment key={index}>
                    <div className={classes.servicePriceRow}>
                      <Typography>
                        {payment.type.slice(0, 1).toUpperCase()}
                        {payment.type.slice(1).split('-').join(' ') + ' '}
                        {payment.type === 'bank-transfer' ||
                          payment.type === 'credit-debit-card' ||
                          payment.type === 'cheque'? (
                          <Typography component='span' color='textSecondary'>
                            {payment.reference}
                          </Typography>
                        ):undefined}
                      </Typography>
                      <Typography>-</Typography>
                    </div>
                    <div className={classes.servicePriceRow}>
                      <Typography>RM</Typography>
                      <Typography>
                        {displayCurrency(
                          payment.amount,
                          {decimal:2}
                        )}
                      </Typography>
                    </div>
                  </React.Fragment>
                ))}
                <div className={classes.serviceStatusRow}/>
                <div className={classes.servicePriceRow} style={{
                  padding: '4px 7px',
                  margin: '4px -8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px'
                }}>
                  <Typography>RM</Typography>
                  <Typography>
                    {displayCurrency(
                      totalPrice - totalPaid,
                      {decimal:2}
                    )}
                  </Typography>
                </div>
                <div className={classes.buttons} style={{
                  gridColumnEnd: 'span 2'
                }}>
                  <Button color='primary'
                    variant='outlined' size='small'
                    classes={{root:classes.button}}
                    onClick={openPaymentDialog}
                    disabled={totalPaid >= totalPrice}
                  >
                    <AddIcon className={classes.extendedIcon}/>
                    {!smallScreen? 'Add payment':undefined}
                  </Button>
                </div>
              </div>
              <Divider classes={{root:classes.divider}}/>
              <TextField
                label='Remark'
                value={form.remark?? ''}
                onChange={event => onChangeForm({
                  remark: event.target.value
                })}
                variant='outlined'
                size='small'
                fullWidth
                multiline
                classes={{root:classes.formField}}
              />
              <div className={classes.buttons} style={{
                gridColumnEnd: 'span 2'
              }}>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  onClick={onSaveRemark}
                  disabled={request.remark === form.remark}
                >
                  <SaveIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'Save remark':undefined}
                </Button>
              </div>
            </>
          ):undefined}
        </div>
      </div>
      <RequestOrderDetailDialog
        order={order}
        onClose={goBack}
      />
      <RetrieveRequestDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'retrive-request'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <AddBeforeImagesDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'add-before-images'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <UpdateServiceStatusDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'update-service-status'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <AddAfterImagesDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'add-after-images'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <DeliverRequestDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'deliver-request'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <ConfirmRetrievalDialog
        order={modal?.type === 'forward' && getNextAction(modal.order) === 'confirm-retrieval'
          ? modal.order
          : undefined
        }
        onClose={closeDialog}
      />
      <UndoOrderDialog
        order={modal?.type === 'undo'? modal.order:undefined}
        onClose={closeDialog}
      />
      <UpdateServicesDialog
        order={modal?.type === 'services'? modal.order:undefined}
        onClose={closeDialog}
      />
      <UpdateProductsDialog
        request={modal?.type === 'products'? request:undefined}
        onClose={closeDialog}
      />
      <AddPaymentDialog
        request={modal?.type === 'payment' && totalPaid < totalPrice? request:undefined}
        onClose={closeDialog}
      />
      <AddPickUpTimeDialog
        request={modal?.type === 'pick-up-time'? request:undefined}
        onClose={closeDialog}
      />
      <CancelRequestDialog
        request={modal?.type === 'cancellation'? request:undefined}
        onClose={closeDialog}
      />
      <SendInvoiceEmailDialog
        request={modal?.type === 'send-invoice'? request:undefined}
        onClose={closeDialog}
      />
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
type SaleDetailPageState = {
  form: {
    remark?: string
  }
  modal?: 
    | {
        type: 'forward'
        order: OrderDetailed
      }
    | {
        type: 'undo'
        order: OrderDetailed
      }
    | {
        type: 'services'
        order: OrderDetailed
      }
    | {
        type: 'products'
      }
    | {
        type: 'payment'
      }
    | {
        type: 'pick-up-time'
      }
    | {
        type: 'cancellation'
      }
    | {
        type: 'send-invoice'
      }
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default SaleDetailPage