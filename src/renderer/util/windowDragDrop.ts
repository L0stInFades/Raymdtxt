interface TransferItemLike {
  kind?: string
  type?: string
}

interface TransferFileLike {
  path?: string
  type?: string
}

interface DataTransferLike {
  files?: ArrayLike<TransferFileLike> | Iterable<TransferFileLike> | null
  items?: ArrayLike<TransferItemLike> | Iterable<TransferItemLike> | null
  types?: ArrayLike<string> | Iterable<string> | null
}

const toArray = <T>(value: ArrayLike<T> | Iterable<T> | null | undefined): T[] => {
  if (!value) {
    return []
  }
  return Array.from(value)
}

const getTransferTypes = (dataTransfer?: DataTransferLike | null): string[] => toArray(dataTransfer?.types)

const getTransferItems = (dataTransfer?: DataTransferLike | null): TransferItemLike[] => toArray(dataTransfer?.items)

const getTransferFiles = (dataTransfer?: DataTransferLike | null): TransferFileLike[] => toArray(dataTransfer?.files)

export const hasFileTransfer = (dataTransfer?: DataTransferLike | null): boolean => {
  return getTransferTypes(dataTransfer).includes('Files')
}

export const isImageOnlyFileDrop = (dataTransfer?: DataTransferLike | null): boolean => {
  if (!hasFileTransfer(dataTransfer)) {
    return false
  }

  const fileItems = getTransferItems(dataTransfer).filter((item) => item?.kind === 'file')
  if (fileItems.length > 0) {
    return fileItems.every((item) => typeof item.type === 'string' && item.type.startsWith('image/'))
  }

  const files = getTransferFiles(dataTransfer)
  return files.length > 0 && files.every((file) => typeof file.type === 'string' && file.type.startsWith('image/'))
}

export const shouldUseWindowFileDropOverlay = (dataTransfer?: DataTransferLike | null): boolean => {
  return hasFileTransfer(dataTransfer) && !isImageOnlyFileDrop(dataTransfer)
}

export const getDroppedPaths = (dataTransfer?: DataTransferLike | null): string[] => {
  const seen = new Set<string>()
  const paths: string[] = []

  for (const file of getTransferFiles(dataTransfer)) {
    if (typeof file.path !== 'string' || !file.path || seen.has(file.path)) {
      continue
    }

    seen.add(file.path)
    paths.push(file.path)
  }

  return paths
}
