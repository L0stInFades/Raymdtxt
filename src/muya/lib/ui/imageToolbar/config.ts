// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/imageEdit... Remove this comment to see the full error message
import editIcon from '../../assets/pngicon/imageEdit/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/inline_im... Remove this comment to see the full error message
import inlineIcon from '../../assets/pngicon/inline_image/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/algin_lef... Remove this comment to see the full error message
import leftIcon from '../../assets/pngicon/algin_left/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/algin_cen... Remove this comment to see the full error message
import middleIcon from '../../assets/pngicon/algin_center/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/algin_rig... Remove this comment to see the full error message
import rightIcon from '../../assets/pngicon/algin_right/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../assets/pngicon/image_del... Remove this comment to see the full error message
import deleteIcon from '../../assets/pngicon/image_delete/2.png'

const icons = [
  {
    type: 'edit',
    tooltip: 'Edit Image',
    icon: editIcon,
  },
  {
    type: 'inline',
    tooltip: 'Inline Image',
    icon: inlineIcon,
  },
  {
    type: 'left',
    tooltip: 'Align Left',
    icon: leftIcon,
  },
  {
    type: 'center',
    tooltip: 'Align Middle',
    icon: middleIcon,
  },
  {
    type: 'right',
    tooltip: 'Align Right',
    icon: rightIcon,
  },
  {
    type: 'delete',
    tooltip: 'Remove Image',
    icon: deleteIcon,
  },
]

export default icons
