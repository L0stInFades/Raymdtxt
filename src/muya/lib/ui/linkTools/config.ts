// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/unlink/2.... Remove this comment to see the full error message
import unlinkIcon from '../../assets/pngicon/unlink/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/link_jump... Remove this comment to see the full error message
import linkJumpIcon from '../../assets/pngicon/link_jump/2.png'

const icons = [
  {
    type: 'unlink',
    icon: unlinkIcon,
  },
  {
    type: 'jump',
    icon: linkJumpIcon,
  },
]

export default icons
