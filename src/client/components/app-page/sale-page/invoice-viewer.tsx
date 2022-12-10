import * as React from 'react'
import {useParams} from 'react-router'
import {makeStyles} from '@mui/styles'
import {Theme} from '@mui/material/styles'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import {
  usePDF,
  Font,
  StyleSheet,
  Document,
  Page,
  Text,
  View
} from '@react-pdf/renderer'

import {useScreenState} from '../../../store/screen'
import {useAuthenticationState} from '../../../store/authentication'
import {useRequestState, OrdersRequestDetailed} from '../../../store/request'
import {displayDate} from '../../../utility/date'
import {displayCurrency} from '../../../utility/string'
import {HypeGuardianLogo} from '../../common/pdf/hypeguardian-logo'
import {conformToMobileNumber} from '../../common/text-field/mobile-number'

const useStyles = makeStyles((theme:Theme) => ({
  page: {
    height: '100%',
    width: '100%',
    border: 'none',
    transition: theme.transitions.create(['opacity', 'transform']),
  },
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    minWidth: '0 !important',
    borderRadius: '20px !important'
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
Font.register({family:'Arimo', fonts: [
  {fontWeight:400, src:'https://fonts.gstatic.com/s/arimo/v17/P5sfzZCDf9_T_3cV7NCUECyoxNk37cxcABrHdwcoaaQw.woff'},
  {fontWeight:600, src:'https://fonts.gstatic.com/s/arimo/v17/P5sfzZCDf9_T_3cV7NCUECyoxNk3M8tcABrHdwcoaaQw.woff'}
]})
const pdfStyles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 104
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32
  },
  companyBrand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 16
  },
  companyLogo: {
    marginBottom: 4
  },
  companyTitle: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 12,
    color: 'rgb(66, 66, 66)'
  },
  companyNumber: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 8,
    color: 'rgb(66, 66, 66)'
  },
  companyDetail: {
    flex: 1,
    paddingVertical: 8,
    borderTop: '1px solid rgb(66, 66, 66)'
  },
  companyDetailText: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
    color: 'rgb(66, 66, 66)'
  },
  companyDetailLabel: {
    fontWeight: 600
  },
  invoiceBody: {
    display: 'flex',
    flexDirection: 'row',
    borderTop: '1px solid rgb(66, 66, 66)',
    borderBottom: '1px solid rgb(66, 66, 66)',
    marginBottom: 24
  },
  invoiceBodyTitle: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  },
  invoiceBodyText: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  },
  customerDetail: {
    flex: 1,
    paddingVertical: 4,
    borderRight: '1px solid rgb(66, 66, 66)'
  },
  invoiceDetail: {
    flex: 1,
    paddingVertical: 4,
    paddingLeft: 4
  },
  customerName: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 12,
    color: 'rgb(33, 33, 33)',
    marginVertical: 8
  },
  invoiceDetailHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  invoiceDetailTitleEmphasized: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 16,
    color: 'rgb(33, 33, 33)',
    transform: 'scale(0.8, 1)',
    transformOrigin: '100% 50%'
  },
  invoiceDetailTable: {
    display: 'flex',
    flexDirection: 'column'
  },
  invoiceDetailTableRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4
  },
  invoiceDetailTableRowLabel: {
    width: 184,
    marginRight: 8,
    textAlign: 'right'
  },
  invoiceDetailTableRowValue: {
    width: 192
  },
  servicesTable: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '3px solid rgb(66, 66, 66)',
    borderBottom: '1px solid rgb(66, 66, 66)',
    paddingBottom: 8,
    marginBottom: 32
  },
  servicesTableHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottom: '1px solid rgb(66, 66, 66)'
  },
  servicesTableHeaderText: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  },
  servicesTableBodyRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 4
  },
  servicesTableBodyText: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  },
  servicesTableNumberColumn: {
    width: 24,
    marginRight: 8
  },
  servicesTableTitleColumn: {
    width: 192,
    marginRight: 8
  },
  servicesTableDescriptionColumn: {
    flex: 1,
    marginRight: 8
  },
  servicesTablePriceColumn: {
    width: 96,
    textAlign: 'right'
  },
  totalDisplay: {
    marginBottom: 32
  },
  totalDisplayRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  totalDisplayColumn: {
    width: 230,
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: 'rgb(33, 33, 33)'
  },
  totalDisplayDue: {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(33, 33, 33)'
  },
  totalDisplayLabel: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 14,
  },
  totalDisplayDescription: {
    marginLeft: 4,
    paddingLeft: 4,
    borderLeft: '1px solid rgb(66, 66, 66)'
  },
  totalDisplayText: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
  },
  termsConditions: {
    marginBottom: 32
  },
  termsConditionsTitle: {
    fontFamily: 'Arimo',
    fontWeight: 600,
    fontSize: 12,
    color: 'rgb(33, 33, 33)',
    textDecoration: 'underline'
  },
  termsConditionsText: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  },
  termsConditionsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4
  },
  termsConditionsNumber: {
    width: 12
  },
  termsConditionsDescription: {
    flex: 1
  },
  signatureRow: {
    position: 'absolute',
    height: 80,
    left: 24,
    right: 24,
    bottom: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureColumn: {
    height: '100%',
    width: 160,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  signatureLine: {
    height: 0,
    width: '100%',
    marginBottom: 4,
    borderTop: '1px solid rgb(33, 33, 33)'
  },
  signatureLabel: {
    fontFamily: 'Arimo',
    fontWeight: 400,
    fontSize: 10,
    color: 'rgb(33, 33, 33)'
  }
})
const InvoiceViewerPage:React.FunctionComponent = () => {
  const [state, setState] = React.useState<InvoiceViewerPageState>({
    loading: true
  })
  const [{type:screenType}] = useScreenState()
  const [{authenticated}] = useAuthenticationState()
  const [{detailedRequests:requests}, {displayRequest}] = useRequestState()
  const {requestId} = useParams<{requestId:string}>()
  const currentPath = `/app/sales/${requestId}`
  const request = requests?.[requestId]
  const [document, updateDocument] = usePDF({
    document: request? (
      <InvoiceDocument request={request}/>
    ):(
      <React.Fragment/>
    )
  })

  React.useEffect(() => {
    const display = async() => {
      try {
        await displayRequest(requestId)
        setState(state => ({...state, loading:false}))
      } catch(error:any) {
        setError(error.message)
      }
    }
    if(authenticated) {
      display()
    }
  }, [authenticated])
  React.useEffect(() => {
    updateDocument()
  }, [request])

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

  const {loading, error} = state
  const classes = useStyles({})
  const android = navigator.userAgent.toLowerCase().includes('android')
  return (
    <>
      {request && android
        ? <div className={classes.container}>
            <Typography variant='h6' gutterBottom>
              INV{[
                ...new Array(Math.max(5 - request.invoice.number.toString().length, 0)).fill('0'),
                request.invoice.number
              ].join('').slice(-5)}
            </Typography>
            <Button color='primary'
              variant='outlined' size='small'
              classes={{root:classes.button}}
              href={document.url?? undefined}
            >
              <DownloadIcon className={classes.extendedIcon}/>
              Download
            </Button>
          </div>
        : <iframe className={classes.page}
            style={loading || document.loading
              ? {opacity:0, transform:'translateY(32px)'}
              : {opacity:1}
            }
            src={`${document.url}#toolbar=1`}
          />
      }
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
type InvoiceViewerPageState = {
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

export const InvoiceDocument:React.FC<InvoiceDocumentProps> = (props) => {
  const {request} = props
  const totalPrice = request.products
      .reduce((total, product) => total + product.quantity * product.assignedPrice, 0) +
    request.orders
      .flatMap(order => order.services)
      .reduce((total, service) => total + service.assignedPrice, 0)
  return (
    <Document>
      <Page size='A4' style={pdfStyles.page}>
        <View style={pdfStyles.header} fixed>
          <View style={pdfStyles.companyBrand}>
            <View style={pdfStyles.companyLogo}>
              <HypeGuardianLogo width={64} height={64}/>
            </View>
            <Text style={pdfStyles.companyTitle}>
              {request.store.name}
            </Text>
            <Text style={pdfStyles.companyNumber}>
              {request.store.registrationNumber}
            </Text>
          </View>
          <View style={pdfStyles.companyDetail}>
            <Text style={pdfStyles.companyDetailText}>
              {request.store.address}
            </Text>
            <Text style={pdfStyles.companyDetailText}>
              <Text style={pdfStyles.companyDetailLabel}>T: </Text>
              {conformToMobileNumber(request.store.mobileNumber)}
            </Text>
            <Text style={pdfStyles.companyDetailText}>
              <Text style={pdfStyles.companyDetailLabel}>E: </Text>
              {request.store.email}
            </Text>
          </View>
        </View>
        <View style={pdfStyles.invoiceBody}>
          <View style={pdfStyles.customerDetail}>
            <Text style={pdfStyles.invoiceBodyTitle}>
              BILL TO
            </Text>
            <Text style={pdfStyles.customerName}>
              {request.orderer.displayName}
            </Text>
            <Text style={pdfStyles.invoiceBodyText}>
              {request.orderer.address}
            </Text>
            <Text style={pdfStyles.invoiceBodyText}>
              <Text style={pdfStyles.invoiceBodyTitle}>T: </Text>
              {conformToMobileNumber(request.orderer.mobileNumber)}
            </Text>
            <Text style={pdfStyles.invoiceBodyText}>
              <Text style={pdfStyles.invoiceBodyTitle}>E: </Text>
              {request.orderer.email}
            </Text>
          </View>
          <View style={pdfStyles.invoiceDetail}>
            <View style={pdfStyles.invoiceDetailHeader}>
              <Text style={pdfStyles.invoiceBodyTitle}>
                INVOICE DETAILS
              </Text>
              <Text style={pdfStyles.invoiceDetailTitleEmphasized}>
                INVOICE
              </Text>
            </View>
            {request.invoice? (
              <View style={pdfStyles.invoiceDetailTable}>
                <View style={pdfStyles.invoiceDetailTableRow}>
                  <View style={pdfStyles.invoiceDetailTableRowLabel}>
                    <Text style={pdfStyles.invoiceBodyText}>INVOICE NO</Text>
                  </View>
                  <View style={pdfStyles.invoiceDetailTableRowValue}>
                    <Text style={pdfStyles.invoiceBodyText}>
                      INV{[
                        ...new Array(Math.max(5 - request.invoice.number.toString().length, 0)).fill('0'),
                        request.invoice.number
                      ].join('').slice(-5)}
                    </Text>
                  </View>
                </View>
                <View style={pdfStyles.invoiceDetailTableRow}>
                  <View style={pdfStyles.invoiceDetailTableRowLabel}>
                    <Text style={pdfStyles.invoiceBodyText}>INVOICE DATE</Text>
                  </View>
                  <View style={pdfStyles.invoiceDetailTableRowValue}>
                    <Text style={pdfStyles.invoiceBodyText}>{displayDate(request.invoice.time)}</Text>
                  </View>
                </View>
                {request.pickUpTime? (
                  <View style={pdfStyles.invoiceDetailTableRow}>
                    <View style={pdfStyles.invoiceDetailTableRowLabel}>
                      <Text style={pdfStyles.invoiceBodyText}>PICKUP DATE</Text>
                    </View>
                    <View style={pdfStyles.invoiceDetailTableRowValue}>
                      <Text style={pdfStyles.invoiceBodyText}>{displayDate(request.pickUpTime)}</Text>
                    </View>
                  </View>
                ):undefined}
              </View>
            ):undefined}
          </View>
        </View>
        <View style={pdfStyles.servicesTable}>
          <View style={pdfStyles.servicesTableHeaderRow}>
            <View style={pdfStyles.servicesTableNumberColumn}>
              <Text style={pdfStyles.servicesTableHeaderText}>NO.</Text>
            </View>
            <View style={pdfStyles.servicesTableTitleColumn}>
              <Text style={pdfStyles.servicesTableHeaderText}>Products/Services</Text>
            </View>
            <View style={pdfStyles.servicesTableDescriptionColumn}>
              <Text style={pdfStyles.servicesTableHeaderText}>Descriptions</Text>
            </View>
            <View style={pdfStyles.servicesTablePriceColumn}>
              <Text style={pdfStyles.servicesTableHeaderText}>Amount</Text>
            </View>
          </View>
          {[
            ...request.orders
              .flatMap(order => order.services)
              .map(service => ({
                name: service.name,
                description: '',
                price: service.assignedPrice
              })),
            ...request.products
              .map(product => ({
                name: product.name + ' × ' + product.quantity,
                description: '',
                price: product.quantity * product.assignedPrice
              }))
          ]
            .map((expense, index) => (
              <View key={index} style={pdfStyles.servicesTableBodyRow}>
                <View style={pdfStyles.servicesTableNumberColumn}>
                  <Text style={pdfStyles.servicesTableBodyText}>{index + 1}</Text>
                </View>
                <View style={pdfStyles.servicesTableTitleColumn}>
                  <Text style={pdfStyles.servicesTableBodyText}>{expense.name}</Text>
                </View>
                <View style={pdfStyles.servicesTableDescriptionColumn}>
                  <Text style={pdfStyles.servicesTableBodyText}>{expense.description}</Text>
                </View>
                <View style={pdfStyles.servicesTablePriceColumn}>
                  <Text style={pdfStyles.servicesTableBodyText}>
                    {displayCurrency(expense.price, {decimal:2})}
                  </Text>
                </View>
              </View>
            ))
          }
        </View>
        <View style={pdfStyles.totalDisplay}>
          <View style={pdfStyles.totalDisplayRow}>
            <View style={pdfStyles.totalDisplayColumn}>
              <Text style={pdfStyles.totalDisplayLabel}>TOTAL</Text>
              <Text style={pdfStyles.totalDisplayLabel}>
                RM{displayCurrency(totalPrice, {decimal:2})}
              </Text>
            </View>
          </View>
          {request.payments.map((payment, index) => (
            <View key={index} style={pdfStyles.totalDisplayRow}>
              <View style={pdfStyles.totalDisplayColumn}>
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Text style={pdfStyles.totalDisplayLabel}>
                    PAID
                  </Text>
                  <View style={pdfStyles.totalDisplayDescription}>
                    <Text style={pdfStyles.totalDisplayText}>
                      {' ' + displayDate(payment.time)}
                    </Text>
                  </View>
                </View>
                <Text style={pdfStyles.totalDisplayLabel}>
                  RM{displayCurrency(
                    payment.amount,
                    {decimal:2}
                  )}
                </Text>
              </View>
            </View>
          ))}
          <View style={pdfStyles.totalDisplayRow}>
            <View style={[pdfStyles.totalDisplayColumn, pdfStyles.totalDisplayDue]}>
              <Text style={pdfStyles.totalDisplayLabel}>DUE NOW</Text>
              <Text style={pdfStyles.totalDisplayLabel}>
                RM{displayCurrency(
                  (() => {
                    const paid = request.payments.reduce((total, payment) => total + payment.amount, 0)
                    return totalPrice - paid
                  })(),
                  {decimal:2}
                )}
              </Text>
            </View>
          </View>
        </View>
        <View style={pdfStyles.termsConditions}>
          <View style={pdfStyles.termsConditionsRow}>
            <Text style={pdfStyles.termsConditionsTitle}>
              Terms & Conditions
            </Text>
          </View>
          {[
            'Any risks of damage on footwear after our services due to shoe age, material and condition will be stated beforehand by our technicians to avoid misunderstandings.',
            'Upon signature, client agrees to bear the risks and liabilities on the shoe if unforseen damage should have happened.',
            'Client is advised to pick up the footwear on the scheduled date or anytime after in between HypeGuardian operating hours.',
            'HypeGuardian reserves the right to detain the shoe if client does not pick it up after a span of 60 day(s) or above from the confrmation of order unless stated otherwise by HypeGuardian technicians.',
            'Upfront payment is required during the confrmation of order unless stated otherwise by HypeGuardian technicians.',
            'Client is required to show is this receipt upon shoe collection. If client requests a third party to pick up on his/her behalf, picture of the receipt and verifcation is required from the owner to avoid miscollection and fraud cases.',
            'HypeGuardian has the right to extend the scheduled pick up date given the circumstances. Client will be informed in advanced if it should have happened.'
          ].map((term, index) => (
            <View key={index} style={pdfStyles.termsConditionsRow}>
              <View style={pdfStyles.termsConditionsNumber}>
                <Text style={pdfStyles.termsConditionsText}>{index + 1}. </Text>
              </View>
              <View style={pdfStyles.termsConditionsDescription}>
                <Text style={pdfStyles.termsConditionsText}>{term}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={pdfStyles.signatureRow} fixed>
          <View style={pdfStyles.signatureColumn}>
            <View style={pdfStyles.signatureLine}/>
            <Text style={pdfStyles.signatureLabel}>RECEIVED BY</Text>
          </View>
          <View style={pdfStyles.signatureColumn}>
            <View style={pdfStyles.signatureLine}/>
            <Text style={pdfStyles.signatureLabel}>ISSUED BY</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
type InvoiceDocumentProps = {
  request: OrdersRequestDetailed
}

export default InvoiceViewerPage