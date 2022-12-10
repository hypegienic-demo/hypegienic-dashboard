import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pageContainer: {
    width: '1200px',
    maxWidth: '100%',
    minHeight: '100%',
    padding: '32px',
    flexWrap: 'wrap',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      padding: '24px',
    }
  },
  divider: {
    width: '2px',
    height: '24px',
    margin: '0 8px',
    backgroundColor: theme.palette.text.primary
  }
}))
const e404page:React.FunctionComponent = () => {
  const classes = useStyles({})
  return (
    <div className={classes.container}>
      <Grid container direction='row' justifyContent='center' alignItems='center' classes={{container:classes.pageContainer}}>
        <Typography color='textPrimary' variant='h5'>
          404
        </Typography>
        <div className={classes.divider}/>
        <Typography color='textPrimary' variant='h5'>
          NOT FOUND
        </Typography>
      </Grid>
    </div>
  )
}

export default e404page