export const conjuctJoin = (words:string[]) =>
  [words.slice(0, words.length - 1).join(', '), words.slice(words.length - 1)].filter(sentence => sentence !== '').join(' and ')

export const pluralize = (
  amount: number | string,
  verb: string,
  option?: {hideAmount?:boolean, determiner?:boolean}
) => {
  const number = typeof amount === 'string'? parseInt(amount):amount
  return `${
    option?.hideAmount
      ? ''
      : (number === 1 && option?.determiner
          ? ['a', 'e', 'i', 'o', 'u'].some((letter) => verb.startsWith(letter))
            ? 'an'
            : 'a'
          : amount
        ) + ' '
  }${
    number <= 1
      ? verb
      : verb.endsWith('y') &&
        !['a', 'e', 'i', 'o', 'u'].some((letter) => verb.endsWith(`${letter}y`))
      ? verb.replace(/y$/, 'ies')
      : verb + 's'
  }`
}

export const displayCurrency = (
  number: number,
  option?: {decimal?:number, precision?:number}
):string | undefined => {
  let decimal = 0
  if (option?.decimal) {
    decimal = option.decimal
  } else if (option?.precision) {
    const rounded = Math.floor(number).toString()
    decimal = option.precision - rounded.length
  }
  const regexp = '\\d(?=(\\d{3})+' + (decimal > 0 ? '\\.' : '$') + ')'
  return (number > 0
    ? number.toFixed(Math.max(0, ~~decimal))
    : number?.toString() ?? ''
  ).replace(new RegExp(regexp, 'g'), '$&,')
}
