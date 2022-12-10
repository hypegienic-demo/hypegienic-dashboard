import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'

const useStyles = makeStyles((theme:Theme) => ({
  '@import': [
    'url(https://fonts.googleapis.com/css2?family=Arimo:wght@200;300;400;600;800&display=swap)'
  ] as any
}))
const Import:React.FunctionComponent = () => {
  const classes = useStyles({})
  return null
}

export default Import