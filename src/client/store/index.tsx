import * as React from 'react'
import Firebase from 'firebase'
import 'firebase/auth'

import {Provider as ScreenProvider} from './screen'
import {Provider as AuthenticationProvider} from './authentication'
import {Provider as ServiceProvider} from './service'
import {Provider as ProductProvider} from './product'
import {Provider as UserProvider} from './user'
import {Provider as RequestProvider} from './request'
import {Provider as StoreProvider} from './store'

Firebase.initializeApp({
  apiKey: 'AIzaSyBM4mVa_VYMG2MAg3DOJOy9aq3aKYGDhjA',
  authDomain: 'hypegienic.firebaseapp.com',
  databaseURL: 'https://hypegienic.firebaseio.com',
  projectId: 'hypegienic',
  storageBucket: 'hypegienic.appspot.com',
  messagingSenderId: '40226962206',
  appId: '1:40226962206:web:e12b07f4ecd16c3e41a70f',
  measurementId: 'G-YKBHZ9CQ6L'
})
Firebase.analytics()

const providers = [
  ScreenProvider,
  AuthenticationProvider,
  ServiceProvider,
  ProductProvider,
  UserProvider,
  RequestProvider,
  StoreProvider
]
const Provider:React.FC = (props) => {
  return [...providers]
    .reverse()
    .reduce((child, Provider) => (
      <Provider>
        {child}
      </Provider>
    ), <>{props.children}</>)
}
export default Provider

export const mapServerFile = (file:any):ServerFile => ({
  id: file.id,
  type: file.type,
  url: file.url
})
export type ServerFile = {
  id: string
  type: string
  url: string
}