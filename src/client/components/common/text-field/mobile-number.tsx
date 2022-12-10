import * as React from 'react'
import MaskedInput, {conformToMask, MaskedInputProps} from 'react-text-mask'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import TextField, {TextFieldProps} from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

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
    paddingRight: '0.2em !important',
    opacity: 0,
    transition: theme.transitions.create(['opacity'])
  },
  activeAdornment: {
    opacity: 1
  }
}))
export const mobileNumberRegExp = /^\+601(1\d{8}|[02-9]\d{7})$/
export const conformToMobileNumber = (value:string) => {
  const cleaned = value.replace(/^\+60/, '')
  return `+60${conformToMask(
    cleaned,
    cleaned.startsWith('11')
      ? [/1/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
      : [/1/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
  ).conformedValue}`
}
export const MobileNumberInput = React.forwardRef<any, MaskedInputProps>((props, forwardRef) => {
  const [state, setState] = React.useState<MobileNumberInputState>({
    focused: false,
    mask: [/1/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
  })
  
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
      value: event.target.value,
      mask: event.target.value?.startsWith('11')
        ? [/1/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
        : [/1/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]
    }))
    props.onChange?.(event)
  }

  const {input, focused, value, mask} = state
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
        +60
      </Typography>
      <MaskedInput
        {...props}
        className={[props.className, classes.removePadding].join(' ')}
        ref={setRef}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        mask={mask}
        guide={false}
        placeholderChar={'\u2000'}
      />
    </div>
  )
})
type MobileNumberInputState = {
  input?: HTMLInputElement
  focused: boolean
  value?: string
  mask: (string | RegExp)[]
}
const MobileNumberTextField = (props:TextFieldProps) => {
  return (
    <TextField
      {...props}
      InputProps={{
        ...props.InputProps,
        inputComponent: MobileNumberInput as any
      }}
    />
  )
}

export default MobileNumberTextField