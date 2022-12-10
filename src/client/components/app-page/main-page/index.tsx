import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import {useAuthenticationState} from '../../../store/authentication'
import {sideBarWidth, RoutePageProps} from '../'

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
  divider: {
    margin: '32px 0 !important'
  },
  list: {
    margin: '0.35em 0'
  }
}))
const MainPage:React.FunctionComponent<RoutePageProps<HTMLDivElement>> = (props) => {
  const [authenticationState] = useAuthenticationState()

  const {profile} = authenticationState
  const {setScrollTarget} = props
  const classes = useStyles({})
  const employee = profile?.employee?? 'unauthorized'
  return (
    <div className={classes.page}
      ref={setScrollTarget}
    >
      <div className={classes.container}>
        <Toolbar/>
        {['admin', 'staff'].includes(employee)? (
          <>
            <Typography variant='h3' gutterBottom>
              Welcome to the dashboard
            </Typography>
            <Typography variant='body1' gutterBottom>
              This is where all your works are recorded and stored, where it can then be visualised
              in a manner that is useful for the business to monitor it's health and growth.
            </Typography>
            <Typography variant='body1' gutterBottom>
              Your work will also be visualised for accounting and auditing purposes, so it needs to
              be accurate.
            </Typography>
            <Divider classes={{root:classes.divider}}/>
            <Typography variant='h4' gutterBottom>
              Order flow
            </Typography>
            <Typography variant='body1' gutterBottom>
              For an order to be taken down, there's these 2 pages that you'll need to be concerned
              with, first is the user page, where your customer's detail needs to be recorded and
              the second is the sale page, where the actual order is going to be recorded.
            </Typography><br/>
            <Typography variant='h5' gutterBottom>
              User page
            </Typography>
            <Typography variant='body1' gutterBottom>
              You will need to confirm that the customer's detail is already recorded before you can
              put in the order. This step is necessary so that the customer are uniquely identified
              and the order can be traced back to the same customer if they share the same uniquely
              identity.
            </Typography>
            <Typography variant='body1' gutterBottom>
              To understand this problem more thoroughly, we'll need to discuss the possibility of
              keying in the wrong user detail. If there's an order with the mobile number 0123456789
              in our system, and there's a new order with the mobile number 0123456788 keyed in, but
              it was keyed in as 0123456789 mistakenly, they obviously have 2 different customer
              name. So the customer name in the first order will be overriden. And if we realize the
              mistake and correct the number on the second order, the mobile number on the first
              number will also be modified to match the current number.
            </Typography>
            <Typography variant='body1' gutterBottom>
              To solve the former problem, we can always ignore the first order and only reflect the
              changes in the second order. But then another problem arise, what if the first order
              and the second order both belong to the same customer, but the customer has indeed
              changed to use a new mobile number or email address, changing the second order will
              create another customer, making it impossible for us to trace the orders back to the
              same customer.
            </Typography>
            <Typography variant='body1' gutterBottom>
              We use mobile number and email address to uniquely identify different customers.
              Please keep in mind that there can be no 2 customers sharing the same mobile number or
              email address at the same time.
            </Typography><br/>
            <Typography variant='h5' gutterBottom>
              Sale page
            </Typography>
            <Typography variant='body1' gutterBottom>
              This is where the actual order goes. For an order to go through, the customer details
              needs to be added in the user page and there needs to be at least 1 service created in
              the service page.
            </Typography>
            <Typography variant='body1' gutterBottom>
              Theres 2 types of orders:-
              <ol className={classes.list}>
                <li>
                  <b>Physical order</b> where the customer drops their belongings physically at the store.
                </li>
                <li>
                  <b>Delivered order</b> where the customer dropped off their belongings in an automated
                  locker and delivered back to the store.
                </li>
              </ol>
            </Typography>
            <Typography variant='body1' gutterBottom>
              The <b>physical order</b> is simple, theres only 4 statuses of an order.
              <ol className={classes.list}><li>
                <b>deposited</b> - meaning its just dropped off here in the store.
              </li><li>
                <b>delivered-store</b> - meaning the order is received and its condition is recorded.
              </li><li>
                <b>cleaned</b> - meaning all the required service on it is done and ready to be picked up.
              </li><li>
                <b>retrieved-back</b> - meaning the customer already came to the store and picked it up.
              </li></ol>
            </Typography>
            <Typography variant='body1' gutterBottom>
              The <b>delivered order</b> is more complicated, theres a total of 7 statuses of an order.
              <ol className={classes.list}><li>
                <b>opened-locker</b> - meaning the customer requested a locker unit to open to place their
                belongings.
              </li><li>
                <b>cancelled</b> - the customer did not proceed after opening the locker, either cancelled
                it or its timed out.
              </li><li>
                <b>deposited</b> - meaning the customer comfirmed that they placed their belonging into the
                opened locker unit.
              </li><li>
                <b>retrieved-store</b> - meaning our rider just picked up the shoe from the locker going
                back to the store
              </li><li>
                <b>delivered-store</b>
              </li><li>
                <b>cleaned</b>
              </li><li>
                <b>delivered-back</b> - meaning the order is dropped off back into the locker where its
                picked up from.
              </li><li>
                <b>retrieved-back</b>
              </li></ol>
            </Typography>
            <Typography variant='body1' gutterBottom>
              For a <b>physical order</b> once its keyed in, it's first status is <b>delivered-store</b>.
            </Typography>
            <Typography variant='body1' gutterBottom>
              Everytime a service on an order is done, the staff in charge should update it to reflect
              the status. Once all the service required on an order is mark as done, it will progress
              to the next status, <b>cleaned</b>.
            </Typography>
            <Typography variant='body1' gutterBottom>
              When the customer come pick up their cleaned belongings, the staff in charge should update
              the order to its final status, <b>retrieved</b>.
            </Typography>
          </>
        ):(
          <>
            <Typography variant='h3' gutterBottom>
              Unauthorized access
            </Typography>
            <Typography variant='body1' gutterBottom>
              It seems like you are unauthorized to access this page, please check with your superior.
            </Typography>
          </>
        )}
      </div>
    </div>
  )
}

export default MainPage