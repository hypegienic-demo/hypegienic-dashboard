import * as React from 'react'

import {useAuthenticationState} from './authentication'

export type State = {
  services?: Service[]
}
type Action = {
  displayServices: () => Promise<Service[]>
}
const ServiceContext = React.createContext([
  {} as State,
  {} as Action
] as const)

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({})
  const [{authenticated}] = useAuthenticationState()

  const displayServices:Action['displayServices'] = async() => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayServices {
          id
          type
          name
          price {
            type
            amount
          }
          icon
          exclude {
            id
          }
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
    const services:Service[] = body.data.displayServices?.map(mapService)
    setState(state => ({
      ...state,
      services
    }))
    return services
  }

  return (
    <ServiceContext.Provider value={[state, {
      displayServices
    }]}>
      {props.children}
    </ServiceContext.Provider>
  )
}
export const useServiceState = () => {
  return React.useContext(ServiceContext)
}

export const mapService = (service:any):Service => ({
  id: service.id,
  name: service.name,
  price: service.price,
  ...service.type === 'main'
    ? {
        type: 'main',
        icon: service.icon,
        exclude: service.exclude?.map((service:any) => service.id)
      }
    : {type:'additional'}
})
export type Service = {
  id: string
  name: string
  price:
    | {
        type: 'fixed',
        amount: number
      }
    | {
        type: 'variable'
      }
} & (
  | {
    type: 'main'
    icon: string
    exclude: string[]
  }
  | {
    type: 'additional'
  }
)