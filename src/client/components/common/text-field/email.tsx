import * as React from 'react'
import MaskedInput, {MaskedInputProps} from 'react-text-mask'
import TextField, {TextFieldProps} from '@mui/material/TextField'
import emailMask from 'text-mask-addons/dist/emailMask'

export const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
export const EmailInput = React.forwardRef<any, MaskedInputProps>((props, forwardRef) => {
  const [state, setState] = React.useState<EmailInputState>({})
  
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
      mask={{
        mask: (value:string, config:any) => {
          const regexps = emailMask.mask(value, config)
          return regexps.map((regexp:string) =>
            regexp === '@'
              ? /\@/
              : regexp === '.'
              ? /\./
              : regexp
          )
        },
        pipe: emailMask.pipe
      } as any}
      guide={false}
    />
  )
})
type EmailInputState = {
  input?: HTMLInputElement
}
const EmailTextField = (props:TextFieldProps) => {
  return (
    <TextField
      {...props}
      InputProps={{
        ...props.InputProps,
        inputComponent: EmailInput as any
      }}
    />
  )
}

export default EmailTextField