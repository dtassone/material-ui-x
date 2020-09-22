import typescript from 'rollup-plugin-typescript2';
import { generateReleaseInfo } from '@material-ui/x-license';
import cleaner from 'rollup-plugin-cleaner';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import command from 'rollup-plugin-command';
import pkg from './package.json';

// dev build if watching, prod build if not
const production = !process.env.ROLLUP_WATCH;
export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index-esm.js',
        format: 'esm',
        sourcemap: !production,
      },
      {
        file: 'dist/index-cjs.js',
        format: 'cjs',
        sourcemap: !production,
      },
    ],

    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      replace({
        __RELEASE_INFO__: generateReleaseInfo(),
      }),
      resolve({
        resolveOnly: [/^@material-ui\/x-.*$/], // we bundle x-license and x-grid-modules
      }),
      production &&
        cleaner({
          targets: ['./dist/'],
        }),
      typescript(),
      !production && sourceMaps(),
      production && terser(),
    ],
  },
  {
    input: './dist/index.d.ts',
    output: [{ file: 'dist/x-grid.d.ts', format: 'es' }],
    plugins: [
      dts(),
      !production && sourceMaps(),
      command([`rm -f ./dist/XGrid*`, `rm -f ./dist/index.d.ts `], {
        exitOnFail: true,
        wait: true,
      }),
    ],
  },
];
