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
import Snackbar from '@mui/material/Snackbar'

import {useRequestState, OrderDetailed} from '../../../store/request'
import FileField from '../../common/text-field/file'

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
const AddAfterImagesDialog:React.FunctionComponent<AddAfterImagesDialogProps> = (props) => {
  const [state, setState] = React.useState<AddAfterImagesDialogState>({
    step: 0,
    form: {},
    loading: false
  })
  const [, {addAfterImages}] = useRequestState()

  React.useEffect(() => {
    setTimeout(() => state.updateHeight?.())
  }, [state.updateHeight, state.form.imagesAfter])

  const onChangeForm = (form:Partial<AddAfterImagesDialogState['form']>) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        ...form
      }
    }))
  }
  const onSwipeableAction = (hooks:{updateHeight:() => void}) => {
    setState(state => ({
      ...state,
      updateHeight: hooks.updateHeight
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
      const {imagesAfter} = state.form
      if(!imagesAfter || imagesAfter.length === 0) {
        setError('Please add in at least 1 image first')
      } else {
        setState(state => ({
          ...state,
          step: 1
        }))
      }
    } else if(state.step === 1 && order) {
      const {imagesAfter} = state.form
      setState(state => ({...state, loading:true}))
      try {
        await addAfterImages({
          orderId: order.id,
          imagesAfter: imagesAfter?? []
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
  return (
    <>
      <Dialog open={!!order}
        TransitionComponent={SlideUpTransition}
        onClose={onClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}>
          <SwipeableViews index={step} animateHeight disabled
            {...{action:onSwipeableAction} as any}
          >
            <div className={classes.content}>
              <div className={classes.titleSection}>
                <Typography variant='h5' color='textPrimary'
                  classes={{root:classes.title}} gutterBottom
                >
                  Add After Images
                </Typography>
              </div>
              <div className={classes.formFields}>
                <FileField
                  label='Images After'
                  values={form.imagesAfter}
                  onChange={imagesAfter => onChangeForm({imagesAfter})}
                />
              </div>
            </div>
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
                  {order?.id} {order?.name} to cleaned
                </Typography>
              </div>
              <div className={classes.formFieldCards}>
                <Card variant='outlined'>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowY: 'auto'
                  }}>
                    {form.imagesAfter?.map((image, index) => {
                      const source = URL.createObjectURL(image)
                      return (
                        <div key={index} style={{
                          height: '160px',
                          width: '240px',
                          minWidth: '240px',
                          background: `url("${source}") center/contain no-repeat`
                        }}/>
                      )
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
type AddAfterImagesDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type AddAfterImagesDialogState = {
  step: number
  form: {
    imagesAfter?: File[]
  }
  updateHeight?: () => void
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export default AddAfterImagesDialog