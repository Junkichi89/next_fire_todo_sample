export const FILTERINGSTATUSOPTIONS = [
  { text: '- - - - - - -', value: 'NONE' },
  { text: 'NOT STARTED', value: 'NOT STARTED' },
  { text: 'DOING', value: 'DOING' },
  { text: 'DONE', value: 'DONE' }
]

export const STATUSOPTIONS = FILTERINGSTATUSOPTIONS.flatMap(option => {
  return option.value !== 'NONE' ? {...option} : []
})

export const FILTERINGPRIORITYOPTIONS = [
  { text: '- - - - - - -', value: 'None' },
  { text: 'Low', value: 'Low' },
  { text: 'Middle', value: 'Middle' },
  { text: 'High', value: 'High' }
]

export const PRIORITYOPTIONS = FILTERINGPRIORITYOPTIONS.flatMap(option => {
  return option.value !== 'None' ? { ...option } : []
})