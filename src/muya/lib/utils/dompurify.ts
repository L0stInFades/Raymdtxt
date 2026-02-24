// @ts-expect-error TS(7016): Could not find a declaration file for module 'domp... Remove this comment to see the full error message
import DOMPurify from 'dompurify'

const { sanitize, isValidAttribute } = DOMPurify

export { isValidAttribute }

export default sanitize
