import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    position: 'relative',
    width: '100%'
  }
}))
const Async:React.FunctionComponent<AsyncProps<any>> = (props) => {
  const {props:childProps} = props
  const [state, setState] = React.useState<AsyncState>({})
  React.useEffect(() => {
    props.module().then((page) => setState({Component:page.default}))
  }, [])

  const {Component} = state
  const classes = useStyles({})
  return (
    <div className={classes.container}>
      {Component
        ? <Component {...childProps}/>
        : null
      }
    </div>
  )
}
type AsyncProps<T> = {
  module: () => Promise<{default:React.FunctionComponent<T>}>
  props: T
}
type AsyncState = {
  Component?: React.FunctionComponent
}

export default Async