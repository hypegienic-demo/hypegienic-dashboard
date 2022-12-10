const removeNull = (object:any):any => {
  if(Array.isArray(object)) {
    return object
      .map(removeNull)
      .flatMap(cleaned => cleaned? [cleaned]:[])
  } else if(
    typeof object === 'object' &&
    !(object instanceof Date)
  ) {
    return Object.keys(object)
      .filter(key => object[key] !== null)
      .reduce((cleaned, key) => ({
        ...cleaned,
        [key]: removeNull(object[key])
      }), {})
  } else {
    return object
  }
}
export const stringify = (parameter:Record<string, any>) => {
  return JSON.stringify(removeNull(parameter))
    .replace(/^\{|\}$/g, '')
    .replace(/\"([a-zA-Z0-9]+)\"\:/g, '$1:')
    .replace(/"\$([a-zA-Z0-9]+)"/g, '$$$1')
}