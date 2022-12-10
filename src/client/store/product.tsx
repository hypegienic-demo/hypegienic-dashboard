import * as React from 'react'

import {useAuthenticationState} from './authentication'

export type State = {
  products?: Product[]
}
type Action = {
  displayProducts: () => Promise<Product[]>
}
const ProductContext = React.createContext([
  {} as State,
  {} as Action
] as const)

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({})
  const [{authenticated}] = useAuthenticationState()

  const displayProducts:Action['displayProducts'] = async() => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayProducts {
          id
          name
          price {
            type
            amount
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
    const products:Product[] = body.data.displayProducts?.map(mapProduct)
    setState(state => ({
      ...state,
      products
    }))
    return products
  }

  return (
    <ProductContext.Provider value={[state, {
      displayProducts
    }]}>
      {props.children}
    </ProductContext.Provider>
  )
}
export const useProductState = () => {
  return React.useContext(ProductContext)
}

export const mapProduct = (product:any):Product => ({
  id: product.id,
  name: product.name,
  price: product.price
})
export type Product = {
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
}