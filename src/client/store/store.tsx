import * as React from 'react'

import {useAuthenticationState} from './authentication'
import {stringify} from '../utility/graphql'

export type State = {
  selectedStore?: string
  simplifiedStores?: StoreSimplified[]
  detailedStores: Record<string, StoreDetailed>
}
type Action = {
  addTransaction: (transaction: {
    amount: number
    remark: string
    attachments: File[]
    time?: Date
  } & (
    | {
        transaction: 'inflow'
        to: TransactionTarget
      }
    | {
        transaction: 'outflow'
        from: TransactionTarget
      }
    | {
        transaction: 'transfer'
        from: TransactionTarget
        to: TransactionTarget
      }
  )) => Promise<void>
  displayStores: () => Promise<StoreSimplified[]>
  displayStore: (storeId:string) => Promise<StoreDetailed>
  selectStore: (storeId:string) => void
  displayTransactions: (storeId:string, dateRange: {
    from: Date
    to: Date
  }) => Promise<StoreDetailed>
}
const StoreContext = React.createContext([
  {} as State,
  {} as Action
] as const)

type TransactionTarget = {
  storeId: string
  balance: 'cash' | 'bank' | 'payment-gateway'
}

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({
    detailedStores: {}
  })
  const [{authenticated}] = useAuthenticationState()

  React.useEffect(() => {
    const selectedStore = localStorage.getItem('selected-store')
    if(typeof selectedStore === 'string') {
      setState(state => ({...state, selectedStore}))
    }
  }, [])

  const addTransaction:Action['addTransaction'] = async transaction => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    transaction.attachments.forEach(file =>
      form.append('attachments', file)
    )
    form.append('graphql', `
      mutation${transaction.attachments.length > 0
        ? 'AddTransaction($attachments: [Upload!]!) '
        : ''
      } {
        addTransaction(
          ${stringify({
            ...transaction,
            attachments: transaction.attachments.length > 0
              ? '$attachments'
              : []
          })}
        )
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
    return
  }
  const displayStores:Action['displayStores'] = async() => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayStores {
          ${storeSimplified.query}
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
    const simplifiedStores:StoreSimplified[] = body.data.displayStores?.map(storeSimplified.map)
    setState(state => ({
      ...state,
      simplifiedStores
    }))
    return simplifiedStores
  }
  const displayStore:Action['displayStore'] = async storeId => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    const now = new Date()
    now.setMonth(now.getMonth() - 4)
    now.setDate(1)
    const fiveMonthsAgo = new Date(now.setHours(0, 0, 0, 0))
    form.append('graphql', `
      query {
        displayStores(
          ${stringify({
            storeId
          })}
        ) {
          ${storeDetailed.query(fiveMonthsAgo)}
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
    const stores:StoreDetailed[] = body.data.displayStores?.map(storeDetailed.map)
    const store = stores[0]
    setState(state => ({
      ...state,
      detailedStores: {
        ...state.detailedStores,
        [store.id]: store
      }
    }))
    return store
  }
  const selectStore:Action['selectStore'] = storeId => {
    localStorage.setItem('selected-store', storeId)
    setState(state => ({...state, selectedStore:storeId}))
  }
  const displayTransactions:Action['displayTransactions'] = async(storeId, dateRange) => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayStores(
          ${stringify({
            storeId
          })}
        ) {
          ${storeSimplified.query}
          transactions(
            ${stringify({
              after: dateRange.from,
              before: dateRange.to
            })}
          ) {
            type
            detail
            time
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
    const stores:StoreDetailed[] = body.data.displayStores?.map(storeDetailed.map)
    return stores[0]
  }

  return (
    <StoreContext.Provider value={[state, {
      addTransaction,
      displayStores,
      displayStore,
      selectStore,
      displayTransactions
    }]}>
      {props.children}
    </StoreContext.Provider>
  )
}
export const useStoreState = () => {
  return React.useContext(StoreContext)
}

export const storeSimplified = {
  query: `
    id
    name
    registrationNumber
    address
    mobileNumber
    email
  `,
  map: (store:any):StoreSimplified => ({
    ...store
  })
}
export type StoreSimplified = {
  id: string
  name: string
  registrationNumber: string
  address: string
  mobileNumber: string
  email: string
}

const storeDetailed = {
  query: (transactionsAfter:Date) => `
    ${storeSimplified.query}
    balance {
      cash
      bank
      paymentGateway
    }
    transactions(
      ${stringify({after:transactionsAfter})}
    ) {
      type
      detail
      time
      amount
    }
  `,
  map: (store:any):StoreSimplified => ({
    ...store,
    ...storeSimplified.map(store),
    transactions: store.transactions.map((transaction:any) => ({
      ...transaction,
      time: new Date(Date.parse(transaction.time))
    }))
  })
}
export type StoreDetailed = StoreSimplified & {
  balance: {
    cash: number
    bank: number
    paymentGateway: number
  }
  transactions: {
    type: 'profit' | 'expense'
    detail: string
    time: Date
    amount: number
  }[]
}