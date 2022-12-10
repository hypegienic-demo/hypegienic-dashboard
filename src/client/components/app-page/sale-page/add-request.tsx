import * as React from 'react'
import {useRouteMatch, useHistory, useParams} from 'react-router'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Snackbar from '@mui/material/Snackbar'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import {useScreenState} from '../../../store/screen'
import {useStoreState, StoreSimplified} from '../../../store/store'
import {User} from '../../../store/user'
import {Service} from '../../../store/service'
import {Product} from '../../../store/product'
import {useRequestState} from '../../../store/request'
import {displayCurrency} from '../../../utility/string'
import {conformToMobileNumber} from '../../common/text-field/mobile-number'
import AddCustomerDialog from './add-customer'
import AddOrderDialog from './add-order'
import AddProductsDialog from './add-products'
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
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  content: {
    marginBottom: '54px'
  },
  divider: {
    margin: '32px 0 !important'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px'
  },
  gutterBottom: {
    marginBottom: '12px !important'
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
  extendedTextIcon: {
    marginRight: theme.spacing(1)
  },
  cards: {
    padding: '8px 0',
    margin: '0 -16px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px',
    padding: '7px 15px !important',
    '&:last-child': {
      paddingBottom: '11px !important'
    }
  },
  cardColumn: {
    flex: 1,
    display: 'grid',
    columnGap: '8px',
    gridTemplateColumns: '2fr 1fr',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: '1fr',
    }
  },
  orders: {
    padding: '8px 0 56px',
    margin: '0 -16px'
  },
  orderCardContent: {
    display: 'flex',
    flexDirection: 'row',
    padding: '7px 15px !important',
    columnGap: '8px',
    '&:last-child': {
      paddingBottom: '11px !important'
    },
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }
  },
  orderCardColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  orderActionColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  orderService: {
    display: 'grid',
    columnGap: '8px',
    gridTemplateColumns: '2fr 1fr',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: '1fr',
    }
  },
  bottomDivider: {
    margin: '0 -16px'
  },
  bottomButtonsContainer: {
    position: 'fixed',
    bottom: '0',
    width: 'calc(100% - 80px)',
    maxWidth: '760px',
    zIndex: 300,
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      width: 'calc(100% - 300px)'
    }
  },
  bottomButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '0 -16px',
    padding: '16px 16px',
    backgroundColor: 'rgb(255, 255, 255)'
  },
  bottomButtonExtendedIcon: {
    marginRight: theme.spacing(1)
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const AddRequestPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<AddRequestPageState>({
    form: {
      orders: [],
      products: []
    },
    confirm: false,
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{simplifiedStores}, {displayStores}] = useStoreState()
  const history = useHistory()
  const {storeId} = useParams<{storeId:string}>()
  const currentPath = `/app/sales/add/${storeId}`
  const addingCustomer = useRouteMatch(`${currentPath}/customer`)?.isExact?? false
  const addingOrder = useRouteMatch(`${currentPath}/order`)?.isExact?? false
  const addingProduct = useRouteMatch(`${currentPath}/product`)?.isExact?? false
  const store = simplifiedStores?.find(store => store.id === storeId)

  React.useEffect(() => {
    const display = async() => {
      try {
        const stores = await displayStores()
        const store = stores?.find(store => store.id === storeId)
        setState(state => ({
          ...state,
          form: {
            ...state.form,
            store
          },
          loading: false
        }))
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
  }, [])

  const openAddingCustomer = () => {
    history.push(`${currentPath}/customer`)
  }
  const closeAddingCustomer = (orderer?:User) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        orderer
      }
    }))
    history.goBack()
  }
  const openAddingOrder = () => {
    history.push(`${currentPath}/order`)
  }
  const closeAddingOrder = (order?:{name:string, services:{service:Service, price?:number}[]}) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        orders: order
          ? [...state.form.orders, order]
          : [...state.form.orders]
      }
    }))
    history.goBack()
  }
  const removeAddedOrder = (index:number) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        orders: state.form.orders.filter((_, i) => i !== index)
      }
    }))
  }
  const openAddingProduct = () => {
    history.push(`${currentPath}/product`)
  }
  const closeAddingProduct = (products?:{product:Product, quantity:number, price:number}[]) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        products: products?? state.form.products
      }
    }))
    history.goBack()
  }
  const next = async() => {
    const {orderer, orders, products} = state.form
    if(!orderer) {
      setError('Please select a customer first')
      return
    } else if([...orders, ...products].length === 0) {
      setError('Please add in at least one order first')
      return
    } else {
      setState(state => ({...state, confirm:true}))
    }
  }
  const cancel = (back?:boolean) => {
    setState(state => ({...state, confirm:false}))
    if(back) {
      history.goBack()
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
      error: {
        open: true,
        message: error
      }
    }))

  const {setScrollTarget} = props
  const {form, confirm, loading, error} = state
  const classes = useStyles({})
  const smallScreen = screenType === 'xs-phone'
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
          {store? (
            <div className={classes.content}>
              <Typography variant='h3' gutterBottom>
                Add sales request
              </Typography>
              <Typography variant='body1' gutterBottom>
                You can attach multiple order by the same customer in a single sales request
              </Typography>
              <Divider classes={{root:classes.divider}}/>
              <div className={classes.gutterBottom}>
                <Typography variant='h4'>
                  Store
                </Typography>
              </div>
              <div className={classes.cards}>
                <Card variant='outlined'>
                  <CardContent classes={{root:classes.cardContent}}>
                    <div className={classes.cardColumn}>
                      <Typography variant='h6' style={{
                        alignSelf: 'end'
                      }}>
                        {store.name}
                      </Typography>
                      <Typography color='textSecondary' style={{
                        alignSelf: 'end'
                      }}>
                        {store.registrationNumber}
                      </Typography>
                    </div>
                    <div style={{width:'48px'}}/>
                  </CardContent>
                </Card>
              </div>
              <br/>
              <div className={[classes.titleRow, classes.gutterBottom].join(' ')}>
                <Typography variant='h4'>
                  Customer
                </Typography>
                <Button color='primary'
                  variant='outlined' size='small'
                  classes={{root:classes.button}}
                  onClick={openAddingCustomer}
                >
                  <EditIcon className={classes.extendedIcon}/>
                  {!smallScreen? 'Edit':undefined}
                </Button>
              </div>
              {form.orderer
                ? (
                    <div className={classes.cards}>
                      <Card variant='outlined'>
                        <CardContent classes={{root:classes.cardContent}}>
                          <div className={classes.cardColumn}>
                            <Typography variant='h6' style={{
                              alignSelf: 'end'
                            }}>
                              {form.orderer.displayName}
                            </Typography>
                            <Typography color='textSecondary' style={{
                              alignSelf: 'end'
                            }}>
                              {conformToMobileNumber(form.orderer.mobileNumber)}
                            </Typography>
                          </div>
                          <div style={{width:'48px'}}/>
                        </CardContent>
                      </Card>
                    </div>
                  )
                : (
                    <Typography variant='h6' color='textSecondary' gutterBottom>
                      Not assigned
                    </Typography>
                  )
              }<br/>
              <div className={[classes.titleRow, classes.gutterBottom].join(' ')}>
                <Typography variant='h4'>
                  Order
                </Typography>
                <div className={classes.row}>
                  <Button color='primary'
                    variant='outlined' size='small'
                    classes={{root:classes.button}}
                    onClick={openAddingOrder}
                  >
                    <AddIcon classes={{root:classes.extendedTextIcon}}/>
                    {!smallScreen? 'Add Service':'Service'}
                  </Button>
                  <Button color='primary'
                    variant='outlined' size='small'
                    classes={{root:classes.button}}
                    onClick={openAddingProduct}
                  >
                    <EditIcon classes={{root:classes.extendedTextIcon}}/>
                    {!smallScreen? 'Edit Product':'Product'}
                  </Button>
                </div>
              </div>
              {[...form.orders, ...form.products].length > 0
                ? (
                    <div className={classes.orders}>
                      <Card variant='outlined'>
                        {form.orders.map((order, index) => (
                          <CardContent key={index} classes={{root:classes.orderCardContent}}>
                            <div className={classes.orderCardColumn}>
                              <Typography variant='h6'>
                                {order.name}
                              </Typography>
                              {order.services.map(({service, price}) => (
                                <div key={service.id} className={classes.orderService}>
                                  <Typography>
                                    {service.name}
                                  </Typography>
                                  <Typography color='textSecondary'>
                                    RM{displayCurrency(
                                      price?? (service.price.type === 'fixed'? service.price.amount:0),
                                      {decimal:2}
                                    )}
                                  </Typography>
                                </div>
                              ))}
                            </div>
                            <div className={classes.orderActionColumn}>
                              <IconButton onClick={() => removeAddedOrder(index)}>
                                <DeleteIcon/>
                              </IconButton>
                            </div>
                          </CardContent>
                        ))}
                        {form.products.map(({product, quantity, price}, index) => (
                          <CardContent key={index} classes={{root:classes.orderCardContent}}>
                            <div className={classes.orderCardColumn}>
                              <div key={product.id} className={classes.orderService}>
                                <Typography>
                                  {product.name}
                                </Typography>
                                <Typography color='textSecondary'>
                                  {quantity + ' × '}
                                  RM{displayCurrency(price, {decimal:2})}
                                </Typography>
                              </div>
                            </div>
                            <div style={{width:'48px'}}/>
                          </CardContent>
                        ))}
                      </Card>
                    </div>
                  )
                : (
                    <Typography variant='h6' color='textSecondary' gutterBottom>
                      Not added
                    </Typography>
                  )
              }
            </div>
          ):undefined}
          <div className={classes.bottomButtonsContainer}>
            <Divider className={classes.bottomDivider}/>
            <div className={classes.bottomButtons}>
              <Button variant='contained' color='primary' size='large' disableElevation
                onClick={next}
              >
                <AddIcon className={classes.bottomButtonExtendedIcon}/>
                Add Request
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AddCustomerDialog
        open={addingCustomer}
        onClose={closeAddingCustomer}
      />
      <AddOrderDialog
        open={addingOrder}
        onClose={closeAddingOrder}
      />
      <AddProductsDialog
        addedProducts={addingProduct? form.products:undefined}
        onClose={closeAddingProduct}
      />
      <AddRequestConfirmDialog
        open={confirm}
        onClose={cancel}
        form={form}
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
type AddRequestPageState = {
  form: {
    store?: StoreSimplified
    orderer?: User
    orders: {
      name: string
      services: {
        service: Service
        price?: number
      }[]
    }[]
    products: {
      product: Product
      quantity: number
      price: number
    }[]
  }
  confirm: boolean
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}


const useDialogStyles = makeStyles((theme:Theme) => ({
  container: {
    padding: '0',
    '&:first-child': {
      paddingTop: '0'
    }
  },
  content: {
    padding: '40px 24px 8px'
  },
  titleSection: {
    paddingBottom: '8px'
  },
  title: {
    fontWeight: 600
  },
  formFieldCards: {
    marginLeft: '-8px',
    marginRight: '-8px',
    padding: '0 0 16px'
  },
  requestCardContent: {
    padding: '8px !important',
    '&:last-child': {
      paddingBottom: '12px !important'
    }
  },
  requestCardContentRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
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
const AddRequestConfirmDialog:React.FunctionComponent<AddRequestConfirmDialogProps> = (props) => {
  const [state, setState] = React.useState<AddRequestConfirmDialogState>({
    loading: false
  })
  const [, {createRequest, displayRequests}] = useRequestState()
  
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
    const {onClose, form} = props
    const {store, orderer, orders, products} = form
    setState(state => ({...state, loading:true}))
    try {
      await createRequest({
        storeId: store?.id?? '',
        ordererId: orderer?.id?? '',
        orders: orders.map(order => ({
          name: order.name,
          services: order.services.map(({service, price}) => ({
            id: service.id,
            price
          }))
        })),
        products: products.map(({product, quantity, price}) => ({
          id: product.id,
          quantity,
          price
        }))
      })
      await displayRequests()
      setState(state => ({...state, loading:false}))
      onClose(true)
    } catch(error:any) {
      setError(error.message)
    }
  }

  const {open, onClose, form} = props
  const {loading, error} = state
  const classes = useDialogStyles({})
  return (
    <>
      <Dialog open={open}
        TransitionComponent={SlideUpTransition}
        onClose={() => onClose()}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <div className={classes.content}>
            <div className={classes.titleSection}>
              <Typography variant='h5' color='textPrimary'
                classes={{root:classes.title}} gutterBottom
              >
                Confirm Orders Request
              </Typography>
            </div>
            <div className={classes.formFieldCards}>
              <Card variant='outlined'>
                <CardContent classes={{root:classes.requestCardContent}}>
                  <Typography color='textPrimary'>
                    {form.store?.name}
                  </Typography>
                  <Typography variant='h6' color='textPrimary'>
                    {form.orderer?.displayName}
                  </Typography>
                  <div className={classes.requestCardContentRow}>
                    <Typography color='textSecondary'>
                      No of orders
                    </Typography>
                    <Typography>
                      {[...form.orders, ...form.products].length}
                    </Typography>
                  </div>
                  <div className={classes.requestCardContentRow}>
                    <Typography color='textSecondary'>
                      Total price
                    </Typography>
                    <Typography>
                      RM{displayCurrency(
                        form.orders.reduce((total, order) =>
                          total +
                          order.services.reduce((total, {service, price}) =>
                            total + (service.price.type === 'fixed'? service.price.amount:price?? 0),
                            0
                          ),
                          0
                        ) +
                        form.products.reduce(
                          (total, {quantity, price}) => total + (quantity * price),
                          0
                        )
                      )}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
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
type AddRequestConfirmDialogProps = {
  open: boolean
  onClose: (back?:boolean) => void
  form: AddRequestPageState['form']
}
type AddRequestConfirmDialogState = {
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default AddRequestPage