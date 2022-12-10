import * as React from 'react'
import MaskedInput, {MaskedInputProps} from 'react-text-mask'
import TextField, {TextFieldProps} from '@mui/material/TextField'

export const PasscodeInput = React.forwardRef<any, MaskedInputProps>((props, forwardRef) => {
  const [state, setState] = React.useState<PasscodeInputState>({})
  
  const setRef:React.Ref<MaskedInput> = React.useCallback(ref => {
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

  return (
    <MaskedInput
      {...props}
      ref={setRef}
      mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
      guide={false}
    />
  )
})
type PasscodeInputState = {
  input?: HTMLInputElement
}
const PasscodeTextField = (props:TextFieldProps) => {
  return (
    <TextField
      {...props}
      InputProps={{
        ...props.InputProps,
        inputComponent: PasscodeInput as any
      }}
    />
  )
}

export default PasscodeTextField