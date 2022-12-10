import * as React from 'react'

export const highlightQuery = (
  paragraph: string,
  query: string,
  color: string,
  options?: {ignored?:string}
) => {
  const ignoring = options?.ignored
    ? `[${options.ignored}]*`
    : ''
  const regexp = query && new RegExp(query
    .split('')
    .map(char =>
      /\W/.test(char)? `${ignoring}\\${char}`:`${ignoring}${char}`
    )
    .join(''),
    'gi'
  )
  const found = paragraph.match(regexp)
  return found
    ? paragraph
        .split(regexp)
        .reduce(
          (content, notQuery, index) => index === 0
            ? (
                <>
                  {notQuery}
                </>
              )
            : (
                <>
                  {content}
                  <span style={{color}}>{found[index - 1]}</span>
                  {notQuery}
                </>
              ),
          <></>
        )
    : paragraph
}