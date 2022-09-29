import { ChangeEvent, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'

import {
  Box,
  Container,
  CssBaseline,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { styled } from '@mui/system'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import SearchIcon from '@mui/icons-material/Search'
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { db } from '../firebaseConfig'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { parseTimestampToDate } from '../utils/DataFormat'
import { useRecoilValue } from 'recoil'
import { isLoginState, uidState } from '../atoms'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const [todos, setTodos] = useState([
    {
      id: '',
      title: '',
      status: '',
      priority: '',
      create: '',
      update: '',
      isDraft: false
    }
  ])
  const [filteringStatus, setFilteringStatus] = useState('NONE')
  const [filteringPriority, setFilteringPriority] = useState('None')
  const [sort, setSort] = useState('')
  // ソートはデフォルトが昇順になっている
  const [keyword, setKeyword] = useState('')
  const [switchTodos, setSwitchTodos] = useState('all')

  const router = useRouter()
  const isLogin = useRecoilValue(isLoginState)
  const loginUid = useRecoilValue(uidState)

  useEffect(() => {
    if (isLogin === false) {
      router.push('/welcome')
    }
  }, [isLogin])


  const q = query(
    collection(db, 'todos'),
    where('isDraft', '==', false),
    where('isTrash', '==', false),
    orderBy('create')
  )

  useEffect(() => {
    const unSub = onSnapshot(q, (querySnapshot) => {
      setTodos(
        querySnapshot.docs.map((todo) => (
          {
          id: todo.data().id,
          title: todo.data().title,
          status: todo.data().status,
          priority: todo.data().priority,
          create: parseTimestampToDate(todo.data().create, '-'),
          update: todo.data().update ? parseTimestampToDate(todo.data().update, '-') : '更新中',
          isDraft: todo.data().isDraft,
          isTrash: todo.data().isTrash,
          author: todo.data().author
        }))
      )
    })
    return () => unSub()
  }, [])

  const filteringStatusChange = (event: SelectChangeEvent) => {
    setFilteringStatus(event.target.value as string)
  }
  const filteringPriorityChange = (event: SelectChangeEvent) => {
    setFilteringPriority(event.target.value as string)
  }
  const resetClick = () => {
    setFilteringStatus('NONE')
    setFilteringPriority('None')
    setKeyword('')
  }

  const trashTodo = (id: string) => {
    ;(async () => {
      await updateDoc(doc(db, 'todos', id), {
        isTrash: true
      })
    })()
  }

  const keywordChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setKeyword(event.target.value as string)
  }

  const changeStatus = (e: SelectChangeEvent, id: string) => {
    const status = e.target.value
    updateDoc(doc(db, 'todos', id), {
      status,
      update: serverTimestamp()
    })
  }

  const changePriority = (e: SelectChangeEvent, id: string) => {
    const priority = e.target.value
    updateDoc(doc(db, 'todos', id), {
      priority,
      update: serverTimestamp()
    })
  }
  
  const changeSort = (e: SelectChangeEvent) => {
    setSort(e.target.value)

    if (e.target.value === 'asc') {
      setTodos(todos.sort((a, b) => new Date(a.create).getTime() - new Date(b.create).getTime()))
    } else {
      setTodos(todos.sort((a, b) => new Date(b.create).getTime() - new Date(a.create).getTime()))
    }
  }

  const switchClick = () => {
    if (switchTodos === 'all') {
      setSwitchTodos('my todo')
    } else {
      setSwitchTodos('all')
    }
  }

  const STATUSOPTIONS = [{ text: '- - - - - - -', value:'NONE'},  {text: 'NOT STARTED', value:'NOT STARTED'}, {text: 'DOING', value: 'DOING'}, {text: 'DONE', value: 'DONE'} ]

  return (
    <>
      <Container
        component="main"
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          }
        }}
      >
        <CssBaseline />
        <Typography component="h1" variant="h4" mt={3} mb={2} sx={{ fontWeight: 'bold' }}>
          TODO LIST
        </Typography>
        <Box mb={3} sx={{ display: 'flex', overflowX: 'auto' }}>
          <Box mr={3} sx={{ width: '190px' }}>
            <Typography variant="h6">SEARCH</Typography>
            <Paper
              component="form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid black',
                borderRadius: '10px',
                boxShadow: 'none',
                marginTop: '16px',
                marginBottom: '8px'
              }}
            >
              <InputBase
                onChange={(e) => keywordChange(e)}
                sx={{ ml: 1, flex: 1, fontWeight: 'bold' }}
                placeholder="Text"
                inputProps={{ 'aria-label': 'search todo text' }}
              />
              <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>
          <Box mr={3} sx={{ width: '190px' }}>
            <Typography variant="h6">STATUS</Typography>
            <FormControl
              fullWidth
              sx={{
                border: '1px solid black',
                borderRadius: '10px',
                marginTop: '16px',
                marginBottom: '8px',
                height: '50px'
              }}
            >
              <Select value={filteringStatus} onChange={filteringStatusChange}>
                {STATUSOPTIONS.map(({value, text}) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box mr={3} sx={{ width: '190px' }}>
            <Typography variant="h6">PRIORITY</Typography>
            <FormControl
              fullWidth
              sx={{
                marginTop: '16px',
                marginBottom: '8px',
                border: '1px solid black',
                borderRadius: '10px',
                height: '50px'
              }}
            >
              <Select value={filteringPriority} onChange={filteringPriorityChange}>
                <MenuItem value="None">- - - - - - -</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Middle">Middle</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            mr={2}
            sx={{
              width: '190px',
              display: 'flex',
              alignItems: 'flex-end',
              marginBottom: '8px'
            }}
          >
            <ResetBtn onClick={resetClick}>RESET</ResetBtn>
          </Box>
          <Box
            mr={3}
            sx={{
              width: '350px',
              display: 'flex',
              alignItems: 'flex-end',
              marginBottom: '8px'
            }}
          >
            <ResetBtn onClick={switchClick} sx={{ background: '#78D2E3', '&:hover': { background: '#78C2E3' } }}>
              {switchTodos === 'all' ? '自分のTodoのみを表示' : '全てのTodoを表示'}
            </ResetBtn>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Box
              mr={2}
              sx={{
                background: '#F6E05E',
                border: '8px solid #F6E05E',
                borderRadius: '30px',
                height: '50px',
                width: '50px',
                '&:hover': {
                  background: '#ccb94e',
                  borderColor: '#ccb94e',
                  color: 'white'
                }
              }}
            >
              <Link href="/delete">
                <a>
                  <RestoreFromTrashOutlinedIcon sx={icon} />
                </a>
              </Link>
            </Box>
            <Box
              mr={2}
              sx={{
                background: '#FED7E2',
                border: '8px solid #FED7E2',
                borderRadius: '30px',
                height: '50px',
                width: '50px',
                '&:hover': {
                  background: '#d4b2bb',
                  borderColor: '#d4b2bb',
                  color: 'white'
                }
              }}
            >
              <Link href="/draft">
                <a>
                  <SaveAsIcon sx={icon} />
                </a>
              </Link>
            </Box>
            <Box
              sx={{
                background: '#68D391',
                border: '8px solid #68D391',
                borderRadius: '30px',
                height: '50px',
                width: '50px',
                '&:hover': {
                  background: '#55ab76',
                  borderColor: '#55ab76',
                  color: 'white'
                }
              }}
            >
              <Link href="/createTodo">
                <a>
                  <OpenInNewIcon sx={icon} />
                </a>
              </Link>
            </Box>
          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ background: '#68D391' }}>
                <TableCell sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                      Task
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={sort}
                      label="Age"
                      onChange={(e: SelectChangeEvent) => changeSort(e)}
                      sx={{ fontSize: '20px', fontWeight: 'bold' }}
                    >
                      <MenuItem value="asc">昇順</MenuItem>
                      <MenuItem value="desc">降順</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Priority
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Create
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Update
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todos.map((todo: any) => {
                if (
                  (switchTodos === 'my todo' ? todo.author === loginUid : true) &&
                  todo.title.match(keyword) &&
                  (filteringStatus === todo.status || filteringStatus === 'NONE') &&
                  (filteringPriority === todo.priority || filteringPriority === 'None')
                ) {
                  return (
                    <TableRow
                      key={todo.id}
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0
                        }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                        <Link href={`/detail?id=${todo.id}`}>
                          <a>{todo.title}</a>
                        </Link>
                      </TableCell>
                      <TableCell align="right">
                        <FormControl fullWidth>
                          <Select
                            value={todo.status ?? ''}
                            onChange={(e: SelectChangeEvent) => changeStatus(e, todo.id)}
                            sx={{
                              border: '2px solid #EC7272',
                              borderRadius: '15px',
                              textAlign: 'left',
                              height: '50px'
                            }}
                          >
                            <MenuItem value="NOT STARTED">NOT STARTED</MenuItem>
                            <MenuItem value="DOING">DOING</MenuItem>
                            <MenuItem value="DONE">DONE</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <FormControl fullWidth>
                          <Select
                            value={todo.priority ?? ''}
                            onChange={(e: SelectChangeEvent) => changePriority(e, todo.id)}
                            sx={{
                              border: '2px solid #EC7272',
                              borderRadius: '15px',
                              textAlign: 'left',
                              height: '50px'
                            }}
                          >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Middle">Middle</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {todo.create}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {todo.update}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          href={`editTodo?id=${todo.id}`}
                          sx={{
                            '&:hover': {
                              background: 'gray',
                              color: 'white'
                            }
                          }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton
                          sx={{
                            '&:hover': {
                              background: 'gray',
                              color: 'white'
                            }
                          }}
                          onClick={() => trashTodo(todo.id)}
                        >
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  )
}

const ResetBtn = styled('button')({
  background: '#B5B5B5',
  border: '1px solid black',
  borderRadius: '50px',
  color: 'black',
  fontSize: '20px',
  fontWeight: 'bold',
  height: '50px',
  padding: '10px 20px',
  verticalAlign: 'bottom',
  '&:hover': {
    background: '#858585',
    color: 'white'
  }
})

const icon = {
  width: '100%',
  height: '100%'
}

export default Home
