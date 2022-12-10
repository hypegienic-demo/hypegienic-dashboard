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
import CircularProgress from '@mui/material/CircularProgress'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import Snackbar from '@mui/material/Snackbar'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'

import {useProductState, Product} from '../../../store/product'
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
const AddProductsDialog:React.FunctionComponent<AddProductsDialogProps> = (props) => {
  const [state, setState] = React.useState<AddProductsDialogState>({
    step: 0,
    form: {},
    fields: {},
    loading: false
  })
  const [{products}, {displayProducts}] = useProductState()

  React.useEffect(() => {
    const {addedProducts} = props
    if(addedProducts) {
      const updateForm = async() => {
        await displayProducts()
        setState(state => ({
          ...state,
          form: {
            ...state.form,
            products: addedProducts.map(({product, quantity, price}) => ({
              id: product.id,
              quantity,
              price
            }))
          },
          fields: {}
        }))
      }
      updateForm()
    }
  }, [props.addedProducts])

  const setInputRef:(label:keyof AddProductsDialogState['fields']) => React.Ref<HTMLInputElement> =
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
  const onChangeForm = (form:Partial<AddProductsDialogState['form']>) => {
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
    if(state.step === 0) {
      const { form } = state
      const incomplete = form.products?.some(product =>
        typeof product.quantity !== 'number' || product.quantity === 0 ||
        typeof product.price !== 'number'
      )
      const products = form.products?.flatMap(product =>
        typeof product.quantity === 'number' && product.quantity > 0 &&
        typeof product.price === 'number'
          ? [{...product, quantity:product.quantity, price:product.price}]
          : []
      )
      if(!products || incomplete) {
        setError('Please complete adding a product first')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1) {
      const {products:chosenProducts} = state.form
      setState(state => ({
        ...state,
        step: 0,
        form: {},
        loading: false
      }))
      props.onClose(chosenProducts?.flatMap(({id, quantity, price}) => {
        const product = products?.find(product => product.id === id)
        return product && typeof quantity === 'number' && typeof price === 'number'
          ? [{product, quantity, price}]
          : []
      })?? [])
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

  const {addedProducts, onClose} = props
  const {step, form, fields, loading, error} = state
  const classes = useStyles({})
  const renderProduct = (product:Product) => {
    const chosen = form.products?.find(({id}) => id === product.id)
    const onCheck = () => onChangeForm({
      products: [
        ...form.products?? [],
        ...!form.products?.some(({id}) => id === product.id)
          ? [{
              id: product.id,
              quantity: 1,
              price: product.price.type === 'fixed'
                ? product.price.amount
                : undefined
            }]
          : []
      ]
    })
    const onUncheck = () => onChangeForm({
      products: form.products?.filter(({id}) => id !== product.id)?? []
    })
    return (
      <ListItem key={product.id} dense
        onClick={() => {
          if(!chosen) {
            fields[`product.${product.id}`]?.focus()
            onCheck()
          } else {
            onUncheck()
          }
        }}
        button
        classes={{dense:classes.listItem}}
      >
        <ListItemIcon>
          <Checkbox edge='start'
            checked={!!chosen}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={product.name}
          secondary={
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '3px'
            }}>
              <TextField
                inputRef={setInputRef(`product.${product.id}`)}
                type='number'
                value={chosen?.quantity?? 1}
                onClick={event => event.stopPropagation()}
                onFocus={() => onCheck()}
                onChange={event => {
                  const value = parseInt(event.target.value.replace(/[^0-9]/g, '')?? '')
                  onChangeForm({
                    products: [
                      ...form.products?.filter(({id}) => id !== product.id)?? [],
                      chosen
                        ? {...chosen, quantity:value && !isNaN(value)? value:''}
                        : {id:product.id, quantity:value && !isNaN(value)? value:''}
                    ]
                  })
                }}
                variant='outlined'
                size='small'
                fullWidth
              />
              <CurrencyTextField
                value={chosen?.price??
                  (product.price.type === 'fixed'? product.price.amount:undefined)
                }
                onClick={event => event.stopPropagation()}
                onFocus={() => onCheck()}
                onChange={event => {
                  const value = parseFloat(event.target.value.replace(/[^0-9]/g, '')?? '')
                  onChangeForm({
                    products: [
                      ...form.products?.filter(({id}) => id !== product.id)?? [],
                      chosen
                        ? {...chosen, price:value && !isNaN(value)? value:''}
                        : {id:product.id, price:value && !isNaN(value)? value:''}
                    ]
                  })
                }}
                variant='outlined'
                size='small'
                fullWidth
              />
            </div>
          }
        />
      </ListItem>
    )
  }
  return (
    <>
      <Dialog open={!!addedProducts && !!products}
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
                  Add Products
                </Typography>
              </div>
              <div className={classes.formFields}>
                <List>
                  {products?.map(renderProduct)}
                </List>
              </div>
            </div>
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Confirm Product
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div className={classes.orderCardContent} style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {form.products?.flatMap(({id, quantity, price}) => {
                      const product = products?.find(product => product.id === id)
                      return product? [(
                        <Typography key={product.id} color='textPrimary'>
                          {product.name + ' '}
                          <Typography component='span' color='textSecondary'>
                            {quantity + ' × '}
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
type AddProductsDialogProps = {
  addedProducts?: {
    product: Product
    quantity: number
    price: number
  }[]
  onClose: (products?: {
    product: Product
    quantity: number
    price: number
  }[]) => void
}
type AddProductsDialogState = {
  step: number
  form: {
    products?: {
      id: string
      quantity?: number | ''
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

export default AddProductsDialog