import * as React from 'react'
import Firebase from 'firebase/app'
import 'firebase/auth'

import {stringify} from '../utility/graphql'

export type State = {
  verifier?: Firebase.auth.ApplicationVerifier
  authenticatingResult?: Firebase.auth.ConfirmationResult
  authenticated?: Firebase.User | null
  profile?: Profile
}
type Action = {
  signInMobile: (mobileNumber:string) => Promise<Firebase.auth.ConfirmationResult>
  submitPasscode: (passcode:string) => Promise<SignInResponse>
  signOut: () => Promise<void>
  registerProfile: (profile: {
    displayName: string
    email: string
  }) => Promise<Profile>
  displayProfile: () => Promise<Profile>
}
const AuthenticationContext = React.createContext([
  {} as State,
  {} as Action
] as const)

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({})

  React.useEffect(() => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const verifier = new Firebase.auth.RecaptchaVerifier(div, {
      size: 'invisible'
    })
    setState(state => ({
      ...state,
      verifier
    }))
    const unsubscribe = Firebase.auth().onAuthStateChanged(user => {
      if(user !== null) {
        div.style.opacity = '0'
      }
      setState(state => ({
        ...state,
        authenticated: user
      }))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const signInMobile:Action['signInMobile'] = async mobileNumber => {
    if(!state.verifier) {
      throw new Error('Firebase application is not initialized')
    }
    const authenticatingResult = await Firebase.auth().signInWithPhoneNumber(mobileNumber, state.verifier)
    setState(state => ({
      ...state,
      authenticatingResult
    }))
    return authenticatingResult
  }
  const submitPasscode:Action['submitPasscode'] = async passcode => {
    if(!state.authenticatingResult) {
      throw new Error('Please attempt to sign in first')
    }
    const {user} = await state.authenticatingResult.confirm(passcode)
    if(!user) {
      throw new Error('User is unauthorized')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        signIn {
          registered
          detail {
            displayName
            email
            employee
          }
        }
      }
    `)
    const body = await fetch(`${HYPEGIENIC_API}/root`, {
      method: 'POST',
      headers: {
        'Authorization': await user.getIdToken()
      },
      body: form
    }).then((response) => response.json())
    const errors = body.errors
    if(errors && errors.length > 0) {
      throw new Error(errors[0])
    }
    const response = mapSignInResponse(body.data.signIn)
    if(!response.registered || !response.detail?.employee) {
      return response
    } else {
      setState(state => ({
        ...state,
        authenticatingResult: undefined
      }))
      return response
    }
  }
  const signOut:Action['signOut'] = async() => {
    await Firebase.auth().signOut()
  }
  const registerProfile:Action['registerProfile'] = async profile => {
    const {authenticated} = state
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        registerMobile(
          ${stringify(profile)}
        ) {
          id
          displayName
          mobileNumber
          email
          address
          employee
        }
      }
    `)
    const body = await fetch(`${HYPEGIENIC_API}/root`, {
      method: 'POST',
      headers: {
        'Authorization': await authenticated.getIdToken()
      },
      body: form
    }).then((response) => response.json())
    const errors = body.errors
    if(errors && errors.length > 0) {
      throw new Error(errors[0])
    }
    const registered = mapProfile(body.data.registerMobile)
    if(!registered.employee) {
      return registered
    } else {
      setState(state => ({
        ...state,
        authenticatingResult: undefined
      }))
      return registered
    }
  }
  const displayProfile:Action['displayProfile'] = async() => {
    const {authenticated} = state
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayProfile {
          id
          displayName
          mobileNumber
          email
          address
          employee
        }
      }
    `)
    const body = await fetch(`${HYPEGIENIC_API}/root`, {
      method: 'POST',
      headers: {
        'Authorization': await authenticated.getIdToken()
      },
      body: form
    }).then((response) => response.json())
    const errors = body.errors
    if(errors && errors.length > 0) {
      throw new Error(errors[0])
    }
    const profile = mapProfile(body.data.displayProfile)
    setState(state => ({
      ...state,
      profile
    }))
    return profile
  }

  return (
    <AuthenticationContext.Provider value={[state, {
      signInMobile,
      submitPasscode,
      signOut,
      registerProfile,
      displayProfile
    }]}>
      {props.children}
    </AuthenticationContext.Provider>
  )
}
export const useAuthenticationState = () => {
  return React.useContext(AuthenticationContext)
}

const mapSignInResponse = (response:any):SignInResponse => ({
  registered: response.registered,
  detail: response.detail
    ? {
        displayName: response.detail.displayName,
        email: response.detail.email,
        employee: response.detail.employee
      }
    : undefined
})
export type SignInResponse = {
  registered: boolean
  detail?: {
    displayName: string
    email: string
    employee?: string
  }
}

const mapProfile = (profile:any):Profile => ({
  id: profile.id,
  displayName: profile.displayName,
  mobileNumber: profile.mobileNumber,
  email: profile.email,
  address: profile.address,
  employee: profile.employee
})
export type Profile = {
  id: string
  displayName: string
  mobileNumber: string
  email: string
  address?: string
  employee?: string
}