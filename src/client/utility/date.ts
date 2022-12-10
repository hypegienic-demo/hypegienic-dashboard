import {DateTime} from 'luxon'

import {pluralize} from './string'

export const displayDate = (date:Date, format = 'MMM d, yyyy') =>
  DateTime.fromJSDate(date).toFormat(format)

export const displayDuration = (milliseconds:number) => {
  const weeks = milliseconds / (7 * 24 * 60 * 60 * 1000)
  if(weeks >= 1) {
    return pluralize(Math.floor(weeks), 'week') + ' ago'
  }
  const days = milliseconds / (24 * 60 * 60 * 1000)
  if(days >= 1) {
    return pluralize(Math.floor(days), 'day') + ' ago'
  }
  const hours = milliseconds / (60 * 60 * 1000)
  if(hours >= 1) {
    return pluralize(Math.floor(hours), 'hour') + ' ago'
  }
  const minutes = milliseconds / (60 * 1000)
  if(minutes >= 1) {
    return pluralize(Math.floor(minutes), 'minute') + ' ago'
  } else {
    return 'just now'
  }
}