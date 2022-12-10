import * as React from 'react'
import {Theme} from '@mui/material/styles'
import {makeStyles} from '@mui/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ImageIcon from '@mui/icons-material/ImageOutlined'
import ClearIcon from '@mui/icons-material/Clear'

const useStyles = makeStyles((theme:Theme) => ({
  fileDropArea: {
    padding: '32px',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  fileDropAreaActive: {
    borderWidth: '2px',
    borderColor: theme.palette.primary.main
  },
  fileDropAreaContent: {
    pointerEvents: 'none'
  },
  input: {
    opacity: 0,
    height: '0'
  },
  listItem: {
    paddingRight: '4px'
  }
}))
const AddFileField:React.FunctionComponent<AddFileFieldProps> = (props) => {
  const [state, setState] = React.useState<AddFileFieldState>({
    active: false
  })

  const onInputRef:React.Ref<HTMLInputElement> = React.useCallback((input:HTMLInputElement) => {
    if(input && !state.input) {
      setState(state => ({
        ...state,
        input
      }))
    }
  }, [state.input])
  React.useImperativeHandle(props.inputRef, () => {
    return state.input
  }, [props.inputRef, state.input])

  const onClickDropArea = () => {
    state.input?.click()
  }
  const onFileDropped = (event:React.ChangeEvent<HTMLInputElement>) => {
    const targetFiles = event.target.files
    if(targetFiles) {
      onFileAdded(targetFiles)
    }
  }
  const onFileDrag = (event:React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation()
    event.preventDefault()
    if(event.type === 'dragenter') {
      setState(state => ({...state, active:true}))
    } else if(event.type === 'dragleave') {
      setState(state => ({...state, active:false}))
    } else if(event.type === 'drop') {
      setState(state => ({...state, active:false}))
      const targetFiles = event.dataTransfer.files
      if(targetFiles) {
        onFileAdded(targetFiles)
      }
    }
  }
  const onFileAdded = (targetFiles:FileList) => {
    const {extensions} = props
    const accepted = (extensions?? ['png', 'jpg', 'jpeg'])
      .map(extension => {
        switch(extension) {
        case 'jpg':
        case 'jpeg': return 'image/jpeg' as string
        case 'png': return 'image/png' as string
        case 'pdf': return 'application/pdf' as string
        }
      })
    const files = new Array(targetFiles.length)
      .fill(undefined)
      .map((_, index) => targetFiles.item(index))
      .flatMap(file => file? [file]:[])
      .filter(file => accepted.includes(file.type))
    props.onChange([...props.values?? [], ...files])
    state.input && (state.input.value = '')
  }
  const onFileCleared = (index:number) => {
    props.onChange(props.values?.filter((_, i) =>
      i !== index
    )?? [])
  }

  const {label, values, extensions} = props
  const {active} = state
  const classes = useStyles()
  return (
    <div>
      <div
        className={[
          classes.fileDropArea,
          active? classes.fileDropAreaActive:''
        ].join(' ')}
        onClick={onClickDropArea}
        onDragEnter={onFileDrag}
        onDragLeave={onFileDrag}
        onDragOver={onFileDrag}
        onDrop={onFileDrag}
      >
        <div className={classes.fileDropAreaContent}>
          <Typography align='center'
            color={active? 'textPrimary':'textSecondary'}
          >
            {label}
          </Typography>
          <input type='file'
            ref={onInputRef}
            className={classes.input}
            accept={(extensions?? ['png', 'jpg', 'jpeg'])
              .map(ext => `.${ext}`)
              .join(',')
            }
            onChange={onFileDropped}
            multiple
          />
        </div>
      </div>
      <List>
        {values?.map((value, index) => (
          <ListItem key={index} dense classes={{root:classes.listItem}}>
            <ListItemIcon><ImageIcon/></ListItemIcon>
            <ListItemText
              primary={value.name}
            />
            <IconButton onClick={() => onFileCleared(index)}>
              <ClearIcon/>
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  )
}
type AddFileFieldProps = {
  label: string
  values?: File[]
  onChange: (values:File[]) => void
  extensions?: ('png' | 'jpg' | 'jpeg' | 'pdf')[]
  inputRef?: React.Ref<HTMLInputElement | undefined>
}
type AddFileFieldState = {
  active: boolean
  input?: HTMLInputElement
}

export default AddFileField