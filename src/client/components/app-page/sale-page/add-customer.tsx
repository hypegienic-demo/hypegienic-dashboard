import * as React from 'react'
import {FixedSizeList} from 'react-window'
import {useTheme, Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import {TransitionProps} from '@mui/material/transitions'
import Paper from '@mui/material/Paper'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputBase from '@mui/material/InputBase'
import Checkbox from '@mui/material/Checkbox'
import Snackbar from '@mui/material/Snackbar'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SearchIcon from '@mui/icons-material/Search'

import {useUserState, User} from '../../../store/user'
import {highlightQuery} from '../../../utility/query'
import {conformToMobileNumber} from '../../common/text-field/mobile-number'

const useStyles = makeStyles((theme:Theme) => ({
  container: {
    padding: '0 !important'
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '8px 24px 12px'
  },
  snackbar: {
    maxWidth: 'calc(100vw - 48px)',
    [`@media (max-width:${theme.breakpoints.values.sm}px)`]: {
      maxWidth: 'calc(100vw - 16px)'
    }
  }
}))
const SlideUpTransition = React.forwardRef((props:TransitionProps, ref) =>
  <Slide direction='up' ref={ref} {...props}/>
)
const AddCustomerDialog:React.FunctionComponent<AddCustomerDialogProps> = (props) => {
  const [state, setState] = React.useState<AddCustomerDialogState>({
    opened: false,
    form: {},
    loading: true
  })
  const [{users}, {displayUsers}] = useUserState()

  React.useEffect(() => {
    const display = async() => {
      try {
        await displayUsers()
        setState(state => ({...state, loading:false}))
      } catch(error:any) {
        setError(error.message)
      }
    }
    display()
  }, [])
  React.useEffect(() => {
    const {open} = props
    if(open) {
      setState(state => ({
        ...state,
        fields: {}
      }))
    } else {
      setState(state => ({
        ...state,
        opened: false
      }))
    }
  }, [props.open])
  const setContentRef: React.Ref<HTMLDivElement> =
    React.useCallback((view:HTMLDivElement) => {
      if(view && !state.content) {
        setState(state => ({
          ...state,
          content: view
        }))
      }
    }, [state.content])
  const openTransition = () => {
    setState(state => ({
      ...state,
      opened: props.open,
      content: undefined
    }))
  }
  const onChangeForm = (form:Partial<AddCustomerDialogState['form']>) => {
    setState(state => ({
      ...state,
      form: {
        ...state.form,
        ...form
      }
    }))
  }
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
  const next = () => {
    const {orderer:id} = state.form
    const orderer = users?.find(user => user.id === id)
    if(!orderer) {
      setError('Please select a user first')
    } else {
      setState(state => ({
        ...state,
        form: {},
        loading: false
      }))
      props.onClose(orderer)
    }
  }

  const {open, onClose} = props
  const {opened, form, content, loading, error} = state
  const classes = useStyles({})
  const maxContentDimension = opened && content? (() => {
    const computedStyle = window.getComputedStyle(content)
    return {
      height: content.clientHeight
        - parseFloat(computedStyle.paddingTop)
        - parseFloat(computedStyle.paddingBottom),
      width: content.clientWidth
        - parseFloat(computedStyle.paddingLeft)
        - parseFloat(computedStyle.paddingRight)
    }
  })():undefined
  return (
    <>
      <Dialog open={open}
        TransitionComponent={SlideUpTransition}
        onAnimationEnd={openTransition}
        onClose={() => onClose()}
        maxWidth='xs'
        fullWidth
      >
        <DialogContent classes={{root:classes.container}}
          ref={setContentRef}
          style={{overflowY:'hidden'}}
        >
          <SelectUserField
            value={form.orderer}
            onChange={orderer => onChangeForm({
              orderer
            })}
            title='Select Customer'
            users={users}
            dimension={maxContentDimension}
          />
        </DialogContent>
        <Divider/>
        <DialogActions classes={{root:classes.container}}>
          <div className={classes.footer}>
            <LoadingButton variant='contained' color='primary' size='large' disableElevation
              onClick={next}
              loading={loading}
            >
              Update
            </LoadingButton>
          </div>
        </DialogActions>
      </Dialog>
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
type AddCustomerDialogProps = {
  open: boolean
  onClose: (orderer?:User) => void
}
type AddCustomerDialogState = {
  opened: boolean
  form: {
    orderer?: string
  }
  content?: HTMLDivElement
  loading: boolean
  error?: {
    open: boolean
    message: string
  }
}

const useSelectUserStyles = makeStyles((theme:Theme) => ({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: '40px 24px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 30,
  },
  titleSection: {
    paddingBottom: '8px'
  },
  title: {
    fontWeight: 600
  },
  searchInputContainer: {
    display: 'flex'
  },
  searchInput: {
    flex: 1,
    padding: '4px 16px'
  },
  searchIcon: {
    margin: '9px 18px 9px 12px'
  },
  listItem: {
    padding: '4px 40px !important'
  }
}))
const UserOption:React.FC<UserOptionProps> = ({index, data, style}) => {
  const classes = useSelectUserStyles({})
  const user = data.filteredUsers[index]
  return user? (
    <ListItem key={user.id} dense
      onClick={() => data.onChange(
        data.value === user.id? undefined:user.id
      )}
      button
      style={{
        ...style,
        top: parseFloat(style.top?.toString()?? '0') + data.padding.top
      }}
      classes={{dense:classes.listItem}}
    >
      <ListItemIcon>
        <Checkbox edge='start'
          checked={data.value === user.id}
          tabIndex={-1}
          disableRipple
        />
      </ListItemIcon>
      <ListItemText
        primary={data.highlightText(
          user.displayName
        )}
        secondary={data.highlightText(
          conformToMobileNumber(user.mobileNumber)
        )}
      />
    </ListItem>
  ):null
}
type UserOptionProps = {
  index: number
  data: UserOptionData
  style: React.CSSProperties
}
type UserOptionData = {
  padding: {
    top: number
    bottom: number
  }
  filteredUsers: User[]
  value?: string
  onChange: (value?:string) => void
  highlightText: (text:string) => JSX.Element | string
}
const SelectUserField:React.FunctionComponent<SelectUserFieldProps> = (props) => {
  const [state, setState] = React.useState<SelectUserFieldState>({})

  const setHeaderHeight:React.Ref<HTMLDivElement> =
    React.useCallback((element:HTMLDivElement) => {
      if(element && !state.headerHeight) {
        setState(state => ({
          ...state,
          headerHeight: element.offsetHeight
        }))
      }
    }, [state.headerHeight])
  const onChangeQuery = (value:string) => {
    setState(state => ({
      ...state,
      query: value
    }))
  }

  const {value, onChange, title, users, dimension} = props
  const {query, headerHeight} = state
  const classes = useSelectUserStyles()
  const theme = useTheme<Theme>()
  const padding = {
    top: headerHeight?? 40,
    bottom: 8
  }
  const filteredUsers = users?.filter(user => {
    const regexp = query
      ? new RegExp(query.split('')
          .filter(char => /\w/.test(char))
          .join('\\W*'),
          'gi'
        )
      : undefined
    return !regexp || (
      regexp.test(user.displayName) ||
      regexp.test(user.mobileNumber)
    )
  })
  return (
    <>
      <div style={{height:`${dimension?.height?? 3000}px`}}/>
      <div className={classes.header}
        ref={setHeaderHeight}
      >
        {title? (
          <div className={classes.titleSection}>
            <Typography variant='h5' color='textPrimary'
              classes={{root:classes.title}} gutterBottom
            >
              {title}
            </Typography>
          </div>
        ):undefined}
        <Paper variant='outlined'
          classes={{root:classes.searchInputContainer}}
        >
          <SearchIcon className={classes.searchIcon}/>
          <InputBase
            classes={{root:classes.searchInput}}
            value={query}
            onChange={event =>
              onChangeQuery(event.target.value)
            }
          />
        </Paper>
      </div>
      {dimension && filteredUsers? (
        <FixedSizeList
          width={dimension.width}
          height={dimension.height}
          itemData={{
            padding,
            filteredUsers,
            value,
            onChange,
            highlightText: (text:string) =>
              highlightQuery(text, query?? '', theme.palette.secondary.main)
          }}
          itemSize={60}
          itemCount={filteredUsers.length}
          style={{
            position: 'absolute',
            top: '0',
            padding: `${padding.top}px 0 ${padding.bottom}px`
          }}
        >
          {UserOption}
        </FixedSizeList>
      ):undefined}
    </>
  )
}
type SelectUserFieldProps = {
  value?: string
  onChange: (value?:string) => void
  title?: string
  users?: User[]
  dimension?: {
    width: number
    height: number
  }
}
type SelectUserFieldState = {
  query?: string
  headerHeight?: number
}

export default AddCustomerDialog