import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import { outputFile } from 'fs-extra'

import baseConfig from './base-config'
import dev from './dev'
import lint from './lint'
import prepublishOnly from './prepublish-only'

export default {
  allowedMatches: [
    'artifacts',
    'assets',
    'background.js',
    'content.js',
    'config.json',
    'icon.png',
    'index.spec.js',
    'options.html',
    'popup.html',
    'options.js',
    'popup.js',
    'model',
  ],
  commands: {
    dev: {
      arguments: '[target]',
      handler: dev,
    },
    prepublishOnly,
    source: () => execa.command('git archive --output=source.zip HEAD'),
  },
  depcheckConfig: {
    parsers: {
      '**/*.scss': depcheckParserSass,
    },
  },
  deployAssets: [
    {
      label: 'Extension',
      path: 'extension.zip',
    },
  ],
  deployEnv: {
    GOOGLE_CLIENT_ID: '${{ secrets.GOOGLE_CLIENT_ID }}',
    GOOGLE_CLIENT_SECRET: '${{ secrets.GOOGLE_CLIENT_SECRET }}',
    GOOGLE_REFRESH_TOKEN: '${{ secrets.GOOGLE_REFRESH_TOKEN }}',
  },
  deployPlugins: [
    [
      packageName`@semantic-release/exec`,
      {
        prepareCmd: 'yarn prepublishOnly',
      },
    ],
    [
      packageName`semantic-release-chrome`,
      {
        asset: 'extension.zip',
        extensionId: baseConfig.chromeExtensionId,
        target: 'draft',
      },
    ],
  ],
  editorIgnore: ['.eslintrc.json', 'dist'],
  gitignore: ['/.eslintrc.json', '/artifacts', '/dist', 'source.zip'],
  isLockFileFixCommitType: true,
  lint,
  prepare: () =>
    outputFile(
      '.eslintrc.json',
      JSON.stringify(
        {
          extends: packageName`@dword-design/eslint-config`,
          globals: {
            browser: 'readonly',
          },
        },
        undefined,
        2
      )
    ),
  readmeInstallString: endent`
    ## Recommended setup
    * Node.js 12.16.0
    * Yarn 1.21.1

    ## Install
    \`\`\`bash
    $ yarn --frozen-lockfile
    \`\`\`

    ## Running a development server
    \`\`\`bash
    $ yarn dev [target]
    \`\`\`
    Available targets are \`firefox\` and \`chrome\`. Default is \`firefox\`.

    ## Building the extension for upload
    \`\`\`bash
    $ yarn prepublishOnly
    \`\`\`

    ## Archiving the source for upload
    \`\`\`bash
    $ yarn source
    \`\`\`
  `,
}
