import * as React from 'react'

import {ServerFile, mapServerFile} from '.'
import {useAuthenticationState} from './authentication'
import {Service, mapService} from './service'
import {User, mapUser} from './user'
import {StoreSimplified, storeSimplified} from './store'
import {stringify} from '../utility/graphql'

export type State = {
  simplifiedRequests?: OrdersRequestSimplified[]
  detailedRequests: Record<string, OrdersRequestDetailed>
}
type Action = {
  createRequest: (request: {
    storeId: string
    ordererId: string
    orders: {
      name: string
      services: {
        id: string
        price?: number
      }[]
    }[]
    products: {
      id: string
      quantity: number
      price: number
    }[]
  }) => Promise<void>
  requestRetrieveStore: (request: {
    orderId: string
  }) => Promise<LockerUnit & {
    locker: Locker & {
      units: LockerUnit[]
    }
  }>
  addBeforeImages: (request: {
    orderId: string
    imagesBefore: File[]
  }) => Promise<void>
  updateServiceStatus: (request: {
    orderId: string
    servicesDone: string[]
  }) => Promise<void>
  addAfterImages: (request: {
    orderId: string
    imagesAfter: File[]
  }) => Promise<void>
  requestDeliverLocker: (request: {
    orderId: string
  }) => Promise<LockerUnit & {
    locker: Locker & {
      units: LockerUnit[]
    }
  }>
  confirmRetrieve: (request: {
    orderId: string
  }) => Promise<void>
  updateServices: (request: {
    orderId: string
    services: {
      id: string
      price?: number
    }[]
  }) => Promise<void>
  confirmUndo: (request: {
    orderId: string
  }) => Promise<void>
  confirmClosedLocker: (request: {
    lockerUnitId: string
  }) => Promise<void>
  addPayment: (request: {
    requestId: string
    payment: {
      type: string
      amount: number
      reference?: string
      time?: string
    }
  }) => Promise<void>
  updateProducts: (request: {
    requestId: string
    products: {
      id: string
      quantity: number
      price: number
    }[]
  }) => Promise<void>
  updatePickUpTime: (request: {
    requestId: string
    time: string
  }) => Promise<void>
  updateRemark: (request: {
    requestId: string
    remark: string
  }) => Promise<void>
  cancelRequest: (request: {
    requestId: string
  }) => Promise<void>
  displayRequests: () => Promise<OrdersRequestSimplified[]>
  displayRequest: (requestId:string) => Promise<OrdersRequestDetailed>
  sendEmail: (request: {
    to: string
    subject: string
    text: string
    attachments?: File[]
  }) => Promise<void>
}
const RequestContext = React.createContext([
  {} as State,
  {} as Action
] as const)

export const Provider:React.FC = (props) => {
  const [state, setState] = React.useState<State>({
    detailedRequests: {}
  })
  const [{authenticated}] = useAuthenticationState()

  const createRequest:Action['createRequest'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        addRequest(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const requestRetrieveStore:Action['requestRetrieveStore'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        requestRetrieveStore(
          ${stringify(request)}
        ) {
          id
          lockerUnitOpened {
            id
            locker {
              id
              name
              rows
              columns
              units {
                id
                number
                row
                column
              }
            }
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
    const lockerUnit = mapLockerUnit(
      body.data.requestRetrieveStore.lockerUnitOpened
    )
    const locker = lockerUnit.locker
    const lockerUnits = locker?.units
    if(!locker || !lockerUnits) {
      throw new Error('Failed to fetch the whole locker layout')
    }
    return {
      ...lockerUnit,
      locker: {
        ...locker,
        units: lockerUnits
      }
    }
  }
  const addBeforeImages:Action['addBeforeImages'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    request.imagesBefore.forEach(image =>
      form.append('imagesBefore', image)
    )
    form.append('graphql', `
      mutation AddBeforeImages($imagesBefore: [Upload!]!) {
        addBeforeImages(
          ${stringify({
            orderId: request.orderId,
            imagesBefore: '$imagesBefore'
          })}
        ) {
          id
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
    return
  }
  const updateServiceStatus:Action['updateServiceStatus'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        updateServiceStatus(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const addAfterImages:Action['addAfterImages'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    request.imagesAfter.forEach(image =>
      form.append('imagesAfter', image)
    )
    form.append('graphql', `
      mutation AddAfterImages($imagesAfter: [Upload!]!) {
        addAfterImages(
          ${stringify({
            orderId: request.orderId,
            imagesAfter: '$imagesAfter'
          })}
        ) {
          id
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
    return
  }
  const requestDeliverLocker:Action['requestDeliverLocker'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        deliverBackLocker(
          ${stringify(request)}
        ) {
          id
          lockerUnitDelivered {
            id
            locker {
              id
              name
              rows
              columns
              units {
                id
                number
                row
                column
              }
            }
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
    const lockerUnit = mapLockerUnit(
      body.data.deliverBackLocker.lockerUnitDelivered
    )
    const locker = lockerUnit.locker
    const lockerUnits = locker?.units
    if(!locker || !lockerUnits) {
      throw new Error('Failed to fetch the whole locker layout')
    }
    return {
      ...lockerUnit,
      locker: {
        ...locker,
        units: lockerUnits
      }
    }
  }
  const confirmRetrieve:Action['confirmRetrieve'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        confirmRetrieve(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const updateServices:Action['updateServices'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        updateOrderServices(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const confirmUndo:Action['confirmUndo'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        undoOrder(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const confirmClosedLocker:Action['confirmClosedLocker'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        confirmCloseLocker(
          ${stringify(request)}
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
  const addPayment:Action['addPayment'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        addRequestPayment(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const updateProducts:Action['updateProducts'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        updateRequestProducts(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const updatePickUpTime:Action['updatePickUpTime'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        addRequestPickUpTime(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const updateRemark:Action['updateRemark'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        updateRequestRemark(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const cancelRequest:Action['cancelRequest'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      mutation {
        cancelRequest(
          ${stringify(request)}
        ) {
          id
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
    return
  }
  const displayRequests:Action['displayRequests'] = async() => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayRequests(
          ${stringify({
            everyone: true
          })}
        ) {
          ${ordersRequestSimplified.query}
          orders {
            ${orderSimplified.query}
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
    const simplifiedRequests:OrdersRequestSimplified[] = body.data.displayRequests.map(ordersRequestSimplified.map)
    setState(state => ({
      ...state,
      simplifiedRequests
    }))
    return simplifiedRequests
  }
  const displayRequest:Action['displayRequest'] = async requestId => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    form.append('graphql', `
      query {
        displayRequests(
          ${stringify({
            requestId,
            everyone: true
          })}
        ) {
          ${ordersRequestDetailed.query}
          orders {
            ${orderDetailed.query}
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
    const requests:OrdersRequestDetailed[] = body.data.displayRequests.map(ordersRequestDetailed.map)
    const request = requests[0]
    setState(state => ({
      ...state,
      detailedRequests: {
        ...state.detailedRequests,
        [request.id]: request
      }
    }))
    return request
  }
  const sendEmail:Action['sendEmail'] = async request => {
    if(!authenticated) {
      throw new Error('Please attempt to sign in first')
    }
    const form = new FormData()
    request.attachments?.forEach(attachment =>
      form.append('attachments', attachment)
    )
    form.append('graphql', `
      mutation SendEmail($attachments: [Upload!]) {
        sendEmail(
          ${stringify({
            to: request.to,
            subject: request.subject,
            text: request.text,
            attachments: '$attachments'
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

  return (
    <RequestContext.Provider value={[state, {
      createRequest,
      requestRetrieveStore,
      addBeforeImages,
      updateServiceStatus,
      addAfterImages,
      requestDeliverLocker,
      confirmRetrieve,
      updateServices,
      confirmUndo,
      confirmClosedLocker,
      addPayment,
      updateProducts,
      updatePickUpTime,
      updateRemark,
      cancelRequest,
      displayRequests,
      displayRequest,
      sendEmail
    }]}>
      {props.children}
    </RequestContext.Provider>
  )
}
export const useRequestState = () => {
  return React.useContext(RequestContext)
}

const orderSimplified = {
  query: `
    id
    type
    status
    name
  `,
  map: (order:any):OrderSimplified => ({
    ...order
  })
}
export type OrderSimplified = {
  id: string
  type: 'locker' | 'physical'
  status: 'opened-locker' | 'cancelled' | 'deposited'
    | 'retrieved-store' | 'delivered-store' | 'cleaned'
    | 'delivered-back' | 'retrieved-back'
  name: string
}
const ordersRequestSimplified = {
  query: `
    id
    type
    time
    orderer {
      id
      displayName
      mobileNumber
      email
      address
    }
    store {
      ${storeSimplified.query}
    }
    price
    paid
  `,
  map: (request:any):OrdersRequestSimplified => ({
    ...request,
    time: new Date(Date.parse(request.time)),
    orderer: mapUser(request.orderer),
    store: storeSimplified.map(request.store),
    orders: request.orders.map(orderSimplified.map)
  })
}
export type OrdersRequestSimplified = {
  id: string
  type: 'locker' | 'physical'
  time: Date
  orderer: User
  store: StoreSimplified
  price: number
  paid: number
  orders: OrderSimplified[]
}

const orderDetailed = {
  query: `
    ${orderSimplified.query}
    time
    services {
      id
      type
      name
      assignedPrice
      done
    }
    imagesBefore {
      id
      type
      url
    }
    imagesAfter {
      id
      type
      url
    }
    events {
      type
      time
      _status
    }
  `,
  map: (order:any):OrderDetailed => ({
    ...order,
    ...orderSimplified.map(order),
    time: new Date(Date.parse(order.time)),
    services: order.services.map(mapServiceOrdered),
    imagesBefore: order.imagesBefore?.map(mapServerFile),
    imagesAfter: order.imagesAfter?.map(mapServerFile),
    events: order.events.map((event:any) => ({
      ...event,
      time: new Date(Date.parse(event.time))
    }))
  })
}
export type OrderDetailed = OrderSimplified & {
  time: Date
  services: ServiceOrdered[]
  imagesBefore?: ServerFile[]
  imagesAfter?: ServerFile[]
  events: {
    type: 'created' | 'updated'
    time: Date
    _status: string
  }[]
}
const ordersRequestDetailed = {
  query: `
    ${ordersRequestSimplified.query}
    status
    products {
      id
      name
      quantity
      assignedPrice
    }
    invoice {
      time
      number
    }
    payments {
      type
      time
      amount
      reference
    }
    pickUpTime
    remark
  `,
  map: (request:any):OrdersRequestDetailed => ({
    ...request,
    ...ordersRequestSimplified.map(request),
    invoice: {
      time: new Date(Date.parse(request.invoice.time)),
      number: request.invoice.number
    },
    payments: request.payments.map((payment:any) => ({
      ...payment,
      time: new Date(Date.parse(payment.time))
    })),
    pickUpTime: request.pickUpTime
      ? new Date(Date.parse(request.pickUpTime))
      : undefined,
    orders: request.orders.map(orderDetailed.map)
  })
}
export type OrdersRequestDetailed = Omit<OrdersRequestSimplified, 'orders'> & {
  status: 'in-progress' | 'cancelled'
  products: {
    id: string
    name: string
    quantity: number
    assignedPrice: number
  }[]
  invoice: {
    time: Date
    number: number
  }
  payments: ({
    time: Date
    amount: number
  } & (
    | {
        type: 'cash' | 'payment-gateway'
      }
    | {
        type: 'bank-transfer' | 'credit-debit-card' | 'cheque'
        reference: string
      }
  ))[]
  pickUpTime?: Date
  remark: string
  orders: OrderDetailed[]
}

const mapServiceOrdered = (service:any):ServiceOrdered => ({
  ...mapService(service),
  assignedPrice: service.assignedPrice,
  done: service.done
})
export type ServiceOrdered = Service & {
  assignedPrice: number
  done: boolean
}

const mapLockerUnit = (lockerUnit:any):LockerUnit => ({
  id: lockerUnit.id,
  number: lockerUnit.number,
  row: lockerUnit.row,
  column: lockerUnit.column,
  locker: lockerUnit.locker
    ? mapLocker(lockerUnit.locker)
    : undefined
})
export type LockerUnit = {
  id: string
  number: number
  row: number
  column: number
  locker?: Locker
}
const mapLocker = (locker:any):Locker => ({
  id: locker.id,
  name: locker.name,
  latitude: locker.latitude,
  longitude: locker.longitude,
  rows: locker.rows,
  columns: locker.columns,
  units: locker.units?.map(mapLockerUnit)
})
export type Locker = {
  id: string
  name: string
  latitude: number
  longitude: number
  rows: number
  columns: number
  units?: LockerUnit[]
}