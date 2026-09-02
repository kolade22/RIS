export type FormulaInputs = Record<string, number | undefined>
export type Formula = { name: string; expression: string }
type Token = { kind: 'number' | 'identifier' | 'operator' | 'paren'; value: string }

const allowedVariables = new Set(['grossCharges', 'discounts', 'netCharges', 'cashPayments', 'cashRefunds', 'cashExpenses', 'openingCash', 'countedClosingCash', 'expectedCash', 'filmOpening', 'filmReceived', 'inboundTransfers', 'filmUsed', 'filmWasted', 'outboundTransfers', 'adjustments', 'countedFilmClosing'])
const operators = new Set(['+', '-', '*', '/', '(', ')'])

function tokenize(expression: string): Token[] {
  const tokens: Token[] = []; let index = 0
  while (index < expression.length) {
    if (/\s/.test(expression[index])) { index++; continue }
    const match = expression.slice(index).match(/^(\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*|[+\-*/()])/)
    if (!match) throw new Error('Formula contains an unsupported token')
    const value = match[1]; index += value.length
    tokens.push({ kind: /^\d/.test(value) ? 'number' : operators.has(value) ? value === '(' || value === ')' ? 'paren' : 'operator' : 'identifier', value })
  }
  return tokens
}

export function validateFormula(expression: string): void {
  const tokens = tokenize(expression); if (!tokens.length) throw new Error('Formula cannot be empty')
  let depth = 0
  tokens.forEach((token, index) => {
    if (token.kind === 'identifier' && !allowedVariables.has(token.value)) throw new Error(`Unknown formula variable: ${token.value}`)
    if (token.value === '(') depth++
    if (token.value === ')' && --depth < 0) throw new Error('Formula parentheses are unbalanced')
    const previous = tokens[index - 1]
    if (previous && token.kind === 'operator' && previous.kind === 'operator') throw new Error('Formula operators must be separated by values')
  })
  const lastToken = tokens[tokens.length - 1]
  if (depth !== 0 || tokens[0].value === ')' || ['+', '-', '*', '/'].includes(lastToken?.value ?? '')) throw new Error('Formula is incomplete')
}

export function evaluateFormula(expression: string, inputs: FormulaInputs): number {
  validateFormula(expression); const tokens = tokenize(expression); let position = 0
  const primary = (): number => { const token = tokens[position++]; if (!token) throw new Error('Formula is incomplete'); if (token.value === '(') { const value = additive(); if (tokens[position++]?.value !== ')') throw new Error('Formula parentheses are unbalanced'); return value }; if (token.kind === 'number') return Number(token.value); if (token.kind === 'identifier') return inputs[token.value] ?? 0; throw new Error('Formula is incomplete') }
  const multiplicative = (): number => { let value = primary(); while (['*', '/'].includes(tokens[position]?.value)) { const operator = tokens[position++].value; const right = primary(); if (operator === '/' && right === 0) throw new Error('Formula cannot divide by zero'); value = operator === '*' ? value * right : value / right }; return value }
  const additive = (): number => { let value = multiplicative(); while (['+', '-'].includes(tokens[position]?.value)) { const operator = tokens[position++].value; const right = multiplicative(); value = operator === '+' ? value + right : value - right }; return value }
  const result = additive(); if (position !== tokens.length) throw new Error('Formula contains an invalid expression'); return Math.round(result)
}

export const standardFormulas: readonly Formula[] = [
  { name: 'netCharges', expression: 'grossCharges - discounts' },
  { name: 'expectedCash', expression: 'openingCash + cashPayments - cashRefunds - cashExpenses' },
  { name: 'cashDiscrepancy', expression: 'countedClosingCash - expectedCash' },
  { name: 'expectedFilmClosing', expression: 'filmOpening + filmReceived + inboundTransfers - filmUsed - filmWasted - outboundTransfers + adjustments' },
  { name: 'filmDiscrepancy', expression: 'countedFilmClosing - expectedFilmClosing' }
]
