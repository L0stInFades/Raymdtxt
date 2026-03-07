// @vitest-environment node

import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { addDirectory, addFile, unlinkDirectory, unlinkFile } from '../../../src/renderer/store/treeCtrl'

const rootPath = path.join(path.sep, 'workspace')

const createRootTree = () => ({
  pathname: rootPath,
  name: 'workspace',
  isDirectory: true,
  isFile: false,
  isMarkdown: false,
  folders: [],
  files: [],
})

const createDirectory = (pathname) => ({
  pathname,
  name: path.basename(pathname),
  isDirectory: true,
  isFile: false,
  isMarkdown: false,
})

const createFile = (pathname) => ({
  pathname,
  name: path.basename(pathname),
  birthTime: 0,
  isDirectory: false,
  isFile: true,
  isMarkdown: pathname.endsWith('.md'),
})

const serializeTree = (tree) => ({
  pathname: tree.pathname,
  folders: tree.folders.map(serializeTree),
  files: tree.files.map((file) => file.pathname),
})

describe('treeCtrl invariants', () => {
  const sharedDirectories = [
    path.join(rootPath, 'docs'),
    path.join(rootPath, 'docs', 'api'),
    path.join(rootPath, 'assets'),
  ]

  const sharedFiles = [
    path.join(rootPath, 'README.md'),
    path.join(rootPath, 'assets', 'logo.md'),
    path.join(rootPath, 'docs', 'guide.md'),
    path.join(rootPath, 'docs', 'api', 'endpoints.md'),
  ]

  const expectedTree = {
    pathname: rootPath,
    folders: [
      {
        pathname: path.join(rootPath, 'assets'),
        folders: [],
        files: [path.join(rootPath, 'assets', 'logo.md')],
      },
      {
        pathname: path.join(rootPath, 'docs'),
        folders: [
          {
            pathname: path.join(rootPath, 'docs', 'api'),
            folders: [],
            files: [path.join(rootPath, 'docs', 'api', 'endpoints.md')],
          },
        ],
        files: [path.join(rootPath, 'docs', 'guide.md')],
      },
    ],
    files: [path.join(rootPath, 'README.md')],
  }

  const insertionOrders = [
    {
      directories: sharedDirectories,
      files: sharedFiles,
    },
    {
      directories: [...sharedDirectories].reverse(),
      files: [...sharedFiles].reverse(),
    },
    {
      directories: [sharedDirectories[2], sharedDirectories[0], sharedDirectories[1]],
      files: [sharedFiles[2], sharedFiles[0], sharedFiles[3], sharedFiles[1], sharedFiles[0]],
    },
  ]

  for (const [index, order] of insertionOrders.entries()) {
    it(`builds a deterministic tree regardless of insertion order #${index + 1}`, () => {
      const tree = createRootTree()

      for (const directoryPath of order.directories) {
        addDirectory(tree, createDirectory(directoryPath))
      }

      for (const filePath of order.files) {
        addFile(tree, createFile(filePath))
      }

      expect(serializeTree(tree)).toEqual(expectedTree)
    })
  }

  it('removes only the requested file and directory subtree', () => {
    const tree = createRootTree()

    for (const directoryPath of sharedDirectories) {
      addDirectory(tree, createDirectory(directoryPath))
    }

    for (const filePath of sharedFiles) {
      addFile(tree, createFile(filePath))
    }

    unlinkFile(tree, createFile(path.join(rootPath, 'docs', 'guide.md')))
    unlinkDirectory(tree, createDirectory(path.join(rootPath, 'assets')))

    expect(serializeTree(tree)).toEqual({
      pathname: rootPath,
      folders: [
        {
          pathname: path.join(rootPath, 'docs'),
          folders: [
            {
              pathname: path.join(rootPath, 'docs', 'api'),
              folders: [],
              files: [path.join(rootPath, 'docs', 'api', 'endpoints.md')],
            },
          ],
          files: [],
        },
      ],
      files: [path.join(rootPath, 'README.md')],
    })
  })
})
