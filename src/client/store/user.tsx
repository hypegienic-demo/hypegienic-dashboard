import * as React from 'react'

import {useAuthenticationState} from './authentication'
import {stringify} from '../utility/graphql'

export type State = {
  users?: User[]
}
type Action = {
  createUser: (user: {
    displayName: string
    mobileNumber: string
    email: string
    address?: string
  }) => Promise<User>
  updateUser: (user: {
    userId: string
    displayName?: string
    mobileNumber?: string
    email?: string
    address?: string
  }) => Promise<User>
  displayUsers: () => Promise<User[]>
}
const UserContext = React.createContext([
  {} as State,
  {} as Action
] as const)

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({})
  const [{authenticated}] = useAuthenticationState()

  const createUser:Action['createUser'] = async user => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        addUser(
          ${stringify(user)}
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
    const added = mapUser(body.data.addUser)
    return added
  }
  const updateUser:Action['updateUser'] = async user => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        updateProfile(
          ${stringify(user)}
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
    const added = mapUser(body.data.updateProfile)
    return added
  }
  const displayUsers:Action['displayUsers'] = async() => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayUsers {
          id
          firebaseId
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
    const users:User[] = body.data.displayUsers?.map(mapUser)
    setState(state => ({
      ...state,
      users
    }))
    return users
  }

  return (
    <UserContext.Provider value={[state, {
      createUser,
      updateUser,
      displayUsers
    }]}>
      {props.children}
    </UserContext.Provider>
  )
}
export const useUserState = () => {
  return React.useContext(UserContext)
}

export const mapUser = (user:any):User => ({
  id: user.id,
  firebaseId: user.firebaseId,
  displayName: user.displayName,
  mobileNumber: user.mobileNumber,
  email: user.email,
  address: user.address,
  employee: user.employee
})
export type User = {
  id: string
  firebaseId?: string
  displayName: string
  mobileNumber: string
  email?: string
  address?: string
  employee?: 'admin' | 'staff'
}