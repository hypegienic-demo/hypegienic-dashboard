import * as React from 'react'
import MaskedInput, {MaskedInputProps} from 'react-text-mask'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import TextField, {TextFieldProps} from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

const useStyles = makeStyles((theme:Theme) => ({
  row: {
    display: 'flex !important',
    flexDirection: 'row',
    alignItems: 'center'
  },
  removePadding: {
    height: 'auto',
    padding: '0 !important'
  },
  adornment: {
    width: 'auto !important',
    minWidth: '23px',
    paddingRight: '0.2em !important',
    opacity: 0,
    transition: theme.transitions.create(['opacity'])
  },
  activeAdornment: {
    opacity: 1
  }
}))
export const CurrencyInput = React.forwardRef<any, CurrencyMaskedInputProps>((props, forwardRef) => {
  const [state, setState] = React.useState<CurrencyInputState>({
    focused: false,
    currencyMask: createNumberMask({
      prefix: '',
      allowDecimal: props.allowDecimal
    })
  })
  
  React.useEffect(() => {
    setState(state => ({
      ...state,
      currencyMask: createNumberMask({
        prefix: '',
        allowDecimal: props.allowDecimal
      })
    }))
  }, [props.allowDecimal])
  React.useEffect(() => {
    setState(state => ({
      ...state,
      value: props.value?.toString()
    }))
  }, [props.value])
  const setRef:React.Ref<MaskedInput> = React.useCallback((ref:MaskedInput) => {
    const input = ref
      ? ref.inputElement as HTMLInputElement
      : null
    if(input && !state.input) {
      setState(state => ({...state, input}))
    }
  }, [state.input])
  React.useImperativeHandle(forwardRef, () => {
    return state.input
  }, [state.input])

  const onFocus:React.FocusEventHandler<HTMLInputElement> = event => {
    setState(state => ({...state, focused:true}))
    props.onFocus?.(event)
  }
  const onBlur:React.FocusEventHandler<HTMLInputElement> = event => {
    setState(state => ({...state, focused:false}))
    props.onBlur?.(event)
  }
  const onChange:React.ChangeEventHandler<HTMLInputElement> = event => {
    setState(state => ({
      ...state,
      value: event.target.value
    }))
    props.onChange?.(event)
  }

  const {allowDecimal, ...other} = props
  const {input, focused, value, currencyMask} = state
  const classes = useStyles({})
  return (
    <div className={[props.className, classes.row].join(' ')}
      onClick={() => input?.focus()}
    >
      <Typography
        component='span'
        className={[
          props.className,
          classes.removePadding,
          classes.adornment,
          focused || ![undefined, ''].includes(value)
            ? classes.activeAdornment:''
        ].join(' ')}
      >
        RM
      </Typography>
      <MaskedInput
        {...other}
        className={[props.className, classes.removePadding].join(' ')}
        ref={setRef}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        mask={currencyMask}
        guide={false}
      />
    </div>
  )
})
type CurrencyMaskedInputProps = MaskedInputProps & {
  allowDecimal?: boolean
}
type CurrencyInputState = {
  input?: HTMLInputElement
  focused: boolean
  value?: string
  currencyMask?: any
}
const CurrencyTextField = (props:CurrencyTextFieldProps) => {
  const {allowDecimal, ...other} = props
  return (
    <TextField
      {...other}
      InputProps={{
        ...props.InputProps,
        inputComponent: CurrencyInput as any
      }}
      inputProps={{
        ...props.inputProps,
        allowDecimal
      }}
    />
  )
}
type CurrencyTextFieldProps = TextFieldProps & {
  allowDecimal?: boolean
}

export default CurrencyTextField