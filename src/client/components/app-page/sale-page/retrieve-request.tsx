import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {useTheme, Theme} from '@mui/material/styles'
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
const RetrieveRequestDialog:React.FunctionComponent<RetrieveRequestDialogProps> = (props) => {
  const [state, setState] = React.useState<RetrieveRequestDialogState>({
    step: 0,
    loading: false
  })
  const [, {requestRetrieveStore, confirmClosedLocker}] = useRequestState()

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
        const lockerUnit = await requestRetrieveStore({
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
                  {order?.id} {order?.name} to retrieved store
                </Typography>
              </div>
            </div>
            <DisplayLockerUnit
              play={!!order && step === 1}
              title='Retrieve Order'
              description='Please take the order out of the locker and close back the locker unit'
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
type RetrieveRequestDialogProps = {
  order?: OrderDetailed
  onClose: () => void
}
type RetrieveRequestDialogState = {
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

const useDisplayLockerUnitStyles = makeStyles((theme:Theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 24px 24px'
  },
  titleSection: {
    paddingBottom: '8px'
  },
  title: {
    fontWeight: 600
  },
}))
export const DisplayLockerUnit:React.FunctionComponent<DisplayLockerUnitProps> = (props) => {
  const [state, setState] = React.useState<DisplayLockerUnitState>({})
  const theme = useTheme<Theme>()

  React.useEffect(() => {
    const {play, lockerUnit} = props
    const {canvas, drawing} = state
    const context = canvas?.getContext('2d')
    if(play && lockerUnit && canvas && context && !drawing) {
      setState(state => ({
        ...state,
        drawing: window.requestAnimationFrame(() =>
          drawOnCanvas(lockerUnit, canvas, context, new Date())
        )
      }))
    }
  }, [props.play, props.lockerUnit, state.canvas, state.drawing])
  React.useEffect(() => {
    const {drawing} = state
    if(!props.play && drawing) {
      cancelAnimationFrame(drawing)
      setState(state => ({
        ...state,
        canvas: undefined,
        drawing: undefined
      }))
    }
  }, [props.play, state.drawing])
  const drawOnCanvas = (lockerUnit:NonNullable<DisplayLockerUnitProps['lockerUnit']>, canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, start:Date) => {
    const computedStyle = window.getComputedStyle(canvas)
    canvas.width = parseFloat(computedStyle.width)
    canvas.height = parseFloat(computedStyle.height)
    context.clearRect(0, 0, canvas.width, canvas.height)
    const ratio = (64 * lockerUnit.locker.columns) / (48 * lockerUnit.locker.rows)
    const maxWidth = Math.min(canvas.width - 2, 64 * lockerUnit.locker.columns)
    const maxHeight = Math.min(canvas.height - 2, 48 * lockerUnit.locker.rows)
    const width = (maxWidth / maxHeight) > ratio
      ? maxHeight * ratio
      : maxWidth
    const height = width / ratio
    const borderRadius = 4
    const rectangular = {
      x: (canvas.width - width) / 2,
      y: (canvas.height - height) / 2,
      width,
      height
    }

    context.beginPath()
    context.moveTo(rectangular.x + borderRadius, rectangular.y)
    context.lineTo(rectangular.x + rectangular.width - borderRadius, rectangular.y)
    context.quadraticCurveTo(rectangular.x + rectangular.width, rectangular.y, rectangular.x + rectangular.width, rectangular.y + borderRadius)
    context.lineTo(rectangular.x + rectangular.width, rectangular.y + rectangular.height - borderRadius)
    context.quadraticCurveTo(rectangular.x + rectangular.width, rectangular.y + rectangular.height, rectangular.x + rectangular.width - borderRadius, rectangular.y + rectangular.height)
    context.lineTo(rectangular.x + borderRadius, rectangular.y + rectangular.height)
    context.quadraticCurveTo(rectangular.x, rectangular.y + rectangular.height, rectangular.x, rectangular.y + rectangular.height - borderRadius)
    context.lineTo(rectangular.x, rectangular.y + borderRadius)
    context.quadraticCurveTo(rectangular.x, rectangular.y, rectangular.x + borderRadius, rectangular.y)
    context.closePath()
    context.lineWidth = 1
    context.strokeStyle = 'rgb(33, 33, 33)'
    context.stroke()

    const columnWidth = rectangular.width / lockerUnit.locker.columns
    for(const column of Array(lockerUnit.locker.columns - 1).fill(undefined).map((_, index) => index)) {
      const x = rectangular.x + columnWidth * (column + 1)
      context.beginPath()
      context.moveTo(x, rectangular.y)
      context.lineTo(x, rectangular.y + height)
      context.closePath()
      context.strokeStyle = 'rgba(33, 33, 33, 0.12)'
      context.stroke()
    }

    const rowHeight = rectangular.height / lockerUnit.locker.rows
    for(const row of Array(lockerUnit.locker.rows - 1).fill(undefined).map((_, index) => index)) {
      const y = rectangular.y + rowHeight * (row + 1)
      context.beginPath()
      context.moveTo(rectangular.x, y)
      context.lineTo(rectangular.x + width, y)
      context.closePath()
      context.strokeStyle = 'rgba(33, 33, 33, 0.12)'
      context.stroke()
    }

    lockerUnit.locker.units.forEach(unit => {
      context.fillStyle = 'rgb(33, 33, 33)'
      context.font = `16px ${theme.typography.fontFamily?.toString()}`
      context.fillText(
        unit.number.toString(),
        rectangular.x + columnWidth * (unit.column - 1) + 4,
        rectangular.y + rowHeight * unit.row - 32,
      )
    })

    const progress = ((Date.now() - start.getTime()) % 1800) / 1800
    const unit = lockerUnit.locker.units.find(unit => unit.id === lockerUnit.id)
    const pulseRadius = Math.sqrt(Math.pow(columnWidth, 2) + Math.pow(rowHeight, 2)) / 2
    const pulseCenter = {
      x: rectangular.x + columnWidth * ((unit?.column?? 1) - 0.5),
      y: rectangular.y + rowHeight * ((unit?.row?? 1) - 0.5)
    }
    for(const index of [0, 1, 2]) {
      const currentProgress = progress <= 0.6 + index * 0.2
        ? Math.max((progress - 0.3 - index * 0.2) / 0.3, 0)
        : 0
      context.beginPath()
      context.arc(pulseCenter.x, pulseCenter.y, pulseRadius * currentProgress, 0, 2 * Math.PI)
      context.closePath()
      context.fillStyle = `rgba(0, 181, 242, ${1 - currentProgress})`
      context.fill()
    }

    if(props.play) {
      setState(state => ({
        ...state,
        drawing: window.requestAnimationFrame(() =>
          drawOnCanvas(lockerUnit, canvas, context, start)
        )
      }))
    }
  }
  const setCanvasRef:React.Ref<HTMLCanvasElement> =
    React.useCallback((canvas:HTMLCanvasElement) => {
      if(canvas && !state.canvas) {
        setState(state => ({
          ...state,
          canvas
        }))
      }
    }, [state.canvas])
  
  const {title, description} = props
  const classes = useDisplayLockerUnitStyles()
  return (
    <div className={classes.content}>
      <div className={classes.titleSection}>
        <Typography variant='h5' color='textPrimary'
          classes={{root:classes.title}} gutterBottom={!description}
        >
          {title}
        </Typography>
        {description? (
          <Typography variant='h6' color='textSecondary'
            gutterBottom
          >
            {description}
          </Typography>
        ):undefined}
      </div>
      <canvas ref={setCanvasRef} style={{
        height: '380px'
      }}/>
    </div>
  )
}
type DisplayLockerUnitProps = {
  play: boolean
  title: string
  description?: string
  lockerUnit?: LockerUnit & {
    locker: Locker & {
      units: LockerUnit[]
    }
  }
}
type DisplayLockerUnitState = {
  canvas?: HTMLCanvasElement
  drawing?: number
}

export default RetrieveRequestDialog