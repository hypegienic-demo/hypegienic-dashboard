import * as React from 'react'
import {useTheme, Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'
import Snackbar from '@mui/material/Snackbar'
import CardContent from '@mui/material/CardContent'

import {useScreenState} from '../../../store/screen'
import {useServiceState, Service} from '../../../store/service'
import {useProductState} from '../../../store/product'
import {displayCurrency} from '../../../utility/string'
import {highlightQuery} from '../../../utility/query'
import {sideBarWidth, RoutePageProps} from '..'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    width: '100%',
    height: '100%',
    overflow: 'auto'
  },
  container: {
    width: '100%',
    maxWidth: '840px',
    padding: '48px 40px',
    margin: '0 auto',
    [`@media (min-width:${theme.breakpoints.values.lg}px)`]: {
      maxWidth: `${800 + sideBarWidth}px`,
      paddingRight: `${sideBarWidth}px`,
    }
  },
  header: {
    transition: theme.transitions.create(['opacity', 'transform']),
  },
  divider: {
    margin: '32px 0 !important'
  },
  servicesTypes: {
    display: 'flex',
    flexDirection: 'row',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform']),
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      flexDirection: 'column'
    }
  },
  servicesType: {
    flex: 1,
    padding: '12px 15px 0',
    borderRadius: '4px',
    border: '1px solid rgba(0, 0, 0, 0.06)'
  },
  services: {
    margin: '0 -8px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      paddingRight: '32px'
    }
  },
  products: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    margin: '0 -16px',
    transition: theme.transitions.create(['opacity', 'transform']),
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    }
  },
  serviceRelationships: {
    width: '76px',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      height: '24px',
      width: '100%'
    }
  },
  serviceCard: {
    marginTop: '8px',
    marginBottom: '8px'
  },
  serviceCardActive: {
    borderColor: theme.palette.secondary.main
  },
  serviceCardContent: {
    padding: '7px !important',
    '&:last-child': {
      paddingBottom: '12px !important'
    }
  },
  productCardContent: {
    padding: '7px 15px !important',
    '&:last-child': {
      paddingBottom: '12px !important'
    }
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const ServiceProductPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [state, setState] = React.useState<ServiceProductPageState>({
    services: {},
    loading: true
  })
  const [{services}, {displayServices}] = useServiceState()
  const [{products}, {displayProducts}] = useProductState()

  React.useEffect(() => {
    const display = async() => {
      try {
        await Promise.all([
          displayServices(),
          displayProducts()
        ])
        setState(state => ({...state, loading:false}))
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
  }, [])

  const setServiceRef:(id:string) => React.Ref<HTMLDivElement> =
    React.useCallback(id => (service:HTMLDivElement) => {
      if(service && !state.services[id]) {
        setState(state => ({
          ...state,
          services: {
            ...state.services,
            [id]: service
          }
        }))
      }
    }, [state.services])

  const removeError = () => {
    setState(state => ({
      ...state,
      error: state.error
        ? {...state.error, open:false}
        : undefined
    }))
  }
  const setError = (error:string) =>
    setState(state => ({
      ...state,
      loading: false,
      error: {
        open: true,
        message: error
      }
    }))
  const select = (id:string) => (event:React.MouseEvent | React.TouchEvent) => {
    if(event.type === 'click') {
      setState(state => ({
        ...state,
        activeService: state.activeService === id
          ? undefined
          : id
      }))
    } else if(event.type === 'mouseover' && state.hoverService !== id) {
      setState(state => ({...state, hoverService:id}))
    } else if(event.type === 'mouseleave' && state.hoverService === id) {
      setState(state => ({...state, hoverService:undefined}))
    }
  }

  const {setScrollTarget, searchQuery} = props
  const {loading, error, services:serviceElements} = state
  const classes = useStyles({})
  const theme = useTheme<Theme>()
  const activeService = services?.find(service => service.id === state.activeService)
  const hoverService = services?.find(service => service.id === state.hoverService)
  const getRelationships = (service:Service):[string, string][] =>
    service.type === 'main'
      ? service.exclude.map(exclude => [service.id, exclude])
      : (services?? [])
          .filter(main => main.type === 'main' && main.exclude.includes(service.id))
          .map(main => [main.id, service.id])
  const relationships = activeService
    ? getRelationships(activeService)
    : hoverService
    ? getRelationships(hoverService)
    : []
  const renderService = (service:Service) => (
    <Card key={service.id} variant='outlined'
      ref={setServiceRef(service.id)}
      classes={{
        root: [
          classes.serviceCard,
          service.id === activeService?.id? classes.serviceCardActive:''
        ].join(' ')
      }}
      onClick={select(service.id)}
      onMouseOver={select(service.id)}
      onMouseLeave={select(service.id)}
    >
      <CardContent classes={{root:classes.serviceCardContent}}>
        <Typography variant='h6'>
          {highlightQuery(service.name, searchQuery, theme.palette.secondary.main)}
        </Typography>
        <Typography color='textSecondary'>
          {service.price.type === 'fixed'
            ? `RM${displayCurrency(service.price.amount)}`
            : 'Variable'
          }
        </Typography>
      </CardContent>
    </Card>
  )
  return (
    <>
      <div className={classes.page}
        ref={setScrollTarget}
      >
        <div className={classes.container}>
          <div className={classes.header}
            style={loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {opacity:1}
            }
          >
            <Toolbar/>
            <Typography variant='h3' gutterBottom>
              Services & Products
            </Typography>
            <Typography variant='body1' gutterBottom>
              This is where all our available services and products are stored, these services and products are available for
              our customer to choose from.
            </Typography>
            <Typography variant='body1' gutterBottom>
              Editing coming soon.
            </Typography>
            <Divider classes={{root:classes.divider}}/>
            <Typography variant='h4' gutterBottom>
              Services
            </Typography>
          </div>
          <div className={classes.servicesTypes}
            style={loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {opacity:1}
            }
          >
            <div className={classes.servicesType}>
              <Typography variant='h5'>
                Main Services
              </Typography>
              <div className={classes.services}>
                {services
                  ?.flatMap(service => service.type === 'main'? [service]:[])
                  .map(renderService)
                }
              </div>
            </div>
            <div className={classes.serviceRelationships}>
              {relationships?.map(relationship => {
                const from = serviceElements[relationship[0]]
                const to = serviceElements[relationship[1]]
                if(from && to) {
                  return (
                    <ServiceRelationship
                      key={relationship.join(' ')}
                      from={from} to={to}
                    />
                  )
                } else {
                  return undefined
                }
              })}
            </div>
            <div className={classes.servicesType}>
              <Typography variant='h5'>
                Additional Services
              </Typography>
              <div className={classes.services}>
                {services
                  ?.flatMap(service => service.type === 'additional'? [service]:[])
                  .map(renderService)
                }
              </div>
            </div>
          </div>
          <div className={classes.header}
            style={loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {opacity:1}
            }
          >
            <Divider classes={{root:classes.divider}}/>
            <Typography variant='h4' gutterBottom>
              Products
            </Typography>
          </div>
          <div className={classes.products}
            style={loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {opacity:1}
            }
          >
            {products?.map(product => (
              <Card key={product.id} variant='outlined'>
                <CardContent classes={{root:classes.productCardContent}}>
                  <Typography variant='h6'>
                    {highlightQuery(product.name, searchQuery, theme.palette.secondary.main)}
                  </Typography>
                  <Typography color='textSecondary'>
                    {product.price.type === 'fixed'
                      ? `RM${displayCurrency(product.price.amount)}`
                      : 'Variable'
                    }
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={error?.open === true}
        onClose={removeError}
        message={error?.message}
        autoHideDuration={6000}
        classes={{root:classes.snackbar}}
      />
    </>
  )
}
type ServiceProductPageState = {
  activeService?: string
  hoverService?: string
  services: Record<string, HTMLElement>
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

const ServiceRelationship:React.FunctionComponent<ServiceRelationshipProps> = props => {
  const [{type:screenType}] = useScreenState()
  const [, setState] = React.useState<{}>({})

  React.useEffect(() => {
    const scrollContent = document.querySelector('#scroll-content')
    if(scrollContent) {
      const onScroll = () => setState(state => ({...state}))
      scrollContent.addEventListener('scroll', onScroll)
      return () =>
        scrollContent.removeEventListener('scroll', onScroll)
    } else {
      return undefined
    }
  }, [])

  const smallScreen = screenType === 'xs-phone'
  const from = props.from.getBoundingClientRect()
  const to = props.to.getBoundingClientRect()
  const ys = [
    from.top + (from.height / 2),
    to.top + (to.height / 2)
  ]
  const maxY = Math.max(...ys)
  const minY = Math.min(...ys)
  const xs = smallScreen
    ? [from.right, from.right + 24]
    : [from.right, to.left]
  const maxX= Math.max(...xs)
  const minX = Math.min(...xs)
  return (
    <canvas
      ref={canvas => {
        const context = canvas?.getContext('2d')
        if(canvas) {
          canvas.height = maxY - minY + 1
          canvas.width = maxX - minX + 1
        }
        if(context) {
          const maxCurve = 16
          const top = 0.5
          const bottom = context.canvas.height - 0.5
          const left = 0.5
          const right = context.canvas.width - 0.5
          context.moveTo(left, top)
          if(smallScreen) {
            const curve = maxCurve
            context.arcTo(right, top, right, curve + top, curve)
            context.lineTo(right, bottom - curve)
            context.arcTo(right, bottom, left, bottom, curve)
            context.lineTo(left, bottom)
          } else {
            const middleX = context.canvas.width / 2
            const curve = Math.min(maxCurve, middleX, bottom - top)
            context.lineTo(middleX - curve, top)
            context.arcTo(middleX, top, middleX, curve + top, curve)
            context.lineTo(middleX, bottom - curve)
            context.arcTo(middleX, bottom, middleX + curve, bottom, curve)
            context.lineTo(right, bottom)
          }
          context.strokeStyle = 'rgba(0, 0, 0, 0.24)'
          context.stroke()
        }
      }}
      style={{
        position: 'fixed',
        top: minY - 0.5,
        left: minX - 0.5,
        height: maxY - minY + 1,
        width: maxX - minX + 1,
        zIndex: 300
      }}
    />
  )
}
type ServiceRelationshipProps = {
  from: HTMLElement
  to: HTMLElement
}

export default ServiceProductPage