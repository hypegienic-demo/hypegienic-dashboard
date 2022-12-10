import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Theme, ThemeProvider, createTheme} from '@mui/material/styles'

import Provider from './store'
import Favicon from './components/favicon'
import Import from './components/import'
import Router from './components'

const theme:Theme = createTheme({
  palette: {
    text: {
      primary: 'rgb(34, 39, 51)',
      secondary: 'rgba(34, 39, 51, 0.54)'
    },
    primary: {
      main: 'rgb(33, 33, 33)',
      contrastText: 'rgb(255, 255, 255)'
    },
    secondary: {
      main: 'rgb(0, 181, 242)'
    },
    background: {
      default: 'rgb(255, 255, 255)'
    }
  },
  typography: {
    fontFamily: ['Arimo', 'sans-serif'].join(',')
  }
})

ReactDOM.render(
  <Provider>
    <ThemeProvider theme={theme}>
      <Favicon/>
      <Import/>
      <Router/>
    </ThemeProvider>
  </Provider>
, document.getElementById('root'))